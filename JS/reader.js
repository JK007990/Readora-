
"use strict";

/* =========================================
   READORA - PDF + EPUB READER
========================================= */

/*
    Book data is loaded from URL parameters.

    reader.html?id=atomic-habits

    Optional direct PDF:
    reader.html?id=atomic-habits&file=PDF_URL
*/

const BOOKS = {
    "အသက် ၂၀ မှာပြောင်းလဲရမယ့် အချက် ၂၀": {
        title: "အသက် ၂၀ မှာပြောင်းလဲရမယ့် အချက် ၂၀",
        author: "Monica",
        fileType: "pdf",
        fileUrl: "https://pub-a7a0dc4aff994c599af04d73bafcff56.r2.dev/Bookdpf/%E1%80%A1%E1%80%9E%E1%80%80%E1%80%BA_%E1%81%82%E1%81%80_%E1%80%99%E1%80%BE%E1%80%AC%E1%80%95%E1%80%BC%E1%80%B1%E1%80%AC%E1%80%84%E1%80%BA%E1%80%B8%E1%80%9C%E1%80%B2%E1%80%9B%E1%80%99%E1%80%9A%E1%80%BA%E1%80%B7_%E1%80%A1%E1%80%81%E1%80%BB%E1%80%80%E1%80%BA_%E1%81%82%E1%81%80.pdf"
    },

    "psychology-of-money": {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        fileType: "pdf",
        fileUrl: ""
    },

    "dopamine-nation": {
        title: "Dopamine Nation",
        author: "Anna Lembke",
        fileType: "pdf",
        fileUrl: ""
    },

    "the-mountain-is-you": {
        title: "The Mountain Is You",
        author: "Brianna Wiest",
        fileType: "pdf",
        fileUrl: ""
    },

    "think-and-grow-rich": {
        title: "Think and Grow Rich",
        author: "Napoleon Hill",
        fileType: "pdf",
        fileUrl: ""
    },

    "rich-dad-poor-dad": {
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        fileType: "pdf",
        fileUrl: ""
    },

    "မောင့်ကိုမပြောချင်ဘူး": {
     title: "မောင့်ကိုမပြောချင်ဘူး",
     author: "ပုညခင်",
     fileType: "pdf",
     fileUrl: "https://pub-a7a0dc4aff994c599af04d73bafcff56.r2.dev/Bookdpf/%E1%80%99%E1%80%B1%E1%80%AC%E1%80%84%E1%80%BA%E1%80%B7%E1%80%80%E1%80%AD%E1%80%AF%E1%80%95%E1%80%BC%E1%80%B1%E1%80%AC%E1%80%99%E1%80%95%E1%80%BC%E1%80%81%E1%80%BB%E1%80%84%E1%80%BA%E1%80%98%E1%80%B0%E1%80%B8_%E1%80%95%E1%80%AF%E1%80%8A%E1%80%81%E1%80%84%E1%80%BA.pdf"
    },

    "ikigai": {
        title: "Ikigai",
        author: "Héctor García and Francesc Miralles",
        fileType: "pdf",
        fileUrl: ""
    }
};


/* ELEMENTS */

const $ = id => document.getElementById(id);

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


/* URL */

const params = new URLSearchParams(location.search);

const bookId = params.get("id") || "";
const book = BOOKS[bookId];

const externalFile = params.get("file");

const bookTitle = $("reader-book-title");
const bookAuthor = $("reader-book-author");
const bookInfo = $("reader-book-info");


/* VARIABLES */

let currentPage = 1;
let totalPages = 0;

let currentFormat = "";

let pdfDocument = null;
let pdfRenderTask = null;

let epubBook = null;
let epubRendition = null;

let isRendering = false;
let renderVersion = 0;
let resizeTimer = null;

const storageKey = `readora-progress-${bookId}`;


/* UI */

function showLoading(value) {
    loadingMessage.hidden = !value;
}

function hideReader() {
    pdfContainer.hidden = true;
    epubContainer.hidden = true;
}

function showNotice(message) {
    showLoading(false);
    hideReader();

    readerNotice.hidden = false;
    noticeText.textContent = message;

    totalPages = 0;
    currentPage = 0;

    updateControls();
}

function hideNotice() {
    readerNotice.hidden = true;
}


/* PROGRESS */

function updateProgress() {
    const percentage = totalPages > 0
        ? Math.round(currentPage / totalPages * 100)
        : 0;

    progressBar.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;

    progressTrack.setAttribute(
        "aria-valuenow",
        String(percentage)
    );
}

function loadProgress() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(storageKey)
        );

        if (saved && Number.isInteger(saved.page)) {
            return saved.page;
        }
    } catch (error) {
        console.warn(error);
    }

    return 1;
}

function saveProgress() {
    if (!totalPages || !currentPage) return;

    try {
        localStorage.setItem(
            storageKey,
            JSON.stringify({
                page: currentPage,
                updatedAt: Date.now()
            })
        );
    } catch (error) {
        console.warn(error);
    }
}

function updateControls() {
    const hasPages = totalPages > 0;

    previousButton.disabled =
        !hasPages || currentPage <= 1;

    nextButton.disabled =
        !hasPages || currentPage >= totalPages;

    pageIndicator.textContent = hasPages
        ? `${currentPage} / ${totalPages}`
        : "0 / 0";

    updateProgress();

    if (hasPages) saveProgress();
}


/* PDF */

async function loadPDF(url) {
    if (!window.pdfjsLib) {
        throw new Error("PDF.js library not loaded.");
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    pdfDocument = await pdfjsLib.getDocument({
        url: url,
        withCredentials: false
    }).promise;

    totalPages = pdfDocument.numPages;

    if (!totalPages) {
        throw new Error("PDF has no pages.");
    }

    currentFormat = "pdf";

    currentPage = Math.min(
        Math.max(loadProgress(), 1),
        totalPages
    );

    pdfContainer.hidden = false;
    hideNotice();

    await renderPDFPage(currentPage);
}


async function renderPDFPage(pageNumber) {
    if (!pdfDocument) return;

    if (
        pageNumber < 1 ||
        pageNumber > totalPages
    ) return;

    const version = ++renderVersion;

    if (pdfRenderTask) {
        try {
            pdfRenderTask.cancel();
        } catch (error) {}
    }

    isRendering = true;
    showLoading(true);

    try {
        const page = await pdfDocument.getPage(pageNumber);

        if (version !== renderVersion) return;

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
            scale
        });

        const pixelRatio = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        const context = pdfCanvas.getContext("2d");

        pdfCanvas.width = Math.floor(
            viewport.width * pixelRatio
        );

        pdfCanvas.height = Math.floor(
            viewport.height * pixelRatio
        );

        pdfCanvas.style.width = `${viewport.width}px`;
        pdfCanvas.style.height = `${viewport.height}px`;

        context.setTransform(
            pixelRatio, 0, 0,
            pixelRatio, 0, 0
        );

        pdfRenderTask = page.render({
            canvasContext: context,
            viewport
        });

        await pdfRenderTask.promise;

        if (version !== renderVersion) return;

        currentPage = pageNumber;
        updateControls();

    } catch (error) {
        if (
            error.name !== "RenderingCancelledException" &&
            version === renderVersion
        ) {
            console.error(error);

            showNotice(
                "Unable to display this PDF page. Please check the PDF URL and CORS settings."
            );
        }
    } finally {
        if (version === renderVersion) {
            isRendering = false;
            pdfRenderTask = null;
            showLoading(false);
        }
    }
}


/* EPUB */

async function loadEPUB(url) {
    if (typeof window.ePub !== "function") {
        throw new Error("EPUB.js library not loaded.");
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

    totalPages = Math.max(
        1,
        epubBook.locations.total || 1
    );

    currentFormat = "epub";

    const savedPage = Math.min(
        Math.max(loadProgress(), 1),
        totalPages
    );

    const percentage = totalPages > 1
        ? (savedPage - 1) / (totalPages - 1)
        : 0;

    const location =
        epubBook.locations.cfiFromPercentage(percentage);

    epubRendition.on("relocated", location => {
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
        updateControls();
    });

    await epubRendition.display(location);
}


/* NAVIGATION */

async function nextPage() {
    if (currentPage >= totalPages) return;

    if (currentFormat === "pdf") {
        await renderPDFPage(currentPage + 1);
    } else if (currentFormat === "epub") {
        await epubRendition.next();
    }
}

async function previousPage() {
    if (currentPage <= 1) return;

    if (currentFormat === "pdf") {
        await renderPDFPage(currentPage - 1);
    } else if (currentFormat === "epub") {
        await epubRendition.prev();
    }
}

previousButton.addEventListener("click", previousPage);
nextButton.addEventListener("click", nextPage);


/* KEYBOARD */

document.addEventListener("keydown", event => {
    if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target.isContentEditable
    ) return;

    if (event.key === "ArrowRight") nextPage();
    if (event.key === "ArrowLeft") previousPage();
});


/* SWIPE */

const readingArea = document.querySelector(".reading-area");

let touchStartX = 0;
let touchStartY = 0;

readingArea.addEventListener("touchstart", event => {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
}, { passive: true });

readingArea.addEventListener("touchend", event => {
    const dx = event.changedTouches[0].screenX - touchStartX;
    const dy = event.changedTouches[0].screenY - touchStartY;

    if (
        Math.abs(dx) < 60 ||
        Math.abs(dx) < Math.abs(dy)
    ) return;

    if (dx < 0) nextPage();
    else previousPage();
}, { passive: true });


/* THEME */

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
        isDark ? "Switch to light theme" : "Switch to dark theme"
    );

    try {
        localStorage.setItem(
            themeKey,
            isDark ? "dark" : "light"
        );
    } catch (error) {
        console.warn(error);
    }
}

let darkMode = false;

try {
    darkMode = localStorage.getItem(themeKey) === "dark";
} catch (error) {}

applyTheme(darkMode);

themeToggle.addEventListener("click", () => {
    darkMode = !document.body.classList.contains("dark-reading");
    applyTheme(darkMode);
});


/* RESIZE */

window.addEventListener("resize", () => {
    if (currentFormat !== "pdf" || !pdfDocument) return;

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
        renderPDFPage(currentPage);
    }, 300);
});


/* INITIALIZE */

async function initializeReader() {
    $("current-year").textContent = new Date().getFullYear();

    if (!book && !externalFile) {
        showNotice(
            "This book could not be found. Please return to the books page."
        );
        return;
    }

    const selectedBook = book || {
        title: "Online Book",
        author: "",
        fileType: "pdf",
        fileUrl: externalFile
    };

    const fileUrl = externalFile || selectedBook.fileUrl;

    if (!fileUrl) {
        showNotice(
            "This book file has not been added yet."
        );
        return;
    }

    bookTitle.textContent = selectedBook.title || "Untitled Book";
    bookAuthor.textContent = selectedBook.author || "";
    bookInfo.hidden = false;

    showLoading(true);

    try {
        const format = (
            selectedBook.fileType || "pdf"
        ).toLowerCase();

        if (format === "pdf") {
            await loadPDF(fileUrl);
        } else if (format === "epub") {
            await loadEPUB(fileUrl);
        } else {
            throw new Error("Unsupported book format.");
        }
    } catch (error) {
        console.error("Reader error:", error);

        showNotice(
            "Unable to open this book. Check the PDF URL, file access and CORS settings."
        );
    }
}

initializeReader();
