
"use strict";

/* =========================================
   READORA - MINIMAL BOOK READER
   PDF.js + EPUB.js
========================================= */


/* =========================================
   BOOK DATABASE

   fileType: "pdf" or "epub"
   fileUrl: PDF / EPUB file URL
========================================= */

const books = {

    "atomic-habits": {
        title: "Atomic Habits",
        author: "James Clear",
        fileType: "pdf",
        fileUrl: "",
        cover: ""
    },

    "psychology-of-money": {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        fileType: "pdf",
        fileUrl: "",
        cover: ""
    },

    "dopamine-nation": {
        title: "Dopamine Nation",
        author: "Anna Lembke",
        fileType: "pdf",
        fileUrl: "",
        cover: ""
    },

    "the-mountain-is-you": {
        title: "The Mountain Is You",
        author: "Brianna Wiest",
        fileType: "pdf",
        fileUrl: "",
        cover: ""
    },

    "think-and-grow-rich": {
        title: "Think and Grow Rich",
        author: "Napoleon Hill",
        fileType: "pdf",
        fileUrl: "",
        cover: ""
    },

    "rich-dad-poor-dad": {
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        fileType: "pdf",
        fileUrl: "",
        cover: ""
    },

    "the-alchemist": {
        title: "The Alchemist",
        author: "Paulo Coelho",
        fileType: "pdf",
        fileUrl: "",
        cover: ""
    },

    "ikigai": {
        title: "Ikigai",
        author: "Héctor García and Francesc Miralles",
        fileType: "pdf",
        fileUrl: "",
        cover: ""
    }

};


/* =========================================
   HTML ELEMENTS
========================================= */

const $ = (id) => document.getElementById(id);

const loadingMessage = $("loading-message");

const readerNotice = $("reader-notice");
const noticeText = $("notice-text");

const pdfContainer = $("pdf-container");
const pdfCanvas = $("pdf-canvas");

const epubContainer = $("epub-container");
const epubViewer = $("epub-viewer");

const previousButton = $("bottom-previous");
const nextButton = $("bottom-next");

const pageIndicator = $("page-indicator");

const progressBar = $("progress-bar");
const progressPercentage = $("progress-percentage");
const progressTrack = $("progress-track");

const themeToggle = $("theme-toggle");


/* =========================================
   BOOK SELECTION
========================================= */

const params = new URLSearchParams(window.location.search);

const bookId = params.get("id") || "atomic-habits";

const book = books[bookId];

const storageKey = `readora-progress-${bookId}`;


/* =========================================
   READER VARIABLES
========================================= */

let currentPage = 1;
let totalPages = 0;

let currentFormat = "";

let pdfDocument = null;
let pdfRenderTask = null;

let epubBook = null;
let epubRendition = null;

let isRendering = false;

let resizeTimer = null;


/* =========================================
   INITIAL UI
========================================= */

function showLoading(show) {
    loadingMessage.hidden = !show;
}

function hideAllReaderContent() {
    pdfContainer.hidden = true;
    epubContainer.hidden = true;
}

function showNotice(message) {
    showLoading(false);

    hideAllReaderContent();

    readerNotice.hidden = false;
    noticeText.textContent = message;

    totalPages = 0;
    currentPage = 0;

    updatePageControls();
}

function hideNotice() {
    readerNotice.hidden = true;
}


/* =========================================
   READING PROGRESS
========================================= */

function updateProgress() {

    let percentage = 0;

    if (totalPages > 0) {
        percentage = Math.round(
            (currentPage / totalPages) * 100
        );
    }

    percentage = Math.max(
        0,
        Math.min(100, percentage)
    );

    progressBar.style.width = `${percentage}%`;

    progressPercentage.textContent = `${percentage}%`;

    progressTrack.setAttribute(
        "aria-valuenow",
        String(percentage)
    );
}


/* =========================================
   PAGE CONTROLS
========================================= */

function updatePageControls() {

    const hasPages = totalPages > 0;

    previousButton.disabled =
        !hasPages || currentPage <= 1;

    nextButton.disabled =
        !hasPages || currentPage >= totalPages;

    pageIndicator.textContent = hasPages
        ? `${currentPage} / ${totalPages}`
        : "0 / 0";

    updateProgress();

    if (hasPages) {
        saveProgress();
    }
}


/* =========================================
   SAVE / RESTORE PROGRESS
========================================= */

function loadProgress() {

    try {
        const saved = JSON.parse(
            localStorage.getItem(storageKey)
        );

        if (
            saved &&
            Number.isInteger(saved.page) &&
            saved.page > 0
        ) {
            return saved.page;
        }

    } catch (error) {
        console.warn(
            "Could not load reading progress:",
            error
        );
    }

    return 1;
}


function saveProgress() {

    if (totalPages <= 0 || currentPage <= 0) {
        return;
    }

    try {
        localStorage.setItem(
            storageKey,
            JSON.stringify({
                page: currentPage,
                updatedAt: Date.now()
            })
        );

    } catch (error) {
        console.warn(
            "Could not save reading progress:",
            error
        );
    }
}


/* =========================================
   PDF READER
========================================= */

async function loadPDF(url) {

    if (!window.pdfjsLib) {
        throw new Error(
            "PDF.js library could not be loaded."
        );
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    pdfDocument = await pdfjsLib.getDocument({
        url: url
    }).promise;

    totalPages = pdfDocument.numPages;

    if (!totalPages) {
        throw new Error("This PDF has no pages.");
    }

    currentFormat = "pdf";

    currentPage = Math.min(
        Math.max(loadProgress(), 1),
        totalPages
    );

    hideNotice();

    pdfContainer.hidden = false;

    await renderPDFPage(currentPage);
}


async function renderPDFPage(pageNumber) {

    if (!pdfDocument || isRendering) {
        return;
    }

    if (
        pageNumber < 1 ||
        pageNumber > totalPages
    ) {
        return;
    }

    isRendering = true;

    showLoading(true);
    hideNotice();

    try {

        const page = await pdfDocument.getPage(pageNumber);

        const originalViewport = page.getViewport({
            scale: 1
        });

        const availableWidth = Math.max(
            250,
            pdfContainer.clientWidth || 800
        );

        const scale = Math.min(
            1.6,
            availableWidth / originalViewport.width
        );

        const viewport = page.getViewport({
            scale: scale
        });

        const pixelRatio = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        const context = pdfCanvas.getContext("2d");

        pdfCanvas.width =
            Math.floor(viewport.width * pixelRatio);

        pdfCanvas.height =
            Math.floor(viewport.height * pixelRatio);

        pdfCanvas.style.width =
            `${Math.floor(viewport.width)}px`;

        pdfCanvas.style.height =
            `${Math.floor(viewport.height)}px`;

        context.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );

        pdfRenderTask = page.render({
            canvasContext: context,
            viewport: viewport
        });

        await pdfRenderTask.promise;

        currentPage = pageNumber;

        updatePageControls();

    } catch (error) {

        console.error("PDF rendering error:", error);

        if (error.name !== "RenderingCancelledException") {
            showNotice(
                "Unable to display this PDF page. Please check the PDF file."
            );
        }

    } finally {

        isRendering = false;
        pdfRenderTask = null;

        showLoading(false);
    }
}


/* =========================================
   EPUB READER
========================================= */

async function loadEPUB(url) {

    if (typeof window.ePub !== "function") {
        throw new Error(
            "EPUB.js library could not be loaded."
        );
    }

    epubBook = window.ePub(url);

    epubContainer.hidden = false;

    epubRendition = epubBook.renderTo(
        epubViewer,
        {
            width: "100%",
            height: "100%",
            spread: "none",
            flow: "paginated"
        }
    );

    await epubBook.ready;

    await epubBook.locations.generate(1000);

    totalPages = epubBook.locations.total;

    if (!totalPages || totalPages < 1) {
        totalPages = 1;
    }

    currentFormat = "epub";

    const savedPage = Math.min(
        Math.max(loadProgress(), 1),
        totalPages
    );

    const percentage = totalPages > 1
        ? (savedPage - 1) / (totalPages - 1)
        : 0;

    const savedLocation =
        epubBook.locations.cfiFromPercentage(percentage);

    epubRendition.on("relocated", (location) => {

        const position =
            location.start.percentage || 0;

        currentPage = Math.min(
            totalPages,
            Math.max(
                1,
                Math.floor(position * totalPages) + 1
            )
        );

        showLoading(false);

        updatePageControls();
    });

    await epubRendition.display(savedLocation);

    showLoading(false);
}


/* =========================================
   PAGE NAVIGATION
========================================= */

async function nextPage() {

    if (currentPage >= totalPages) {
        return;
    }

    if (currentFormat === "pdf") {
        await renderPDFPage(currentPage + 1);
        return;
    }

    if (currentFormat === "epub" && epubRendition) {
        await epubRendition.next();
    }
}


async function previousPage() {

    if (currentPage <= 1) {
        return;
    }

    if (currentFormat === "pdf") {
        await renderPDFPage(currentPage - 1);
        return;
    }

    if (currentFormat === "epub" && epubRendition) {
        await epubRendition.prev();
    }
}


/* =========================================
   BUTTON EVENTS
========================================= */

previousButton.addEventListener(
    "click",
    previousPage
);

nextButton.addEventListener(
    "click",
    nextPage
);


/* =========================================
   KEYBOARD NAVIGATION
========================================= */

document.addEventListener("keydown", (event) => {

    if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target.isContentEditable
    ) {
        return;
    }

    if (event.key === "ArrowRight") {
        nextPage();
    }

    if (event.key === "ArrowLeft") {
        previousPage();
    }

});


/* =========================================
   MOBILE SWIPE
========================================= */

const readingArea = document.querySelector(
    ".reading-area"
);

let touchStartX = 0;
let touchStartY = 0;

readingArea.addEventListener(
    "touchstart",
    (event) => {

        touchStartX = event.changedTouches[0].screenX;
        touchStartY = event.changedTouches[0].screenY;

    },
    { passive: true }
);


readingArea.addEventListener(
    "touchend",
    (event) => {

        const endX = event.changedTouches[0].screenX;
        const endY = event.changedTouches[0].screenY;

        const differenceX = endX - touchStartX;
        const differenceY = endY - touchStartY;

        if (Math.abs(differenceX) < 60) {
            return;
        }

        if (
            Math.abs(differenceX) <
            Math.abs(differenceY)
        ) {
            return;
        }

        if (differenceX < 0) {
            nextPage();
        } else {
            previousPage();
        }

    },
    { passive: true }
);


/* =========================================
   DARK / LIGHT THEME
========================================= */

const themeKey = "readora-reading-theme";

function applyTheme(isDark) {

    document.body.classList.toggle(
        "dark-reading",
        isDark
    );

    const icon = themeToggle.querySelector("i");

    if (icon) {
        icon.className = isDark
            ? "fa-solid fa-sun"
            : "fa-solid fa-moon";
    }

    themeToggle.setAttribute(
        "aria-label",
        isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
    );

    try {
        localStorage.setItem(
            themeKey,
            isDark ? "dark" : "light"
        );
    } catch (error) {
        console.warn("Could not save theme:", error);
    }
}


let darkMode = false;

try {
    darkMode =
        localStorage.getItem(themeKey) === "dark";
} catch (error) {
    console.warn("Could not load theme:", error);
}

applyTheme(darkMode);


themeToggle.addEventListener("click", () => {

    darkMode =
        !document.body.classList.contains("dark-reading");

    applyTheme(darkMode);

});


/* =========================================
   PDF RESIZE
========================================= */

window.addEventListener("resize", () => {

    if (currentFormat !== "pdf" || !pdfDocument) {
        return;
    }

    if (resizeTimer) {
        clearTimeout(resizeTimer);
    }

    resizeTimer = setTimeout(() => {

        renderPDFPage(currentPage);

    }, 250);

});


/* =========================================
   INITIALIZE READER
========================================= */

async function initializeReader() {

    $("current-year").textContent =
        new Date().getFullYear();

    if (!book) {

        showNotice(
            "This book could not be found. Please return to the books page."
        );

        return;
    }

    if (!book.fileUrl) {

        showNotice(
            "This book file has not been added yet."
        );

        return;
    }

    showLoading(true);

    try {

        const format = book.fileType.toLowerCase();

        if (format === "pdf") {

            await loadPDF(book.fileUrl);

        } else if (format === "epub") {

            await loadEPUB(book.fileUrl);

        } else {

            throw new Error(
                "Unsupported book format. Use PDF or EPUB."
            );

        }

    } catch (error) {

        console.error(
            "Reader initialization error:",
            error
        );

        showNotice(
            "Unable to open this book. Please check the file URL, file format, and file access permissions."
        );

    }

}


/* START */
initializeReader();
