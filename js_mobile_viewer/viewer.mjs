if (!pdfjsLib.getDocument || !pdfjsViewer.PDFViewer) {
  alert("Please build the pdfjs-dist library using `gulp dist-install`");
}

const MAX_CANVAS_PIXELS = 0;
const TEXT_LAYER_MODE = 2;
const MAX_IMAGE_SIZE = 1024 * 1024;
const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;
const DEFAULT_URL = "insurance.pdf";
const DEFAULT_SCALE_DELTA = 1.1;
const MIN_SCALE = 0.25;
const MAX_SCALE = 10.0;
const DEFAULT_SCALE_VALUE = "auto";

pdfjsLib.GlobalWorkerOptions.workerSrc = "../../node_modules/pdfjs-dist/build/pdf.worker.mjs";

let pdfDocument = null;
let pdfViewer = null;
let pdfLinkService = null;
let pdfHistory = null;

async function openPDF(params) {
  if (pdfDocument) {
    await closePDF();
    return openPDF(params);
  }

  const url = params.url;
  setTitleUsingUrl(url);

  const loadingTask = pdfjsLib.getDocument({
    url,
    maxImageSize: MAX_IMAGE_SIZE,
    cMapUrl: CMAP_URL,
    cMapPacked: CMAP_PACKED,
  });

  loadingTask.onProgress = (progressData) => {
    updateProgress(progressData.loaded / progressData.total);
  };

  try {
    pdfDocument = await loadingTask.promise;
    pdfViewer.setDocument(pdfDocument);
    pdfLinkService.setDocument(pdfDocument);
    pdfHistory.initialize({ fingerprint: pdfDocument.fingerprints[0] });
    hideLoadingBar();
    setTitleUsingMetadata(pdfDocument);
  } catch (reason) {
    handleError(reason);
  }
}

function closePDF() {
  if (!pdfDocument) return Promise.resolve();

  const promise = pdfDocument.destroy();
  pdfDocument = null;

  pdfViewer.setDocument(null);
  pdfLinkService.setDocument(null, null);

  if (pdfHistory) pdfHistory.reset();

  return promise;
}

function setTitleUsingUrl(url) {
  const title = pdfjsLib.getFilenameFromUrl(url) || url;
  document.title = title;
  document.getElementById("title").textContent = title;
}

function setTitleUsingMetadata(pdf) {
  pdf.getMetadata().then(({ info, metadata }) => {
    const title = metadata?.has("dc:title") ? metadata.get("dc:title") : info?.Title;
    if (title && title !== "Untitled") {
      document.title = `${title} - ${document.title}`;
      document.getElementById("title").textContent = document.title;
    }
  });
}

function handleError(reason) {
  const errorMsg = reason instanceof pdfjsLib.InvalidPDFException
    ? "Invalid PDF"
    : reason instanceof pdfjsLib.MissingPDFException
      ? "Missing PDF"
      : "Unexpected Response";
  console.error(`${errorMsg}: ${reason.message}`);
  hideLoadingBar();
}

function updateProgress(level) {
  const percent = Math.round(level * 100);
  const loadingBar = document.getElementById("loadingBar");
  loadingBar.style.width = `${percent}%`;
}

function hideLoadingBar() {
  document.getElementById("loadingBar").style.display = "none";
}

function zoomIn() {
  let newScale = pdfViewer.currentScale;
  newScale = Math.min(MAX_SCALE, newScale * DEFAULT_SCALE_DELTA);
  pdfViewer.currentScaleValue = newScale;
}

function zoomOut() {
  let newScale = pdfViewer.currentScale;
  newScale = Math.max(MIN_SCALE, newScale / DEFAULT_SCALE_DELTA);
  pdfViewer.currentScaleValue = newScale;
}

function initUI() {
  const eventBus = new pdfjsViewer.EventBus();
  pdfLinkService = new pdfjsViewer.PDFLinkService({ eventBus });
  pdfHistory = new pdfjsViewer.PDFHistory({ eventBus, linkService: pdfLinkService });

  const container = document.getElementById("viewerContainer");
  pdfViewer = new pdfjsViewer.PDFViewer({
    container,
    eventBus,
    linkService: pdfLinkService,
    l10n: new pdfjsViewer.GenericL10n(),
    maxCanvasPixels: MAX_CANVAS_PIXELS,
    textLayerMode: TEXT_LAYER_MODE,
  });

  pdfLinkService.setViewer(pdfViewer);
  pdfLinkService.setHistory(pdfHistory);

  document.getElementById("previous").addEventListener("click", () => pdfViewer.currentPageNumber--);
  document.getElementById("next").addEventListener("click", () => pdfViewer.currentPageNumber++);
  document.getElementById("zoomIn").addEventListener("click", zoomIn);
  document.getElementById("zoomOut").addEventListener("click", zoomOut);

  document.getElementById("pageNumber").addEventListener("change", function () {
    pdfViewer.currentPageNumber = this.value | 0;
  });

  eventBus.on("pagesinit", () => {
    pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
  });

  eventBus.on("pagechanging", (evt) => {
    const page = evt.pageNumber;
    document.getElementById("pageNumber").value = page;
    document.getElementById("previous").disabled = page <= 1;
    document.getElementById("next").disabled = page >= pdfViewer.pagesCount;
  });
}

async function highlightWords(pageIndex, words) {
  const page = await pdfDocument.getPage(pageIndex);
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: pdfViewer.currentScale });
  const textLayerDiv = pdfViewer.getPageView(pageIndex - 1).textLayer.textLayerDiv;

  textContent.items.forEach((item) => {
    if (words.includes(item.str)) {
      const highlightDiv = document.createElement("div");
      highlightDiv.className = "highlight";
      highlightDiv.style.left = `${item.transform[4]}px`;
      highlightDiv.style.top = `${viewport.height - item.transform[5]}px`;
      highlightDiv.style.width = `${item.width * viewport.scale}px`;
      highlightDiv.style.height = `${item.height * viewport.scale}px`;
      highlightDiv.style.backgroundColor = "yellow";
      textLayerDiv.appendChild(highlightDiv);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await initUI();
  await openPDF({ url: DEFAULT_URL });
  await highlightWords(1, ["law"]);
  // await highlightWords(2, ["important"]);
});
