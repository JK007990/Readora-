
/* ==========================================
   READORA - BOOK DETAILS
   FIREBASE RATING + INDEXEDDB SAVED BOOKS
========================================== */

"use strict";

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    doc,
    getDocs,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { books } from "./book.js";


/* ==========================================
   ELEMENTS
========================================== */

const bookCover = document.getElementById("book-cover");

const bookTitle = document.getElementById("book-title");

const bookAuthor = document.getElementById("book-author");

const bookCategory = document.getElementById("book-category");

const bookDescription = document.getElementById("book-description");

const breadcrumbTitle = document.getElementById("breadcrumb-title");

const metaAuthor = document.getElementById("meta-author");

const metaCategory = document.getElementById("meta-category");

const averageStars = document.getElementById("averageStars");

const averageRating = document.getElementById("averageRating");

const ratingCount = document.getElementById("ratingCount");

const starPicker = document.getElementById("starPicker");

const ratingHint = document.getElementById("ratingHint");

const submitRatingBtn = document.getElementById("submitRatingBtn");

const ratingFeedback = document.getElementById("ratingFeedback");

const ratingForm = document.getElementById("ratingForm");

const ratingLoginMessage = document.getElementById("ratingLoginMessage");

const saveBookBtn = document.getElementById("saveBookBtn");

const saveMessage = document.getElementById("saveMessage");

const readBookBtn = document.getElementById("readBookBtn");

const shareBookBtn = document.getElementById("shareBookBtn");

const bookDetails = document.getElementById("bookDetails");

const bookNotFound = document.getElementById("bookNotFound");


/* ==========================================
   CURRENT BOOK
========================================== */

const params = new URLSearchParams(window.location.search);

const bookId = params.get("id");

const book = books[bookId];

let currentUser = null;

let selectedRating = 0;

let userRating = 0;


/* ==========================================
   INDEXEDDB SAVED BOOKS
========================================== */

const DB_NAME = "ReadoraSavedBooks";

const DB_VERSION = 1;

const STORE_NAME = "savedBooks";

let savedDB = null;


function openSavedDatabase() {

    return new Promise((resolve, reject) => {

        if (!("indexedDB" in window)) {

            reject(new Error("IndexedDB is not supported."));

            return;

        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {

            const database = event.target.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {

                database.createObjectStore(STORE_NAME, {
                    keyPath: "id"
                });

            }

        };

        request.onsuccess = () => {

            savedDB = request.result;

            resolve(savedDB);

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

}


function getSavedBooks() {

    return new Promise((resolve, reject) => {

        if (!savedDB) {

            reject(new Error("Saved book database is not ready."));

            return;

        }

        const transaction = savedDB.transaction(
            STORE_NAME,
            "readonly"
        );

        const request = transaction
            .objectStore(STORE_NAME)
            .getAll();

        request.onsuccess = () => {

            resolve(request.result || []);

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

}


function saveBookToDatabase(bookData) {

    return new Promise((resolve, reject) => {

        if (!savedDB) {

            reject(new Error("Saved book database is not ready."));

            return;

        }

        const transaction = savedDB.transaction(
            STORE_NAME,
            "readwrite"
        );

        const request = transaction
            .objectStore(STORE_NAME)
            .put(bookData);

        request.onsuccess = () => {

            resolve(true);

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

}


function removeBookFromDatabase(id) {

    return new Promise((resolve, reject) => {

        if (!savedDB) {

            reject(new Error("Saved book database is not ready."));

            return;

        }

        const transaction = savedDB.transaction(
            STORE_NAME,
            "readwrite"
        );

        const request = transaction
            .objectStore(STORE_NAME)
            .delete(id);

        request.onsuccess = () => {

            resolve(true);

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

}


/* ==========================================
   SHARED SAVED BOOK API
========================================== */

window.ReadoraSavedBooks = {

    getAll: async function () {

        try {

            await openSavedDatabase();

            return await getSavedBooks();

        } catch (error) {

            console.error(
                "Readora Saved Books:",
                error
            );

            return [];

        }

    },


    get: async function (id) {

        const savedBooks = await this.getAll();

        return savedBooks.find(
            item => item.id === id
        ) || null;

    },


    add: async function (bookData) {

        try {

            if (!savedDB) {
                await openSavedDatabase();
            }

            await saveBookToDatabase(bookData);

            return true;

        } catch (error) {

            console.error(
                "Readora Saved Books:",
                error
            );

            return false;

        }

    },


    remove: async function (id) {

        try {

            if (!savedDB) {
                await openSavedDatabase();
            }

            await removeBookFromDatabase(id);

            return true;

        } catch (error) {

            console.error(
                "Readora Saved Books:",
                error
            );

            return false;

        }

    }

};


/* ==========================================
   LOAD BOOK COVER
========================================== */

function loadBookCover() {

    if (!bookCover) return;

    bookCover.className = "book-cover";

    bookCover.innerHTML = "";

    if (book.cover && book.cover.trim()) {

        const image = document.createElement("img");

        image.src = book.cover;

        image.alt = `${book.title} book cover`;

        image.loading = "eager";

        image.onerror = () => {

            image.remove();

            bookCover.classList.remove("has-cover-image");

            const fallback = document.createElement("span");

            fallback.textContent = "📖";

            bookCover.appendChild(fallback);

            console.error(
                `Readora: Failed to load cover for ${book.title}`
            );

        };

        bookCover.classList.add("has-cover-image");

        bookCover.appendChild(image);

    } else {

        const fallback = document.createElement("span");

        fallback.textContent = "📖";

        bookCover.appendChild(fallback);

    }

}


/* ==========================================
   LOAD BOOK DETAILS
========================================== */

function loadBookDetails() {

    if (!book) {

        if (bookDetails) {
            bookDetails.hidden = true;
        }

        const ratingSection = document.querySelector(".rating-section");

        if (ratingSection) {
            ratingSection.hidden = true;
        }

        if (bookNotFound) {
            bookNotFound.hidden = false;
        }

        document.title = "Book Not Found | Readora";

        return false;

    }


    document.title = `${book.title} | Readora`;

    bookTitle.textContent = book.title;

    bookAuthor.textContent = book.author;

    bookCategory.textContent = book.category;

    bookDescription.textContent = book.description;

    breadcrumbTitle.textContent = book.title;

    metaAuthor.textContent = book.author;

    metaCategory.textContent = book.category;


    loadBookCover();


    if (readBookBtn) {

        readBookBtn.href =
            `reader.html?id=${encodeURIComponent(bookId)}`;

    }


    return true;

}


/* ==========================================
   SAVE BUTTON STATUS
========================================== */

async function updateSaveButton() {

    if (!saveBookBtn || !book) return;

    try {

        if (!savedDB) {
            await openSavedDatabase();
        }

        const savedBooks = await getSavedBooks();

        const isSaved = savedBooks.some(
            item => item.id === bookId
        );

        saveBookBtn.classList.toggle("saved", isSaved);

        saveBookBtn.innerHTML = isSaved

            ? `
                <i class="fa-solid fa-bookmark"></i>
                <span>Saved to My Books</span>
              `

            : `
                <i class="fa-regular fa-bookmark"></i>
                <span>Save to My Books</span>
              `;

    } catch (error) {

        console.error(
            "Readora: Cannot check saved books.",
            error
        );

    }

}


/* ==========================================
   SAVE / REMOVE BOOK
========================================== */

async function toggleSaveBook() {

    if (!book || !saveBookBtn) return;

    saveBookBtn.disabled = true;

    try {

        if (!savedDB) {
            await openSavedDatabase();
        }

        const savedBooks = await getSavedBooks();

        const existingBook = savedBooks.find(
            item => item.id === bookId
        );


        if (existingBook) {

            await removeBookFromDatabase(bookId);

            saveMessage.textContent =
                "Book removed from My Books.";

        } else {

            const bookData = {

                id: bookId,

                title: book.title,

                author: book.author,

                category: book.category,

                cover: book.cover || "",

                description: book.description,

                savedAt: new Date().toISOString()

            };

            await saveBookToDatabase(bookData);

            saveMessage.textContent =
                "Book saved to My Books.";

        }

        await updateSaveButton();

    } catch (error) {

        console.error(
            "Readora: Save book error.",
            error
        );

        saveMessage.textContent =
            "Unable to save this book. Please try again.";

    } finally {

        saveBookBtn.disabled = false;

    }

}


/* ==========================================
   STAR DISPLAY
========================================== */

function renderStars(container, rating) {

    if (!container) return;

    container.innerHTML = "";

    for (let i = 1; i <= 5; i++) {

        const star = document.createElement("i");

        star.className =
            i <= Math.round(rating)
                ? "fa-solid fa-star"
                : "fa-regular fa-star";

        container.appendChild(star);

    }

}


/* ==========================================
   LOAD FIRESTORE RATINGS
========================================== */

async function loadBookRatings() {

    if (!book) return;

    try {

        const ratingsRef = collection(
            db,
            "bookRatings",
            bookId,
            "users"
        );

        const snapshot = await getDocs(ratingsRef);

        let total = 0;

        let count = 0;

        snapshot.forEach((ratingDocument) => {

            const data = ratingDocument.data();

            const value = Number(data.rating);

            if (value >= 1 && value <= 5) {

                total += value;

                count++;

            }

            if (
                currentUser &&
                ratingDocument.id === currentUser.uid
            ) {

                userRating = value;

            }

        });


        const average = count > 0
            ? total / count
            : 0;


        averageRating.textContent = average.toFixed(1);

        ratingCount.textContent =
            `(${count} ${count === 1 ? "rating" : "ratings"})`;

        renderStars(averageStars, average);


        if (currentUser && userRating > 0) {

            selectedRating = userRating;

            updateStarPicker();

            ratingHint.textContent =
                `Your rating: ${userRating} / 5`;

            submitRatingBtn.textContent = "Update Rating";

            submitRatingBtn.disabled = false;

        }

    } catch (error) {

        console.error(
            "Readora: Could not load ratings.",
            error
        );

    }

}


/* ==========================================
   STAR PICKER
========================================== */

function updateStarPicker() {

    if (!starPicker) return;

    const buttons = starPicker.querySelectorAll("button");

    buttons.forEach((button) => {

        const value = Number(
            button.dataset.rating
        );

        const icon = button.querySelector("i");

        if (!icon) return;

        icon.className =
            value <= selectedRating
                ? "fa-solid fa-star"
                : "fa-regular fa-star";

    });

}


if (starPicker) {

    starPicker.addEventListener("click", (event) => {

        const button = event.target.closest("button[data-rating]");

        if (!button || !currentUser) return;

        selectedRating = Number(button.dataset.rating);

        ratingHint.textContent =
            `${selectedRating} out of 5 stars`;

        submitRatingBtn.disabled = false;

        updateStarPicker();

    });

}


/* ==========================================
   SUBMIT RATING
========================================== */

async function submitRating() {

    if (!currentUser) {

        ratingFeedback.textContent =
            "Please log in before submitting a rating.";

        return;

    }

    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {

        ratingFeedback.textContent =
            "Please select a rating first.";

        return;

    }

    submitRatingBtn.disabled = true;

    submitRatingBtn.textContent = "Submitting...";

    ratingFeedback.textContent = "";


    try {

        const ratingRef = doc(
            db,
            "bookRatings",
            bookId,
            "users",
            currentUser.uid
        );

        await setDoc(ratingRef, {

            rating: selectedRating,

            userId: currentUser.uid,

            bookId: bookId,

            bookTitle: book.title,

            updatedAt: serverTimestamp()

        });


        userRating = selectedRating;

        ratingFeedback.textContent =
            "Your rating has been saved successfully.";

        submitRatingBtn.textContent = "Update Rating";

        await loadBookRatings();

    } catch (error) {

        console.error(
            "Readora: Rating submission failed.",
            error
        );

        ratingFeedback.textContent =
            "Could not save your rating. Please try again.";

        submitRatingBtn.textContent = "Submit Rating";

    } finally {

        submitRatingBtn.disabled = false;

    }

}


if (submitRatingBtn) {

    submitRatingBtn.addEventListener(
        "click",
        submitRating
    );

}


/* ==========================================
   AUTHENTICATION STATE
========================================== */

onAuthStateChanged(auth, async (user) => {

    currentUser = user || null;

    selectedRating = 0;

    userRating = 0;


    if (!currentUser) {

        ratingForm.hidden = true;

        ratingLoginMessage.hidden = false;

        ratingLoginMessage.innerHTML = `
            <i class="fa-solid fa-circle-info"></i>
            <span>
                Please log in to your account to rate this book.
            </span>
        `;

        return;

    }


    ratingForm.hidden = false;

    ratingLoginMessage.hidden = true;


    await loadBookRatings();

});


/* ==========================================
   SHARE BOOK
========================================== */

if (shareBookBtn) {

    shareBookBtn.addEventListener("click", async () => {

        if (!book) return;

        const shareData = {

            title: book.title,

            text: `Discover ${book.title} by ${book.author} on Readora.`,

            url: window.location.href

        };


        try {

            if (navigator.share) {

                await navigator.share(shareData);

            } else if (navigator.clipboard) {

                await navigator.clipboard.writeText(
                    window.location.href
                );

                shareBookBtn.innerHTML = `
                    <i class="fa-solid fa-check"></i>
                    Copied!
                `;

                setTimeout(() => {

                    shareBookBtn.innerHTML = `
                        <i class="fa-solid fa-share-nodes"></i>
                        Share
                    `;

                }, 2000);

            } else {

                ratingFeedback.textContent =
                    "Sharing is not supported in this browser.";

            }

        } catch (error) {

            if (error.name !== "AbortError") {

                console.error(
                    "Readora: Share failed.",
                    error
                );

            }

        }

    });

}


/* ==========================================
   EVENT LISTENERS
========================================== */

if (saveBookBtn) {

    saveBookBtn.addEventListener(
        "click",
        toggleSaveBook
    );

}


/* ==========================================
   INITIALIZE PAGE
========================================== */

async function initializePage() {

    try {

        await openSavedDatabase();

        await updateSaveButton();

    } catch (error) {

        console.error(
            "Readora: Initialization error.",
            error
        );

        if (saveMessage) {

            saveMessage.textContent =
                "Saved books are currently unavailable.";

        }

    }

}


if (loadBookDetails()) {

    loadBookRatings();

    initializePage();

    updateSaveButton();

}
