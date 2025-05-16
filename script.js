var url = 'docs/AVRUPA_1800-2000.pdf';

var pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.2.2/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5;

function renderPage(num, canvas, container) {
  var ctx = canvas.getContext('2d');
  pageRendering = true;

  pdfDoc.getPage(num).then(function(page) {
    var viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render the canvas
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);

    // Create and append text layer div
    const textLayerDiv = document.createElement('div');
    textLayerDiv.className = 'textLayer';
    textLayerDiv.style.width = canvas.style.width;
    textLayerDiv.style.height = canvas.style.height;
    container.appendChild(textLayerDiv);

    // Render the text layer
    page.getTextContent().then(function(textContent) {
      pdfjsLib.renderTextLayer({
        textContent: textContent,
        container: textLayerDiv,
        viewport: viewport,
        textDivs: [],
        enhanceTextSelection: true
      });
    });

    renderTask.promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });
}

pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
  pdfDoc = pdfDoc_;

  const pages = parseInt(pdfDoc.numPages);

  const canvasesContainer = document.getElementById('canvases');
  canvasesContainer.innerHTML = '';

  for (let i = 0; i < pages; i++) {
    const container = document.createElement('div');
    container.className = 'page-container';

    const canvas = document.createElement('canvas');
    canvas.id = 'canvas_' + i;

    container.appendChild(canvas);
    canvasesContainer.appendChild(container);

    renderPage(i + 1, canvas, container);
  }
});
