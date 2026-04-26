'use strict';

const uniID = require('uni-id');
const config = require('./config.js');
const db = uniCloud.database();
const dbCmd = db.command;
const collection = db.collection('curtain_preview_record');
const sourceCollection = db.collection('curtain_preview_source_file');
const pointAccountCollection = db.collection('curtain_point_account');
const pointFlowCollection = db.collection('curtain_point_flow');

const DEFAULT_MODEL = 'gemini-3.1-flash-image-preview';
const API_URL = 'https://api.apiyi.com/v1/chat/completions';
const MAX_RESULT_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const BLOCKED_HOSTNAMES = new Set(['localhost', 'localhost.localdomain', 'local', 'host.docker.internal']);
const BLOCKED_HOSTNAME_SUFFIXES = ['.local', '.internal', '.intranet', '.lan', '.home', '.corp'];
const RENDER_POINTS_COST = 1;

function createError(message, code = 'CURTAIN_PREVIEW_GENERATE_FAILED') {
	const error = new Error(message);
	error.code = code;
	return error;
}

function normalizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function isHttpUrl(value) {
	return /^https?:\/\//i.test(normalizeString(value));
}

function isLocalDebugHost(hostname) {
	const normalizedHostname = normalizeString(hostname).toLowerCase();
	return normalizedHostname === '127.0.0.1' || normalizedHostname === 'localhost';
}

function isBspAppCloudStorageUrl(parsedUrl) {
	const hostname = normalizeString(parsedUrl && parsedUrl.hostname).toLowerCase();
	const pathname = normalizeString(parsedUrl && parsedUrl.pathname);
	return hostname.endsWith('.cdn.bspapp.com') && pathname.startsWith('/cloudstorage/');
}

function ensureAllowedImageMimeType(mimeType) {
	const normalizedMimeType = normalizeString(mimeType).toLowerCase();

	if (!ALLOWED_IMAGE_MIME_TYPES.has(normalizedMimeType)) {
		throw createError(`仅支持以下图片类型: ${Array.from(ALLOWED_IMAGE_MIME_TYPES).join(', ')}`, 'INVALID_RESULT_IMAGE_MIME_TYPE');
	}

	return normalizedMimeType;
}

function ensureImageBufferWithinLimit(buffer) {
	if (!buffer || !buffer.length) {
		throw createError('生成图片内容为空', 'EMPTY_RESULT_IMAGE');
	}
	if (buffer.length > MAX_RESULT_IMAGE_BYTES) {
		throw createError(`生成图片大小不能超过${MAX_RESULT_IMAGE_BYTES}字节`, 'RESULT_IMAGE_TOO_LARGE');
	}
}

function isBlockedIpv4Hostname(hostname) {
	if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
		return false;
	}

	const parts = hostname.split('.').map((item) => Number(item));
	if (parts.some((item) => Number.isNaN(item) || item < 0 || item > 255)) {
		return true;
	}

	return parts[0] === 10
		|| parts[0] === 127
		|| (parts[0] === 169 && parts[1] === 254)
		|| (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
		|| (parts[0] === 192 && parts[1] === 168);
}

function isBlockedIpv6Hostname(parsedUrl, hostname) {
	const normalizedHostname = normalizeString(hostname).toLowerCase();
	const normalizedHost = normalizeString(parsedUrl && parsedUrl.host).toLowerCase();
	const normalizedHref = normalizeString(parsedUrl && parsedUrl.href).toLowerCase();

	return normalizedHost.startsWith('[')
		|| normalizedHostname.startsWith('[')
		|| normalizedHostname.endsWith(']')
		|| normalizedHostname.includes(':')
		|| normalizedHostname.includes('%')
		|| normalizedHref.includes('://[');
}

function validateRemoteImageUrl(url) {
	const normalizedUrl = normalizeString(url);
	let parsedUrl;

	try {
		parsedUrl = new URL(normalizedUrl);
	} catch (error) {
		throw createError('结果图片URL格式无效', 'INVALID_RESULT_IMAGE_URL');
	}

	if (parsedUrl.protocol !== 'https:') {
		throw createError('结果图片URL仅允许https协议', 'INVALID_RESULT_IMAGE_URL');
	}

	const hostname = normalizeString(parsedUrl.hostname).toLowerCase();
	if (!hostname) {
		throw createError('结果图片URL缺少主机名', 'INVALID_RESULT_IMAGE_URL');
	}
	if (isBlockedIpv6Hostname(parsedUrl, hostname)) {
		throw createError('结果图片URL主机不安全', 'UNSAFE_RESULT_IMAGE_URL');
	}
	if (BLOCKED_HOSTNAMES.has(hostname) || BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix)) || isBlockedIpv4Hostname(hostname)) {
		throw createError('结果图片URL主机不安全', 'UNSAFE_RESULT_IMAGE_URL');
	}

	return parsedUrl.toString();
}

function parseTimestampMs(value) {
	if (!value) {
		return 0;
	}
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : 0;
	}
	if (value instanceof Date) {
		return value.getTime();
	}
	if (typeof value.getTime === 'function') {
		const time = value.getTime();
		return Number.isFinite(time) ? time : 0;
	}
	if (typeof value.valueOf === 'function') {
		const rawValue = value.valueOf();
		if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
			return rawValue;
		}
	}
	if (typeof value === 'string') {
		const time = Date.parse(value);
		return Number.isNaN(time) ? 0 : time;
	}
	if (typeof value === 'object') {
		if (typeof value.$date === 'number') {
			return value.$date;
		}
		if (typeof value.$date === 'string') {
			const time = Date.parse(value.$date);
			return Number.isNaN(time) ? 0 : time;
		}
	}
	return 0;
}

function readContentLength(headers) {
	if (!headers) {
		return 0;
	}
	const rawValue = headers['content-length'] || headers['Content-Length'];
	const normalizedValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;
	const parsedValue = Number(normalizedValue);
	return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

function normalizeModel(model) {
	const normalizedModel = normalizeString(model);

	if (!normalizedModel) {
		return DEFAULT_MODEL;
	}
	if (normalizedModel !== DEFAULT_MODEL) {
		throw createError(`仅支持模型: ${DEFAULT_MODEL}`, 'INVALID_MODEL');
	}

	return normalizedModel;
}

function validateInput(event) {
	const backgroundFileId = normalizeString(event.backgroundFileId);
	const textureFileId = normalizeString(event.textureFileId);
	const backgroundSourceId = normalizeString(event.backgroundSourceId);
	const textureSourceId = normalizeString(event.textureSourceId);
	const prompt = normalizeString(event.prompt);
	const model = normalizeModel(event.model);

	if (!backgroundFileId) {
		throw createError('backgroundFileId不能为空', 'INVALID_BACKGROUND_FILE_ID');
	}
	if (!textureFileId) {
		throw createError('textureFileId不能为空', 'INVALID_TEXTURE_FILE_ID');
	}
	if (!backgroundSourceId) {
		throw createError('backgroundSourceId不能为空', 'INVALID_BACKGROUND_SOURCE_ID');
	}
	if (!textureSourceId) {
		throw createError('textureSourceId不能为空', 'INVALID_TEXTURE_SOURCE_ID');
	}
	if (!prompt) {
		throw createError('prompt不能为空', 'INVALID_PROMPT');
	}

	return {
		backgroundFileId,
		textureFileId,
		backgroundSourceId,
		textureSourceId,
		prompt,
		model
	};
}

async function getCurrentUser(event) {
	if (!event || !event.uniIdToken) {
		throw createError('请先登录后再生成预览图', 'AUTH_REQUIRED');
	}
	try {
		const payload = await uniID.checkToken(event.uniIdToken);
		if (payload.code && payload.code > 0) {
			throw createError('登录状态已失效，请重新登录', 'AUTH_INVALID');
		}
		return payload;
	} catch (error) {
		if (error && error.code === 'AUTH_INVALID') {
			throw error;
		}
		throw createError('登录状态已失效，请重新登录', 'AUTH_INVALID');
	}
}

async function getSourceRecord(sourceId) {
	const result = await sourceCollection.doc(sourceId).get();
	if (Array.isArray(result.data) && result.data.length > 0) {
		return result.data[0];
	}
	return null;
}

function ensureSourceRecord(record, uid, expectedKind, sourceId) {
	if (!record) {
		throw createError(`未找到${expectedKind}源文件记录`, 'SOURCE_RECORD_NOT_FOUND');
	}
	if (normalizeString(record.uid) !== normalizeString(uid)) {
		throw createError('源文件不属于当前登录用户，无法生成预览图', 'SOURCE_RECORD_OWNER_MISMATCH');
	}
	if (normalizeString(record.kind) !== expectedKind) {
		throw createError(`${expectedKind}源文件类型不匹配`, 'SOURCE_RECORD_KIND_MISMATCH');
	}
	if (!normalizeString(record.cloudPath)) {
		throw createError(`源文件记录缺少cloudPath: ${sourceId}`, 'SOURCE_RECORD_CLOUD_PATH_MISSING');
	}
	if (typeof record.used !== 'boolean') {
		throw createError(`源文件记录缺少used状态: ${sourceId}`, 'SOURCE_RECORD_USED_STATE_MISSING');
	}
	if (record.used) {
		throw createError(`${expectedKind}上传凭证已被使用`, 'SOURCE_TICKET_USED');
	}
	const expiresAtMs = parseTimestampMs(record.expiresAt);
	if (!expiresAtMs) {
		throw createError(`源文件记录缺少expiresAt: ${sourceId}`, 'SOURCE_RECORD_EXPIRES_AT_MISSING');
	}
	if (expiresAtMs <= Date.now()) {
		throw createError(`${expectedKind}上传凭证已过期`, 'SOURCE_TICKET_EXPIRED');
	}
}

function extractCloudPathFromFileId(fileId, expectedCloudPath = '') {
	const normalizedFileId = normalizeString(fileId);
	const trustedMarker = 'curtain-preview/source/';

	if (/^https?:\/\//i.test(normalizedFileId)) {
		let parsedUrl;
		try {
			parsedUrl = new URL(normalizedFileId);
		} catch (error) {
			throw createError('源文件fileID格式无效', 'INVALID_SOURCE_FILE_ID');
		}

		const fileIdParam = normalizeString(parsedUrl.searchParams.get('fileID') || parsedUrl.searchParams.get('fileId') || parsedUrl.searchParams.get('fileid'));
		const candidates = [fileIdParam, decodeURIComponent(parsedUrl.pathname || '')].filter(Boolean);
		for (let index = 0; index < candidates.length; index += 1) {
			const candidate = candidates[index];
			const markerIndex = candidate.indexOf(trustedMarker);
			if (markerIndex >= 0) {
				return normalizeString(candidate.slice(markerIndex).split(/[?#]/, 1)[0]);
			}
		}

		const normalizedExpectedCloudPath = normalizeString(expectedCloudPath);
		const expectedFileName = normalizeString(normalizedExpectedCloudPath.split('/').pop());
		const decodedFileReference = decodeURIComponent(normalizedFileId);

		if (isLocalDebugHost(parsedUrl.hostname) && normalizedExpectedCloudPath) {
			if (decodedFileReference.includes(normalizedExpectedCloudPath)) {
				return normalizedExpectedCloudPath;
			}
			if (expectedFileName && decodedFileReference.includes(expectedFileName)) {
				return normalizedExpectedCloudPath;
			}
		}

		if (isBspAppCloudStorageUrl(parsedUrl) && normalizedExpectedCloudPath) {
			return normalizedExpectedCloudPath;
		}
	}

	const markerIndex = normalizedFileId.indexOf(trustedMarker);

	if (markerIndex >= 0) {
		const trustedPath = normalizeString(normalizedFileId.slice(markerIndex).split(/[?#]/, 1)[0]);
		if (trustedPath) {
			return trustedPath;
		}
	}

	const match = /^cloud:\/\/[^/]+\/(.+)$/.exec(normalizedFileId);

	if (!match || !match[1]) {
		throw createError('源文件fileID格式无效', 'INVALID_SOURCE_FILE_ID');
	}

	return normalizeString(match[1]);
}

function ensureFileIdMatchesCloudPath(fileId, cloudPath, expectedKind) {
	const extractedCloudPath = extractCloudPathFromFileId(fileId, cloudPath);
	const normalizedCloudPath = normalizeString(cloudPath);

	if (extractedCloudPath !== normalizedCloudPath) {
		throw createError(`${expectedKind}文件与服务端签发路径不匹配`, 'SOURCE_FILE_PATH_MISMATCH');
	}
}

async function validateSourceOwnership(input, uid) {
	const backgroundRecord = await getSourceRecord(input.backgroundSourceId);
	const textureRecord = await getSourceRecord(input.textureSourceId);

	ensureSourceRecord(backgroundRecord, uid, 'background', input.backgroundSourceId);
	ensureSourceRecord(textureRecord, uid, 'texture', input.textureSourceId);
	ensureFileIdMatchesCloudPath(input.backgroundFileId, backgroundRecord.cloudPath, 'background');
	ensureFileIdMatchesCloudPath(input.textureFileId, textureRecord.cloudPath, 'texture');

	return {
		backgroundRecord,
		textureRecord
	};
}

async function consumeSourceTickets(records) {
	const uniqueRecords = [];
	const seenIds = new Set();

	records.forEach((record) => {
		const recordId = normalizeString(record && record._id);
		if (!recordId || seenIds.has(recordId)) {
			return;
		}
		seenIds.add(recordId);
		uniqueRecords.push({
			recordId,
			kind: normalizeString(record && record.kind) || 'source'
		});
	});

	await Promise.all(uniqueRecords.map(async ({ recordId, kind }) => {
		const updateResult = await sourceCollection.where({
			_id: recordId,
			used: false,
			expiresAt: dbCmd.gt(new Date())
		}).update({
			used: true
		});

		if (!updateResult || updateResult.updated !== 1) {
			throw createError(`${kind}上传凭证已失效，请重新上传源文件`, 'SOURCE_TICKET_USED');
		}
	}));
}

async function createRecord(data) {
	const record = {
		uid: data.uid,
		backgroundFileId: data.backgroundFileId,
		textureFileId: data.textureFileId,
		prompt: data.prompt,
		model: data.model || DEFAULT_MODEL,
		pointsCost: RENDER_POINTS_COST,
		status: 'processing'
	};
	const result = await collection.add(record);
	return {
		recordId: result.id,
		record
	};
}

async function updateRecord(recordId, data) {
	await collection.doc(recordId).update(data);
}

async function ensurePointAccount(uid) {
	const found = await pointAccountCollection.where({ uid }).get();
	if (Array.isArray(found.data) && found.data.length > 0) {
		return found.data[0];
	}
	const account = {
		uid,
		balance: 0,
		totalRecharge: 0,
		totalConsume: 0,
		status: true
	};
	const result = await pointAccountCollection.add(account);
	return {
		_id: result.id,
		...account
	};
}

async function ensureEnoughPoints(uid, amount) {
	const account = await ensurePointAccount(uid);
	if (Number(account.balance || 0) < Number(amount || 0)) {
		throw createError('点数不足，请先充值后再生成', 'POINTS_NOT_ENOUGH');
	}
	return account;
}

async function consumePointsAfterRenderSuccess(uid, renderRecordId, amount) {
	const account = await ensurePointAccount(uid);
	const currentBalance = Number(account.balance || 0);
	const consumeAmount = Number(amount || 0);
	if (currentBalance < consumeAmount) {
		throw createError('点数不足，无法完成扣减', 'POINTS_NOT_ENOUGH');
	}
	const balanceAfter = currentBalance - consumeAmount;

	await pointAccountCollection.doc(account._id).update({
		balance: balanceAfter,
		totalConsume: Number(account.totalConsume || 0) + consumeAmount
	});
	await pointFlowCollection.add({
		uid,
		type: 'consume',
		amount: consumeAmount,
		balanceAfter,
		bizType: 'render',
		bizId: renderRecordId,
		remark: '窗帘智能渲染成功扣点',
		status: true
	});

	return balanceAfter;
}

async function fetchSourceImageAsDataUrl(url) {
	const response = await uniCloud.httpclient.request(url, {
		method: 'GET'
	});
	if (response.status >= 400) {
		throw createError(`下载源图片失败，状态码：${response.status}`, 'SOURCE_IMAGE_FETCH_FAILED');
	}
	const contentLength = readContentLength(response.headers);
	if (contentLength > MAX_RESULT_IMAGE_BYTES) {
		throw createError(`源图片大小不能超过${MAX_RESULT_IMAGE_BYTES}字节`, 'SOURCE_IMAGE_TOO_LARGE');
	}
	const mimeType = ensureAllowedImageMimeType(normalizeString(response.headers && (response.headers['content-type'] || response.headers['Content-Type']) || 'image/png').split(';')[0]);
	const buffer = Buffer.isBuffer(response.data) ? response.data : Buffer.from(response.data);
	ensureImageBufferWithinLimit(buffer);
	return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function pickTempUrlItem(result, fileId) {
	if (!result) {
		return null;
	}
	if (Array.isArray(result)) {
		return result.find((item) => item.fileID === fileId || item.fileId === fileId) || null;
	}
	if (Array.isArray(result.fileList)) {
		return result.fileList.find((item) => item.fileID === fileId || item.fileId === fileId) || null;
	}
	if (Array.isArray(result.tempFileURL)) {
		return result.tempFileURL.find((item) => item.fileID === fileId || item.fileId === fileId) || null;
	}
	return null;
}

function extractTempUrl(item) {
	if (!item) {
		return '';
	}
	return normalizeString(item.tempFileURL || item.tempFileUrl || item.download_url || item.url);
}

async function getTempUrls(backgroundFileId, textureFileId) {
	if (isHttpUrl(backgroundFileId) && isHttpUrl(textureFileId)) {
		const backgroundParsedUrl = new URL(backgroundFileId);
		const textureParsedUrl = new URL(textureFileId);

		if (isLocalDebugHost(backgroundParsedUrl.hostname) || isLocalDebugHost(textureParsedUrl.hostname)) {
			return {
				backgroundUrl: await fetchSourceImageAsDataUrl(backgroundFileId),
				textureUrl: await fetchSourceImageAsDataUrl(textureFileId)
			};
		}

		return {
			backgroundUrl: backgroundFileId,
			textureUrl: textureFileId
		};
	}

	const result = await uniCloud.getTempFileURL({
		fileList: [backgroundFileId, textureFileId]
	});
	const backgroundItem = pickTempUrlItem(result, backgroundFileId);
	const textureItem = pickTempUrlItem(result, textureFileId);
	const backgroundUrl = extractTempUrl(backgroundItem);
	const textureUrl = extractTempUrl(textureItem);

	if (!backgroundUrl || !textureUrl) {
		throw createError('获取源文件临时地址失败', 'TEMP_URL_FETCH_FAILED');
	}

	return {
		backgroundUrl,
		textureUrl
	};
}

async function getSingleTempUrl(fileId) {
	if (!fileId) {
		return '';
	}
	try {
		const result = await uniCloud.getTempFileURL({
			fileList: [fileId]
		});
		const item = pickTempUrlItem(result, fileId);
		return extractTempUrl(item);
	} catch (error) {
		console.error('获取结果图临时地址失败', error);
		return '';
	}
}

function buildPayload({ backgroundUrl, textureUrl, prompt, model }) {
	return {
		model: model || DEFAULT_MODEL,
		modalities: ['text', 'image'],
		messages: [
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: prompt
					},
					{
						type: 'image_url',
						image_url: {
							url: backgroundUrl
						}
					},
					{
						type: 'image_url',
						image_url: {
							url: textureUrl
						}
					}
				]
			}
		]
	};
}

function ensureApiKey() {
	const apiKey = normalizeString(config.API_KEY || (typeof config.getApiKey === 'function' ? config.getApiKey() : ''));

	if (!apiKey || apiKey === 'YOUR_API_KEY') {
		throw createError('服务端未配置预览图生成API_KEY', 'API_KEY_NOT_CONFIGURED');
	}

	return apiKey;
}

async function requestPreview(payload) {
	const apiKey = ensureApiKey();
	const response = await uniCloud.httpclient.request(API_URL, {
		method: 'POST',
		contentType: 'json',
		dataType: 'json',
		timeout: 60000,
		headers: {
			Authorization: `Bearer ${apiKey}`
		},
		data: payload
	});

	if (response.status >= 400) {
		const message = normalizeString(response.data && (response.data.error && response.data.error.message || response.data.message))
			|| `预览图生成请求失败，状态码：${response.status}`;
		throw createError(message, 'PREVIEW_REQUEST_FAILED');
	}

	return response.data || {};
}

function parseDataUrl(dataUrl) {
	const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || '');
	if (!match) {
		throw createError('返回的dataUrl格式无效', 'INVALID_DATA_URL');
	}
	const mimeType = ensureAllowedImageMimeType(match[1]);
	const buffer = Buffer.from(match[2], 'base64');
	ensureImageBufferWithinLimit(buffer);
	return {
		mimeType,
		buffer
	};
}

function parseBase64(value) {
	const content = normalizeString(value);
	if (!content) {
		throw createError('返回的base64内容为空', 'EMPTY_BASE64_IMAGE');
	}
	const mimeType = ensureAllowedImageMimeType('image/png');
	const buffer = Buffer.from(content, 'base64');
	ensureImageBufferWithinLimit(buffer);
	return {
		mimeType,
		buffer
	};
}

function readUrlValue(value) {
	if (!value) {
		return '';
	}
	if (typeof value === 'string') {
		return normalizeString(value);
	}
	return normalizeString(value.url || value.imageUrl || value.image_url || value.downloadUrl);
}

function collectImageCandidates(source, bucket) {
	if (!source) {
		return;
	}
	// --- 新增：处理字符串内容中的 Markdown 图片格式 ---
    if (typeof source === 'string') {
        // 匹配 ![image](data:image/xxx;base64,xxxx) 或 ![image](https://xxx)
        const markdownRegex = /!\[.*?\]\((data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=]+|https?:\/\/[^\s)]+)\)/i;
        const match = source.match(markdownRegex);
        if (match && match[1]) {
            const val = match[1];
            if (val.startsWith('data:')) {
                bucket.push({ type: 'dataUrl', value: val });
            } else {
                bucket.push({ type: 'url', value: val });
            }
        }
        return;
    }
	if (Array.isArray(source)) {
		source.forEach((item) => collectImageCandidates(item, bucket));
		return;
	}
	if (typeof source !== 'object') {
		return;
	}

	const url = readUrlValue(source.url || source.image_url || source.imageUrl || source.output_url);
	if (url) {
		bucket.push({ type: 'url', value: url });
	}

	const dataUrl = normalizeString(source.dataUrl || source.data_url);
	if (dataUrl) {
		bucket.push({ type: 'dataUrl', value: dataUrl });
	}

	const base64 = normalizeString(source.base64 || source.b64);
	if (base64) {
		bucket.push({ type: 'base64', value: base64 });
	}

	if (source.image && typeof source.image === 'object') {
		collectImageCandidates(source.image, bucket);
	}
	if (source.message && typeof source.message === 'object') {
		collectImageCandidates(source.message, bucket);
	}
	if (source.content) {
		collectImageCandidates(source.content, bucket);
	}
	if (source.choices) {
		collectImageCandidates(source.choices, bucket);
	}
	if (source.data) {
		collectImageCandidates(source.data, bucket);
	}
	if (source.output) {
		collectImageCandidates(source.output, bucket);
	}
	if (source.images) {
		collectImageCandidates(source.images, bucket);
	}
}

function extractImageContent(responseData) {
	const candidates = [];
	collectImageCandidates(responseData, candidates);

	const preferred = candidates.find((item) => item.type === 'dataUrl')
		|| candidates.find((item) => item.type === 'base64')
		|| candidates.find((item) => item.type === 'url');

	if (!preferred) {
		throw createError('未从接口响应中解析到图片内容', 'IMAGE_CONTENT_NOT_FOUND');
	}

	return preferred;
}

function getFileExtension(mimeType) {
	switch (mimeType) {
		case 'image/jpeg':
			return 'jpg';
		case 'image/webp':
			return 'webp';
		case 'image/gif':
			return 'gif';
		default:
			return 'png';
	}
}

async function fetchImageBufferFromUrl(url) {
	const safeUrl = validateRemoteImageUrl(url);
	const response = await uniCloud.httpclient.request(safeUrl, {
		method: 'GET'
	});
	if (response.status >= 400) {
		throw createError(`下载生成图片失败，状态码：${response.status}`, 'RESULT_IMAGE_FETCH_FAILED');
	}
	const contentLength = readContentLength(response.headers);
	if (contentLength > MAX_RESULT_IMAGE_BYTES) {
		throw createError(`生成图片大小不能超过${MAX_RESULT_IMAGE_BYTES}字节`, 'RESULT_IMAGE_TOO_LARGE');
	}
	const mimeType = ensureAllowedImageMimeType(normalizeString(response.headers && (response.headers['content-type'] || response.headers['Content-Type']) || 'image/png').split(';')[0]);
	const buffer = Buffer.isBuffer(response.data) ? response.data : Buffer.from(response.data);
	ensureImageBufferWithinLimit(buffer);
	return {
		mimeType,
		buffer
	};
}

async function uploadResultImage(recordId, imageContent) {
	let imageData;

	if (imageContent.type === 'url') {
		imageData = await fetchImageBufferFromUrl(imageContent.value);
	} else if (imageContent.type === 'dataUrl') {
		imageData = parseDataUrl(imageContent.value);
	} else {
		imageData = parseBase64(imageContent.value);
	}

	ensureImageBufferWithinLimit(imageData.buffer);

	const ext = getFileExtension(imageData.mimeType);
	const cloudPath = `curtain-preview/${recordId}-${Date.now()}.${ext}`;
	const uploadResult = await uniCloud.uploadFile({
		cloudPath,
		fileContent: imageData.buffer
	});
	const resultFileId = normalizeString(uploadResult.fileID || uploadResult.fileId);
	const tempResultUrl = await getSingleTempUrl(resultFileId);

	return {
		resultFileId,
		resultUrl: tempResultUrl || normalizeString(uploadResult.fileURL || uploadResult.url)
	};
}

function buildSuccessResponse(recordId, recordData) {
	return {
		success: true,
		message: '窗帘预览图生成成功',
		errCode: 0,
		errMsg: '',
		recordId,
		status: 'success',
		backgroundFileId: recordData.backgroundFileId,
		textureFileId: recordData.textureFileId,
		resultFileId: recordData.resultFileId,
		resultUrl: recordData.resultUrl,
		model: recordData.model
	};
}

function buildFailResponse(recordId, error) {
	const message = error.message || '窗帘预览图生成失败';
	return {
		success: false,
		message,
		errCode: error.code || 'CURTAIN_PREVIEW_GENERATE_FAILED',
		errMsg: message,
		recordId,
		status: 'fail'
	};
}

exports.main = async (event) => {
	let recordId = '';

	try {
		const auth = await getCurrentUser(event || {});
		const input = validateInput(event || {});
		input.uid = auth.uid;
		const sourceRecords = await validateSourceOwnership(input, auth.uid);
		await ensureEnoughPoints(auth.uid, RENDER_POINTS_COST);
		await consumeSourceTickets([sourceRecords.backgroundRecord, sourceRecords.textureRecord]);
		const created = await createRecord(input);
		recordId = created.recordId;

		const { backgroundUrl, textureUrl } = await getTempUrls(input.backgroundFileId, input.textureFileId);
		await updateRecord(recordId, {
			backgroundUrl,
			textureUrl
		});

		const payload = buildPayload({
			backgroundUrl,
			textureUrl,
			prompt: input.prompt,
			model: input.model
		});
		const previewResponse = await requestPreview(payload);
		const imageContent = extractImageContent(previewResponse);
		const uploadResult = await uploadResultImage(recordId, imageContent);

		const successData = {
			backgroundFileId: input.backgroundFileId,
			textureFileId: input.textureFileId,
			prompt: input.prompt,
			model: input.model,
			pointsCost: RENDER_POINTS_COST,
			backgroundUrl,
			textureUrl,
			resultFileId: uploadResult.resultFileId,
			resultUrl: uploadResult.resultUrl,
			status: 'success',
			errorMessage: ''
		};

		await consumePointsAfterRenderSuccess(auth.uid, recordId, RENDER_POINTS_COST);
		await updateRecord(recordId, successData);
		return buildSuccessResponse(recordId, successData);
	} catch (error) {
		if (recordId) {
			try {
				await updateRecord(recordId, {
					status: 'fail',
					errorMessage: normalizeString(error.message) || '窗帘预览图生成失败'
				});
			} catch (updateError) {
				console.error('更新预览记录失败', updateError);
			}
		}
		return buildFailResponse(recordId, error);
	}
};
