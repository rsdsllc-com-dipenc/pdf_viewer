import * as pdfjsLib from "../node_modules/pdfjs-dist/build/pdf.mjs";
import * as pdfjsViewer from "../node_modules/pdfjs-dist/web/pdf_viewer.mjs";

const container = document.getElementById("viewerContainer");
const eventBus = new pdfjsViewer.EventBus();
let pdfViewer;
let pdfDocument;

async function initializePDFViewer() {
  // Configure worker and other settings
  pdfjsLib.GlobalWorkerOptions.workerSrc = "../../node_modules/pdfjs-dist/build/pdf.worker.mjs";
  const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
  const CMAP_PACKED = true;
  const DEFAULT_URL = "insurance.pdf";
  const ENABLE_XFA = true;
  const SANDBOX_BUNDLE_SRC = new URL("../../node_modules/pdfjs-dist/build/pdf.sandbox.mjs", window.location);

  // Initialize services
  const pdfLinkService = new pdfjsViewer.PDFLinkService({ eventBus });
  const pdfFindController = new pdfjsViewer.PDFFindController({ eventBus, linkService: pdfLinkService });
  const pdfScriptingManager = new pdfjsViewer.PDFScriptingManager({ eventBus, sandboxBundleSrc: SANDBOX_BUNDLE_SRC });

  // Initialize PDF viewer
  pdfViewer = new pdfjsViewer.PDFViewer({
    container,
    eventBus,
    linkService: pdfLinkService,
    findController: pdfFindController,
    scriptingManager: pdfScriptingManager,
  });

  pdfLinkService.setViewer(pdfViewer);
  pdfScriptingManager.setViewer(pdfViewer);

  // Load document
  const loadingTask = pdfjsLib.getDocument({
    url: DEFAULT_URL,
    cMapUrl: CMAP_URL,
    cMapPacked: CMAP_PACKED,
    enableXfa: ENABLE_XFA,
  });

  pdfDocument = await loadingTask.promise;
  pdfViewer.setDocument(pdfDocument);
  pdfLinkService.setDocument(pdfDocument, null);
}

eventBus.on("pagesinit", () => {
  // Optional: Adjust viewer settings or perform initial search
  // pdfViewer.currentScaleValue = "page-width";
  // eventBus.dispatch("find", { type: "", query: "law", caseSensitive: false, highlightAll: true, phraseSearch: true });
});

async function searchAndLogOccurrences(doc) {
  const SEARCH_FOR = "law";
  const numPages = doc.numPages;
  let totalOccurrences = 0;

  for (let i = 1; i <= numPages; i++) {
    console.log(`# Scanning Page ${i}`);
    const page = await doc.getPage(i);
    const pageTextContent = await page.getTextContent(); // pageTextContent is an object that has items and styles properties.

    // pageTextContent.items is an array of objects in the form: {str: "", dir: "ltr", width: 91, height: 8, transform: Array(6) of Numbers, fontName: "", hasEOL: false}

    let occurrences = 0;
    pageTextContent.items.forEach((item) => {
      if (item.str.includes(SEARCH_FOR)) {
        item.str = `<i>${item.str}<i>`
        console.log("Found law", item);
        occurrences++;
      }
    });

    if (occurrences > 0) {
      console.log(`Occurrences on page ${i}: ${occurrences}`);
      const viewport = page.getViewport({ scale: 1.0 });
      const annotations = pageTextContent.items
        .filter((item) => item.str.includes(SEARCH_FOR))
        .map((item) => ({
          type: "highlight",
          rect: [item.transform[4], item.transform[5], item.width, item.height],
          page: i,
        }));

      console.log("Annotations:", annotations);
      // Optionally add annotations to viewer
    }

    totalOccurrences += occurrences;
    page.cleanup();
  }

  console.log(`# Total occurrences of "${SEARCH_FOR}": ${totalOccurrences}`);
}


document.getElementById("goto-1st-page").addEventListener("click", () => {
  pdfViewer.scrollPageIntoView({pageNumber: 1});
  console.log(`Current page: ${pdfViewer.currentPageNumber}`);
});

document.getElementById("goto-2nd-page").addEventListener("click", () => {
  pdfViewer.scrollPageIntoView({pageNumber: 2});
  console.log(`Current page: ${pdfViewer.currentPageNumber}`);
});

await initializePDFViewer();
await searchAndLogOccurrences(pdfDocument);
