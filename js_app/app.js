const fileUpload = document.getElementById('file-upload');
const pdfCanvas = document.getElementById('pdf-canvas');
const textLayer = document.getElementById('text-layer');
const pdfContext = pdfCanvas.getContext('2d');
const highlightButton = document.getElementById('highlight-button');
const searchText = document.getElementById('search-text');
let pdfDoc = null;
let currentPage = 1;
let pdfScale = 1.5;

fileUpload.addEventListener('change', handleFileUpload);
highlightButton.addEventListener('click', () => {
    const text = searchText.value.trim();
    if (text) {
        highlightText(text);
    }
});

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        const arrayBuffer = e.target.result;
        loadPDF(arrayBuffer);
    };
    fileReader.readAsArrayBuffer(file);
}

function loadPDF(arrayBuffer) {
    pdfjsLib.getDocument(arrayBuffer).promise.then(pdf => {
        pdfDoc = pdf;
        renderPage(currentPage);
    }).catch(error => {
        console.error('Error loading PDF: ', error);
    });
}

function renderPage(pageNumber) {
    pdfDoc.getPage(pageNumber).then(page => {
        const viewport = page.getViewport({ scale: pdfScale });
        pdfCanvas.height = viewport.height;
        pdfCanvas.width = viewport.width;

        const renderContext = {
            canvasContext: pdfContext,
            viewport: viewport
        };

        page.render(renderContext).promise.then(() => {
            return page.getTextContent();
        }).then(textContent => {
            const textLayerDiv = document.createElement('div');
            textLayerDiv.className = 'textLayer';
            textLayerDiv.style.width = pdfCanvas.width + 'px';
            textLayerDiv.style.height = pdfCanvas.height + 'px';
            textLayer.innerHTML = '';
            textLayer.appendChild(textLayerDiv);

            pdfjsLib.renderTextLayer({
                textContent: textContent,
                container: textLayerDiv,
                viewport: viewport,
                textDivs: []
            });
        });
    });
}

function highlightText(text) {
    pdfDoc.getPage(currentPage).then(page => {
        page.getTextContent().then(textContent => {
            const viewport = page.getViewport({ scale: pdfScale });
            const textLayerDiv = document.querySelector('.textLayer');
            pdfjsLib.renderTextLayer({
                textContent: textContent,
                container: textLayerDiv,
                viewport: viewport,
                textDivs: []
            }).promise.then(() => {
                textLayerDiv.childNodes.forEach(textDiv => {
                    if (textDiv.textContent.includes(text)) {
                        textDiv.style.backgroundColor = 'yellow';
                    }
                });
            });
        });
    });
}
