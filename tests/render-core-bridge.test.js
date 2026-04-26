const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { callRenderCoreHook } = require('../common/curtain-app/render-core-bridge');

test('callRenderCoreHook invokes child hook with payload when available', () => {
	const calls = [];
	const vm = {
		handlePageShow(payload) {
			calls.push(payload);
		}
	};

	const result = callRenderCoreHook(vm, 'handlePageShow', {
		source: 'page-on-show'
	});

	assert.equal(result, true);
	assert.deepEqual(calls, [{ source: 'page-on-show' }]);
});

test('callRenderCoreHook returns false when child hook is missing', () => {
	const result = callRenderCoreHook({}, 'handlePageShow', {
		source: 'page-on-show'
	});

	assert.equal(result, false);
});

test('frontend bridge exports an ESM helper for mp-weixin bundling', () => {
	const source = fs.readFileSync(
		path.join(__dirname, '..', 'common', 'curtain-app', 'frontend', 'render-core-bridge.js'),
		'utf8'
	);

	assert.match(source, /export function callRenderCoreHook\s*\(/);
});

test('render wrapper imports bridge from frontend bundle-friendly path', () => {
	const source = fs.readFileSync(
		path.join(__dirname, '..', 'pages', 'render', 'index.vue'),
		'utf8'
	);

	assert.match(source, /import\s+\{\s*callRenderCoreHook\s*\}\s+from\s+['"]@\/common\/curtain-app\/frontend\/render-core-bridge\.js['"]/);
	assert.doesNotMatch(source, /require\(['"]\.\.\/\.\.\/common\/curtain-app\/render-core-bridge\.js['"]\)/);
});
