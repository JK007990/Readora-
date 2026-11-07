
"use strict";

import { auth, db, authPersistence } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


/* =========================================
   BOOK DATABASE
========================================= */

const books = {

    "atomic-habits": {
        title: "Atomic Habits",
        author: "James Clear",
        category: "Self Improvement",
        cover: "cover-1",
        description: "An easy and practical guide to building good habits, breaking bad ones, and making small changes that lead to remarkable results."
    },

    "psychology-of-money": {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        category: "Finance",
        cover: "cover-2",
        description: "A collection of stories exploring how people think about money, wealth, greed, and happiness."
    },

    "dopamine-nation": {
        title: "Dopamine Nation",
        author: "Anna Lembke",
        category: "Psychology",
        cover: "cover-3",
        description: "Explores the relationship between pleasure and pain in a world overflowing with addictive stimulation."
    },

    "the-mountain-is-you": {
        title: "The Mountain Is You",
        author: "Brianna Wiest",
        category: "Self Improvement",
        cover: "cover-4",
        description: "A guide to understanding self-sabotage and transforming the obstacles within yourself into opportunities for growth."
    },

    "think-and-grow-rich": {
        title: "Think and Grow Rich",
        author: "Napoleon Hill",
        category: "Finance",
        cover: "cover-5",
        description: "A classic personal development book about mindset, determination, and principles associated with achieving success."
    },

    "rich-dad-poor-dad": {
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        category: "Finance",
        cover: "cover-6",
        description: "Introduces financial literacy and different ways of thinking about money, investing, and building wealth."
    },

    "the-alchemist": {
        title: "The Alchemist",
        author: "Paulo Coelho",
        category: "Fiction",
        cover: "cover-7",
        description: "A young shepherd travels in search of treasure and discovers lessons about dreams, destiny, and following his heart."
    },

    "ikigai": {
        title: "Ikigai",
        author: "Héctor García and Francesc Miralles",
        category: "Lifestyle",
        cover: "cover-8",
        description: "Explores the Japanese concept of ikigai and how purpose, meaningful work, and daily habits can contribute to a fulfilling life."
    }

};


/* =========================================
   DOM ELEMENTS
========================================= */

const $ = (id) => document.getElementById(id);

const bookTitle = $("book-title");
const bookAuthor = $("book-author");
const bookCategory = $("book-category");
const bookDescription = $("book-description");
const bookShortDescription = $("book-short-description");

const bookCover = $("book-cover");
const breadcrumbTitle = $("breadcrumb-title");

const metaCategory = $("meta-category");
const metaAuthor = $("meta-author");

const averageStars = $("average-stars");
const averageRating = $("average-rating");
const ratingCount = $("rating-count");

const loginRequired = $("rating-login-required");
const ratingForm = $("rating-form");

const ratingButtons = document.querySelectorAll(
    "#user-rating-stars button"
);

const selectedRatingText = $("selected-rating-text");
const submitRatingButton = $("submit-rating-button");
const ratingMessage = $("rating-message");

const saveBookButton = $("save-book-button");
const saveMessage = $("save-message");
const readNowButton = $("read-now-button");


/* =========================================
   CURRENT BOOK
========================================= */

const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");

const book = books[bookId];

let currentUser = null;
let selectedRating = 0;
let existingRating = 0;


/* =========================================
   LOAD BOOK DETAILS
========================================= */

function loadBookDetails() {

    if (!book) {

        document.querySelector(".page-container").innerHTML = `
            <div class="not-found">
                <h2>Book Not Found</h2>
                <p>The book you are looking for does not exist.</p>
                <a href="books.html">Browse Books</a>
            </div>
        `;

        return false;
    }

    document.title = `${book.title} | Readora`;

    bookTitle.textContent = book.title;
    bookAuthor.textContent = book.author;
    bookCategory.textContent = book.category;

    bookDescription.textContent = book.description;
    bookShortDescription.textContent = book.description;

    breadcrumbTitle.textContent = book.title;

    metaCategory.textContent = book.category;
    metaAuthor.textContent = book.author;

    bookCover.className = `book-cover ${book.cover}`;

    bookCover.innerHTML = `
        <span>📖</span>
    `;

    readNowButton.href = `reader.html?id=${encodeURIComponent(bookId)}`;

    return true;
}


/* =========================================
   FIRESTORE REFERENCES
========================================= */

function getRatingRef(userId) {

    return doc(
        db,
        "bookRatings",
        `${bookId}_${userId}`
    );

}


/* =========================================
   LOAD ALL RATINGS
========================================= */

async function loadBookRatings() {

    try {

        const ratingsRef = collection(db, "bookRatings");

        const snapshot = await getDocs(ratingsRef);

        const bookRatings = [];

        snapshot.forEach((ratingDoc) => {

            const data = ratingDoc.data();

            if (
                data.bookId === bookId &&
                Number.isInteger(data.rating) &&
                data.rating >= 1 &&
                data.rating <= 5
            ) {

                bookRatings.push(data.rating);

            }

        });

        const count = bookRatings.length;

        const average = count
            ? bookRatings.reduce((total, value) => total + value, 0) / count
            : 0;

        averageRating.textContent = average.toFixed(1);

        ratingCount.textContent =
            `(${count} ${count === 1 ? "rating" : "ratings"})`;

        const rounded = Math.round(average);

        averageStars.textContent =
            "★".repeat(rounded) + "☆".repeat(5 - rounded);

    } catch (error) {

        console.error("Loading ratings failed:", error);

        averageRating.textContent = "--";
        ratingCount.textContent = "(Unable to load ratings)";

    }

}


/* =========================================
   STAR INPUT
========================================= */

function updateStarSelection(rating) {

    selectedRating = rating;

    ratingButtons.forEach((button) => {

        const value = Number(button.dataset.rating);

        button.classList.toggle(
            "active",
            value <= rating
        );

    });

    selectedRatingText.textContent =
        rating > 0
            ? `${rating} out of 5 stars`
            : "Select your rating";

    submitRatingButton.disabled = rating === 0;

}


/* =========================================
   STAR CLICK
========================================= */

ratingButtons.forEach((button) => {

    button.addEventListener("click", () => {

        if (!currentUser) return;

        updateStarSelection(
            Number(button.dataset.rating)
        );

    });

});


/* =========================================
   LOAD USER RATING
========================================= */

async function loadUserRating() {

    if (!currentUser) return;

    try {

        const ratingRef = getRatingRef(currentUser.uid);

        const ratingSnapshot = await getDoc(ratingRef);

        if (ratingSnapshot.exists()) {

            const data = ratingSnapshot.data();

            existingRating = data.rating;

            updateStarSelection(existingRating);

            $("rating-form-title").textContent =
                "Update Your Rating";

            submitRatingButton.textContent =
                "Update Rating";

        } else {

            existingRating = 0;

            updateStarSelection(0);

            $("rating-form-title").textContent =
                "How would you rate this book?";

            submitRatingButton.textContent =
                "Submit Rating";

        }

    } catch (error) {

        console.error("Loading user rating failed:", error);

        ratingMessage.textContent =
            "Unable to load your rating.";

    }

}


/* =========================================
   SUBMIT / UPDATE RATING
========================================= */

async function submitRating() {

    if (!currentUser) {

        ratingMessage.textContent =
            "Please sign in before rating.";

        return;
    }

    if (selectedRating < 1 || selectedRating > 5) {

        ratingMessage.textContent =
            "Please select a star rating.";

        return;
    }

    submitRatingButton.disabled = true;

    ratingMessage.textContent = "Saving your rating...";

    try {

        const ratingRef = getRatingRef(currentUser.uid);

        await setDoc(ratingRef, {

            bookId: bookId,

            userId: currentUser.uid,

            rating: selectedRating,

            updatedAt: serverTimestamp()

        });

        existingRating = selectedRating;

        ratingMessage.textContent =
            "Your rating has been saved successfully!";

        $("rating-form-title").textContent =
            "Update Your Rating";

        submitRatingButton.textContent =
            "Update Rating";

        await loadBookRatings();

    } catch (error) {

        console.error("Rating submission failed:", error);

        ratingMessage.textContent =
            "Unable to save rating. Please try again.";

    } finally {

        submitRatingButton.disabled = false;

    }

}

submitRatingButton.addEventListener(
    "click",
    submitRating
);


/* =========================================
   AUTHENTICATION STATE
========================================= */

async function initializeRating(user) {

    currentUser = user;

    if (user) {

        loginRequired.hidden = true;
        ratingForm.hidden = false;

        ratingMessage.textContent = "";

        await loadUserRating();

    } else {

        loginRequired.hidden = false;
        ratingForm.hidden = true;

        selectedRating = 0;
        existingRating = 0;

    }

}


/* =========================================
   AUTH PERSISTENCE & AUTH STATE
========================================= */

async function initializePage() {

    try {

        await authPersistence;

        onAuthStateChanged(auth, async (user) => {

            await initializeRating(user);

        });

    } catch (error) {

        console.error("Authentication initialization failed:", error);

        loginRequired.hidden = false;
        ratingForm.hidden = true;

    }

}


/* =========================================
   SAVED BOOKS - INDEXEDDB
========================================= */

const DB_NAME = "ReadoraDatabase";
const STORE_NAME = "savedBooks";

function openSavedDatabase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = () => {

            const database = request.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {

                database.createObjectStore(STORE_NAME, {
                    keyPath: "id"
                });

            }

        };

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);

    });

}


async function getSavedBook() {

    const database = await openSavedDatabase();

    return new Promise((resolve, reject) => {

        const transaction = database.transaction(
            STORE_NAME,
            "readonly"
        );

        const request = transaction
            .objectStore(STORE_NAME)
            .get(bookId);

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);

    });

}


async function saveBook() {

    const database = await openSavedDatabase();

    const savedBook = {

        id: bookId,

        title: book.title,

        author: book.author,

        category: book.category,

        description: book.description,

        cover: book.cover,

        readerUrl: `reader.html?id=${encodeURIComponent(bookId)}`,

        savedAt: Date.now()

    };

    return new Promise((resolve, reject) => {

        const transaction = database.transaction(
            STORE_NAME,
            "readwrite"
        );

        transaction.objectStore(STORE_NAME).put(savedBook);

        transaction.oncomplete = () => resolve(true);

        transaction.onerror = () => reject(transaction.error);

    });

}


async function removeSavedBook() {

    const database = await openSavedDatabase();

    return new Promise((resolve, reject) => {

        const transaction = database.transaction(
            STORE_NAME,
            "readwrite"
        );

        transaction.objectStore(STORE_NAME).delete(bookId);

        transaction.oncomplete = () => resolve(true);

        transaction.onerror = () => reject(transaction.error);

    });

}


async function updateSaveButton() {

    try {

        const saved = await getSavedBook();

        if (saved) {

            saveBookButton.textContent = "♥ Saved";

            saveBookButton.classList.add("saved");

        } else {

            saveBookButton.textContent = "♡ Save Book";

            saveBookButton.classList.remove("saved");

        }

    } catch (error) {

        console.error("Checking saved book failed:", error);

    }

}


saveBookButton.addEventListener("click", async () => {

    saveBookButton.disabled = true;

    try {

        const saved = await getSavedBook();

        if (saved) {

            await removeSavedBook();

            saveMessage.textContent = "Book removed from your saved list.";

        } else {

            await saveBook();

            saveMessage.textContent = "Book saved successfully.";

        }

        await updateSaveButton();

    } catch (error) {

        console.error("Saving book failed:", error);

        saveMessage.textContent =
            "Unable to save this book.";

    } finally {

        saveBookButton.disabled = false;

    }

});


/* =========================================
   INITIALIZE
========================================= */

if (loadBookDetails()) {

    loadBookRatings();

    initializePage();

    updateSaveButton();

}


/* =========================================
   SHARED SAVED BOOK API
========================================= */

window.ReadoraSavedBooks = {

    async getAll() {

        const database = await openSavedDatabase();

        return new Promise((resolve, reject) => {

            const transaction = database.transaction(
                STORE_NAME,
                "readonly"
            );

            const request = transaction
                .objectStore(STORE_NAME)
                .getAll();

            request.onsuccess = () => resolve(request.result);

            request.onerror = () => reject(request.error);

        });

    },

    async getById(id) {

        const database = await openSavedDatabase();

        return new Promise((resolve, reject) => {

            const transaction = database.transaction(
                STORE_NAME,
                "readonly"
            );

            const request = transaction
                .objectStore(STORE_NAME)
                .get(id);

            request.onsuccess = () => resolve(request.result);

            request.onerror = () => reject(request.error);

        });

    },

    async remove(id) {

        const database = await openSavedDatabase();

        return new Promise((resolve, reject) => {

            const transaction = database.transaction(
                STORE_NAME,
                "readwrite"
            );

            transaction.objectStore(STORE_NAME).delete(id);

            transaction.oncomplete = () => resolve(true);

            transaction.onerror = () => reject(transaction.error);

        });

    }

};
