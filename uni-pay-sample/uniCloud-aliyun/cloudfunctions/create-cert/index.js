const fs = require('fs');
const crypto = require('crypto');
exports.main = async (event, context) => {
	// 生成密钥对
	const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
		modulusLength: 3072, // 密钥长度，不少于3072 
		publicKeyEncoding: {
			type: 'spki', // 公钥编码格式
			format: 'pem' // 公钥输出格式
		},
		privateKeyEncoding: {
			type: 'pkcs8', // 私钥编码格式
			format: 'pem' // 私钥输出格式
		}
	});
	// console.log('生成的公钥：', publicKey);
	// console.log('生成的私钥：', privateKey);
	if (!fs.existsSync(__dirname + '/cert')) {
		fs.mkdirSync(__dirname + '/cert');
	}
	fs.writeFileSync(__dirname + '/cert/public.pem', publicKey);
	fs.writeFileSync(__dirname + '/cert/private.pem', privateKey);
	// 将私钥转成一行字符串，换行用\n表示
	const privateKeyStr = privateKey.replace(/\n/g, '\\n');
	console.log("商户私钥（mchPrivateKey）：");
	console.log(privateKeyStr);
};