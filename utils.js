var delimWS = '|', culture = 'tr-TR', animationType = 'fade', animationSlow = 'slow';
var theme = 'metro', wsDataType = 'json', wsPrefixTemp = '$$temp-';
var wsContentType = 'application/json';
var wsCharSet = 'utf-8;'
var wsContentTypeVeCharSet = `${wsContentType}; charset=${wsCharSet}`;
var md5Length = 32;

function asSet(anArray) {
	if (!anArray) { return null }
	const isArray = window.$ ? $.isArray(anArray) : Array.isArray(anArray); if (!isArray) { return anArray }
	const result = {}; for (const key in anArray) { const item = anArray[key]; result[item] = true } return result
}
