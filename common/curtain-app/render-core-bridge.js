function callRenderCoreHook(target, hookName, payload) {
	if (!target || typeof target[hookName] !== 'function') {
		return false;
	}
	target[hookName](payload);
	return true;
}

module.exports = {
	callRenderCoreHook
};
