"use strict";

/* ================================
   AUTHOR DATA
================================ */

const authors = [
    {
        name: "James Clear",
        slug: "james-clear"
    },
    {
        name: "Morgan Housel",
        slug: "morgan-housel"
    },
    {
        name: "Anna Lembke",
        slug: "anna-lembke"
    },
    {
        name: "Brianna Wiest",
        slug: "brianna-wiest"
    },
    {
        name: "Napoleon Hill",
        slug: "napoleon-hill"
    },
    {
        name: "Robert T. Kiyosaki",
        slug: "robert-t-kiyosaki"
    },
    {
        name: "Paulo Coelho",
        slug: "paulo-coelho"
    },
    {
        name: "Héctor García",
        slug: "hector-garcia"
    },
    {
        name: "Francesc Miralles",
        slug: "francesc-miralles"
    }
];


/* ================================
   BOOK DATA
================================ */

const books = [
    {
        id: "atomic-habits",
        title: "Atomic Habits",
        author: "James Clear"
    },
    {
        id: "psychology-of-money",
        title: "The Psychology of Money",
        author: "Morgan Housel"
    },
    {
        id: "dopamine-nation",
        title: "Dopamine Nation",
        author: "Anna Lembke"
    },
    {
        id: "the-mountain-is-you",
        title: "The Mountain Is You",
        author: "Brianna Wiest"
    },
    {
        id: "think-and-grow-rich",
        title: "Think and Grow Rich",
        author: "Napoleon Hill"
    },
    {
        id: "rich-dad-poor-dad",
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki"
    },
    {
        id: "the-alchemist",
        title: "The Alchemist",
        author: "Paulo Coelho"
    },
    {
        id: "ikigai",
        title: "Ikigai",
        author: "Héctor García & Francesc Miralles"
    }
];


/* ================================
   ELEMENTS
================================ */

const authorsGrid = document.getElementById("authorsGrid");
const authorSearch = document.getElementById("authorSearch");

const authorListSection = document.getElementById("authorListSection");
const authorProfileSection = document.getElementById("authorProfileSection");

const authorProfile = document.getElementById("authorProfile");
const emptyState = document.getElementById("emptyState");

const backToAuthors = document.getElementById("backToAuthors");


/* ================================
   HELPER FUNCTIONS
================================ */

function getInitials(name) {
    return name
        .split(" ")
        .filter(Boolean)
        .map(part => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();
}


function getAuthorBooks(authorName) {
    return books.filter(book => {
        const bookAuthors = book.author
            .split("&")
            .map(name => name.trim());

        return bookAuthors.some(name =>
            name.toLowerCase() === authorName.toLowerCase()
        );
    });
}


function getAuthorBySlug(slug) {
    return authors.find(author => author.slug === slug);
}


/* ================================
   RENDER AUTHOR LIST
================================ */

function renderAuthors(searchText = "") {
    const filteredAuthors = authors.filter(author =>
        author.name.toLowerCase().includes(searchText.toLowerCase())
    );

    authorsGrid.innerHTML = "";

    emptyState.hidden = filteredAuthors.length > 0;

    filteredAuthors.forEach(author => {
        const authorBooks = getAuthorBooks(author.name);

        const card = document.createElement("article");
        card.className = "author-card";

        card.innerHTML = `
            <div class="author-avatar">
                ${getInitials(author.name)}
            </div>

            <h3>${author.name}</h3>

            <p>
                ${authorBooks.length}
                ${authorBooks.length === 1 ? "Book" : "Books"}
            </p>

            <a
                href="authors.html?author=${encodeURIComponent(author.slug)}"
                class="view-profile"
                data-author="${author.slug}"
            >
                View Profile
            </a>
        `;

        authorsGrid.appendChild(card);
    });
}


/* ================================
   RENDER AUTHOR PROFILE
================================ */

function renderAuthorProfile(author) {
    const authorBooks = getAuthorBooks(author.name);

    const bookCards = authorBooks.length
        ? authorBooks.map(book => `
            <article class="profile-book-card">

                <div class="book-cover">
                    ${book.title}
                </div>

                <div class="profile-book-info">
                    <h3>${book.title}</h3>

                    <a
                        href="book-details.html?id=${encodeURIComponent(book.id)}"
                        class="book-details-link"
                    >
                        View Book Details →
                    </a>
                </div>

            </article>
        `).join("")
        : `<p class="no-books">No books have been added for this author yet.</p>`;

    authorProfile.innerHTML = `
        <div class="profile-header">

            <div class="profile-avatar">
                ${getInitials(author.name)}
            </div>

            <div class="profile-info">
                <span class="eyebrow">AUTHOR PROFILE</span>

                <h1>${author.name}</h1>

                <p>
                    Author biography has not been added yet.
                </p>
            </div>

        </div>

        <div class="profile-books-heading">
            <h2>Books by ${author.name}</h2>

            <p>
                ${authorBooks.length}
                ${authorBooks.length === 1 ? "book" : "books"}
                available in Readora.
            </p>
        </div>

        <div class="profile-books">
            ${bookCards}
        </div>
    `;
}


/* ================================
   SHOW AUTHOR LIST
================================ */

function showAuthorList(updateHistory = true) {
    authorListSection.hidden = false;
    authorProfileSection.hidden = true;

    if (updateHistory) {
        history.pushState(
            {},
            "",
            "authors.html"
        );
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ================================
   SHOW AUTHOR PROFILE
================================ */

function showAuthorProfile(author, updateHistory = true) {
    if (!author) {
        showAuthorList(false);
        return;
    }

    authorListSection.hidden = true;
    authorProfileSection.hidden = false;

    renderAuthorProfile(author);

    if (updateHistory) {
        history.pushState(
            {},
            "",
            `authors.html?author=${encodeURIComponent(author.slug)}`
        );
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ================================
   AUTHOR PROFILE CLICK
================================ */

authorsGrid.addEventListener("click", function(event) {
    const link = event.target.closest("[data-author]");

    if (!link) return;

    event.preventDefault();

    const slug = link.dataset.author;
    const author = getAuthorBySlug(slug);

    showAuthorProfile(author);
});


/* ================================
   SEARCH
================================ */

authorSearch.addEventListener("input", function() {
    renderAuthors(this.value);
});


/* ================================
   BACK BUTTON
================================ */

backToAuthors.addEventListener("click", function() {
    showAuthorList();
});


/* ================================
   BROWSER BACK / FORWARD
================================ */

window.addEventListener("popstate", function() {
    loadPageFromURL();
});


/* ================================
   LOAD PAGE FROM URL
================================ */

function loadPageFromURL() {
    const params = new URLSearchParams(window.location.search);
    const authorSlug = params.get("author");

    if (authorSlug) {
        const author = getAuthorBySlug(authorSlug);

        if (author) {
            showAuthorProfile(author, false);
            return;
        }
    }

    showAuthorList(false);
}


/* ================================
   INITIALIZE
================================ */

renderAuthors();
loadPageFromURL();