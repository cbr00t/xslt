class App {
	constructor(e) { this.files = { xslt: {}, xml: {} } }
    run() {
		const header = this.header = $('#header'); this.progress = $('#progress');
		const fileChangeHandler = evt => {
			const elm = evt.currentTarget, file = this.files[elm.id];
			file.name = (elm.value || '').trim().split('\\').pop();
			const dataList = file.dataList = [];
			for (const file of elm.files) {
				const fr = new FileReader();
				fr.onload = evt => { const data = evt.currentTarget.result; dataList.push(data) };
				fr.onerror = evt => { alert(toJSONStr(evt.currentTarget)); console.error(evt) };
				fr.readAsText(file)
			}
		};
		header.find('#xml').on('change', evt => fileChangeHandler(evt)); header.find('#xslt').on('change', evt => fileChangeHandler(evt));
		header.find('#transform').jqxButton({ theme }).on('click', event => this.goruntuOlusturIstendi({ event }))
    }
	async goruntuOlusturIstendi(e) {
		const {header, progress} = this, divEtiket = progress.find('.etiket'), progressBar = progress.find('progress');
		divEtiket.html('Görüntü oluşturuluyor...'); progressBar.attr('value', null); header.addClass('disabled'); progress.removeClass('error jqx-hidden');
		await new $.Deferred(p => setTimeout(() => p.resolve(), 50));
		try {
			const {files} = this; let xmlDatas = files.xml.dataList || []; if (!xmlDatas.length) { throw { errorText: '<b>XML Dosya</b> veya <b>Dosyaları</b> seçilmelidir' } }
			const xmlList = xmlDatas.map(data => $.parseXML(data)); let xsltData = (files.xslt.dataList || [])[0];
			if (!xsltData) {
				const validDocTypesSet = asSet(['XSLT', 'xslt', 'xsltfile']), excludeTypesSet = asSet(['qrcode', 'QRCODE']);
				xsltData = Array.from(xmlList[0].documentElement.querySelectorAll('AdditionalDocumentReference'))
								?.find(elm =>
									!!elm.querySelector(`EmbeddedDocumentBinaryObject[mimeCode = "application/xml"]`) &&
									(!!validDocTypesSet[elm.querySelector('DocumentType')?.innerHTML] || !excludeTypesSet[elm.querySelector('DocumentType')?.innerHTML])
								)?.querySelector('EmbeddedDocumentBinaryObject')?.textContent;
                if (!xsltData) {
                    xxsltData = Array.from(xmlList[0].documentElement.querySelectorAll('AdditionalDocumentReference'))
								?.find(elm =>
									!!elm.querySelector(`EmbeddedDocumentBinaryObject[mimeCode = "application/CSTAdata+xml"]`) &&
									(!!validDocTypesSet[elm.querySelector('DocumentType')?.innerHTML] || !excludeTypesSet[elm.querySelector('DocumentType')?.innerHTML])
								)?.querySelector('EmbeddedDocumentBinaryObject')?.textContent
				}
			}
			if (!xsltData?.startsWith('<?xml')) { xsltData = Base64.decode(xsltData) }
			const xslt = $.parseXML(xsltData), xsltProcessor = new XSLTProcessor(); xsltProcessor.importStylesheet(xslt);
			await new $.Deferred(p => setTimeout(() => p.resolve(), 50)); progressBar.attr('max', xmlDatas.length);
			const divContainer = $('<div/>')[0]; let eDocCount = 0; progressBar.attr('value', eDocCount);
			for (const xml of xmlList) {
				const eDoc = xsltProcessor.transformToFragment(xml, document);
				if (eDocCount) {
					const elmPageBreak = $(`<div style="float: none;"><div style="page-break-after: always;"></div></div>`)[0];
					divContainer.lastElementChild.after(elmPageBreak); divContainer.lastElementChild.after(eDoc.querySelector('div'))
				}
				else { divContainer.append(eDoc) }
				eDocCount++; progressBar.attr('value', eDocCount)
			}
			await new $.Deferred(p => setTimeout(() => p.resolve(), 200)); progressBar.attr('value', null);
			await new $.Deferred(p => setTimeout(() => p.resolve(), 50));
			let newDocHTML = `<html><head>${divContainer.innerHTML}</head></html>`;
			const url = URL.createObjectURL(new Blob([newDocHTML], { type: 'text/html' })); this.openNewWindow(url);
			progress.addClass('jqx-hidden')
		}
		catch (ex) { divEtiket.html(ex.errorText || ex.responseText || ex.message || ex.toString()); progress.addClass('error') }
		finally { header.removeClass('disabled') }
	}
	openNewWindow(url, target, args) {
		const wnd = window.open(
			url, target || '_blank',
			args || `titlebar=1,menubar=0,toolbar=0,status=1,location=0,resizeable=1,directories=1,top=0,left=1,width=${screen.width - 13},height=${screen.height - 70}`
		);
		setTimeout(wnd => { if (wnd?.focus) { wnd.focus() } }, 10, wnd); return wnd
	}
	downloadData(data, fileName, contentType, newWindowFlag) {
		const a = document.createElement('a');
		if (window.URL && window.Blob && ('download' in a) && window.atob) {
			// Do it the HTML5 compliant way
			const blob = new Blob([data], { type: contentType || 'application/octet-stream' });
			const url = URL.createObjectURL(blob);
			a.href = url;
			a.download = fileName;
			if (newWindowFlag)
				a.target = '_blank'
			a.click()
			// URL.revokeObjectURL(url)
		}
	}
	downloadFile(url, fileName, contentType, newWindowFlag) {
		const a = document.createElement('a');
		if (window.URL && ('download' in a) && window.atob) {
			// Do it the HTML5 compliant way
			a.href = url;
			a.download = fileName;
			if (newWindowFlag)
				a.target = '_blank'
			a.click()
			// URL.revokeObjectURL(url)
		}
	}
	asSet(value) {
		if (!anArray) { return null }
		const isArray = window.$ ? $.isArray(anArray) : Array.isArray(anArray); if (!isArray) { return anArray }
		const result = {}; for (const key in anArray) { const item = anArray[key]; result[item] = true } return result
	}
}
