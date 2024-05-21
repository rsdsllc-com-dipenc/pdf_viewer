import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';
// import { PDFViewer } from 'https://mozilla.github.io/pdf.js/web/viewer.mjs';

const pdfViewer = new PDFViewer({
  container: document.getElementById('pdf-viewer'),
});

const fileInput = document.getElementById('file-input');

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file.type === 'application/pdf') {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const pdfData = new Uint8Array(fileReader.result);
      pdfjsLib.getDocument({ data: pdfData }).promise.then((pdf) => {
        renderPDF(pdf);
      });
    };
    fileReader.readAsArrayBuffer(file);
  }
});

const renderPDF = async (pdf) => {
  pdfViewer.setDocument(pdf);
  const numPages = pdf.numPages;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();
    const textItems = textContent.items;
    highlightText(textItems, viewport);
    pdfViewer.getPageView(i).setPdfPage(page);
  }

  pdfViewer.updateView();
};

const highlightText = (textItems, viewport) => {
  const canvasContainer = pdfViewer.getCanvas();
  const context = canvasContainer.getContext('2d');

  textItems.forEach((item) => {
    const text = item.str.toLowerCase();
    if (text.includes('bookmark')) {
      const { x, y, width, height } = item.transform(viewport.transform);
      context.fillStyle = 'rgba(255, 192, 203, 0.5)';
      context.fillRect(x, y, width, height);
    }
  });
};
