import * as pdfjsLib from "../node_modules/pdfjs-dist/build/pdf.mjs";
import * as pdfjsViewer from "../node_modules/pdfjs-dist/web/pdf_viewer.mjs";

const container = document.getElementById("viewerContainer");
const eventBus = new pdfjsViewer.EventBus();
let pdfViewer;
let pdfDocument;

async function initializePDFViewer() {
  // The workerSrc property shall be specified.
  pdfjsLib.GlobalWorkerOptions.workerSrc = "../../node_modules/pdfjs-dist/build/pdf.worker.mjs";

  // Some PDFs need external cmaps.
  const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
  const CMAP_PACKED = true;
  const DEFAULT_URL = "insurance.pdf";
  const ENABLE_XFA = true;
  const SEARCH_FOR = "law";
  const SANDBOX_BUNDLE_SRC = new URL("../../node_modules/pdfjs-dist/build/pdf.sandbox.mjs", window.location);

  // Enable hyperlinks within PDF files.
  const pdfLinkService = new pdfjsViewer.PDFLinkService({
    eventBus,
  });

  // Enable find controller.
  const pdfFindController = new pdfjsViewer.PDFFindController({
    eventBus,
    linkService: pdfLinkService,
  });

  // Enable scripting support.
  const pdfScriptingManager = new pdfjsViewer.PDFScriptingManager({
    eventBus,
    sandboxBundleSrc: SANDBOX_BUNDLE_SRC,
  });

  pdfViewer = new pdfjsViewer.PDFViewer({
    container,
    eventBus,
    linkService: pdfLinkService,
    findController: pdfFindController,
    scriptingManager: pdfScriptingManager,
  });

  pdfLinkService.setViewer(pdfViewer);
  pdfScriptingManager.setViewer(pdfViewer);

  // Loading document
  const loadingTask = pdfjsLib.getDocument({
    url: DEFAULT_URL,
    cMapUrl: CMAP_URL,
    cMapPacked: CMAP_PACKED,
    enableXfa: ENABLE_XFA,
  });

  pdfDocument = await loadingTask.promise;
  // Document loaded, specifying document for the viewer and the (optional) linkService.
  pdfViewer.setDocument(pdfDocument);
  pdfLinkService.setDocument(pdfDocument, null);
}

await initializePDFViewer();

eventBus.on("pagesinit", function () {
  console.log(`pdfViewer.currentScaleValue: ${pdfViewer.currentScaleValue}`);
  // pdfViewer.currentScaleValue = "page-width";

  // We can try searching for things.
  // if (SEARCH_FOR) {
    // eventBus.dispatch("find", { type: "", query: SEARCH_FOR, caseSensitive: false, highlightAll: true, phraseSearch: true });
  // }
});

// Function to search for the word "proof" and log occurrences
const searchAndLogOccurrences = async (doc) => {
  // To get metadata: https://github.com/mozilla/pdf.js/blob/master/examples/node/getinfo.mjs

  const numPages = doc.numPages;
  let totalOccurrences = 0;

  for (let i = 1; i <= numPages; i++) {
    console.log(`# Scanning Page ${i}`);
    const page = await doc.getPage(i); // PDFPageProxy Object

    // pageTextContent is an object that has items and styles properties.
    const pageTextContent = await page.getTextContent();

    // pageTextContent.items is an array of objects in the form: {str: "", dir: "ltr", width: 91, height: 8, transform: Array(6) of Numbers, fontName: "", hasEOL: false}
    pageTextContent.items.forEach((item) => {
      if (item.str.includes("law")) {
        console.log("Found law");
        console.dir(item);
      }
    });

    // const strings = pageTextContent.items.map((item) => item.str);
    // const occurrences = strings.filter((str) => str.includes(SEARCH_FOR)).length;

    if (occurrences > 0) {
      strings.forEach((str) => {
        if (str.includes(SEARCH_FOR)) {
          console.log(str);
        }
      });
      console.log(`Occurrences on page ${i}: ${occurrences}`);

      // Highlight occurrences on the page
      const viewport = page.getViewport({ scale: 1.0 });
      const annotations = content.items
        .filter((item) => item.str.includes(SEARCH_FOR))
        .map((item) => ({
          type: "highlight",
          rect: [item.transform[4], item.transform[5], item.width, item.height],
          page: i,
        }));

      console.dir("++++++++++++++++++++++++++");
      console.dir(annotations);
      console.dir("++++++++++++++++++++++++++");

      // Add annotations to the viewer
      // annotations.forEach(annot => {
      //   const div = document.createElement('div');
      //   div.style.position = 'absolute';
      //   div.style.backgroundColor = 'yellow';
      //   div.style.opacity = '0.5';
      //   div.style.left = `${annot.rect[0]}px`;
      //   div.style.top = `${viewport.height - annot.rect[1]}px`;
      //   div.style.width = `${annot.rect[2]}px`;
      //   div.style.height = `${annot.rect[3]}px`;
      //   container.appendChild(div);
      // });
    }

    totalOccurrences += occurrences;
    page.cleanup();
  }

  console.log(`# Total occurrences of "${SEARCH_FOR}": ${totalOccurrences}`);
};

searchAndLogOccurrences(pdfDocument);

function scrollToPage(pageNumber) {
  // pdfViewer.scrollPageIntoView({ pageNumber: pageNumber, destArray: [1, { name: "Fit" }] });
  pdfViewer.scrollPageIntoView({ pageNumber: pageNumber });
}

const goto1stPageEl = document.getElementById("goto-1st-page");
goto1stPageEl.addEventListener("click", function () {
  // pdfViewer.scrollPageIntoView(1);
  pdfViewer.page = 1;
  console.log(`pdfViewer.currentPageNumber: ${pdfViewer.currentPageNumber}`);
});

const goto2ndPageEl = document.getElementById("goto-2nd-page");
goto2ndPageEl.addEventListener("click", function () {
  // pdfViewer.scrollPageIntoView(1);
  pdfViewer.page = 2;
  console.log(`pdfViewer.currentPageNumber: ${pdfViewer.currentPageNumber}`);
});
