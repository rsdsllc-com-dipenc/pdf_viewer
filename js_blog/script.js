import * as pdfjsLib from "../node_modules/pdfjs-dist/build/pdf.mjs";

// Get the canvas element.
const canvas = document.getElementById("canvas");

// Get the PDF file URL.
const pdfUrl = "insurance.pdf"; // Replace with the URL of your PDF document

// Configure the PDF.js worker source.
pdfjsLib.GlobalWorkerOptions.workerSrc = "../node_modules/pdfjs-dist/build/pdf.worker.mjs";

// Load the PDF file using PDF.js.
pdfjsLib.getDocument(pdfUrl).promise.then(function (pdfDoc) {
  // Get the first page of the PDF file.
  pdfDoc.getPage(1).then(function (page) {
    const viewport = page.getViewport({ scale: 2 });

    // Set the canvas dimensions to match the PDF page size.
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Set the canvas rendering context.
    const ctx = canvas.getContext("2d");

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    // Render the PDF page to the canvas.
    page.render(renderContext).promise.then(function () {
      console.log("Rendering complete");
      // Call the function to render highlight annotations after the PDF page is rendered.
      renderHighlightAnnotations(page);
    });
  });
});

// Highlights annotations!!
function renderHighlightAnnotations(page) {
  page.getAnnotations().then(function (annotations) {
    annotations.forEach(function (annotation) {
      if (annotation.subtype === "Highlight") {
        const highlightRect = annotation.rect;
        const highlight = document.createElement("div");
        highlight.style.position = "absolute";
        highlight.style.left = highlightRect[0] + "px";
        highlight.style.top = highlightRect[1] + "px";
        highlight.style.width = highlightRect[2] - highlightRect[0] + "px";
        highlight.style.height = highlightRect[3] - highlightRect[1] + "px";
        highlight.style.backgroundColor = "yellow";
        highlight.style.opacity = "0.5";
        document.body.appendChild(highlight);
      }
    });
  });
}
