if (!pdfjsLib.getDocument || !pdfjsViewer.PDFPageView) {
  // eslint-disable-next-line no-alert
  alert("Please build the pdfjs-dist library using\n  `gulp dist-install`");
}

// The workerSrc property shall be specified.
//
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "../../node_modules/pdfjs-dist/build/pdf.worker.mjs";

// Some PDFs need external cmaps.
//
const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;

const DEFAULT_URL = "insurance.pdf";
const PAGE_TO_VIEW = 1;
const SCALE = 1.0;

const ENABLE_XFA = true;

const container = document.getElementById("pageContainer");

const eventBus = new pdfjsViewer.EventBus();

// Loading document.
const loadingTask = pdfjsLib.getDocument({
  url: DEFAULT_URL,
  cMapUrl: CMAP_URL,
  cMapPacked: CMAP_PACKED,
  enableXfa: ENABLE_XFA,
});

const pdfDocument = await loadingTask.promise;
// Document loaded, retrieving the page.
const pdfPage = await pdfDocument.getPage(PAGE_TO_VIEW);

// Creating the page view with default parameters.
const pdfPageView = new pdfjsViewer.PDFPageView({
  container,
  id: PAGE_TO_VIEW,
  scale: SCALE,
  defaultViewport: pdfPage.getViewport({ scale: SCALE }),
  eventBus,
});
// Associate the actual page with the view, and draw it.
pdfPageView.setPdfPage(pdfPage);
pdfPageView.draw();
