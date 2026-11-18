
/* ==========================================
   READORA - BOOK DATABASE
   CLOUDFLARE R2 + SEARCH + CATEGORY FILTER
========================================== */

export const books = {

    "အသက် ၂၀ မှာပြောင်းလဲရမယ့် အချက် ၂၀": {
        title: "အသက် ၂၀ မှာပြောင်းလဲရမယ့် အချက် ၂၀",
        author: "Monica",
        category: "Non Fiction",
        cover: "https://pub-a7a0dc4aff994c599af04d73bafcff56.r2.dev/coverphoto/photo_2026-11-18_22-33-42.jpg",
        description: "အခုတွေးကြည့်ရင် ကိုယ်ဘေးနားကတစ်ယောက်ဆုံးရှုံးသွားတဲ့အခါ မပြောလိုက်ရတဲ့ စကားတွေ မလုပ်လိုက်ရတဲ့အလုပ်တွေ ပေးချင်တဲ့လက်ဆောင်တွေ အများကြီးကျန်နေခဲ့မှာနော်....။ ချစ်တဲ့သူတွေနဲ့နေရတဲ့ဘဝက အကောင်းဆုံးအခိုက်အတန့်ပဲမို့ ဒီစာကိုဖတ်မိရင် ကိုယ်ချစ်ရတဲ့သူတွေရဲ့တန်ဖိုးကို ခဏလောက်တွေးကြည့်ရအောင်...။"
    },

    "psychology-of-money": {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        category: "Non Fiction",
        cover: "",
        description: "A collection of stories exploring how people think about money, wealth, greed, and happiness."
    },

    "dopamine-nation": {
        title: "Dopamine Nation",
        author: "Anna Lembke",
        category: "Non Fiction",
        cover: "",
        description: "Explores the relationship between pleasure and pain in a world overflowing with addictive stimulation."
    },

    "the-mountain-is-you": {
        title: "The Mountain Is You",
        author: "Brianna Wiest",
        category: "Non Fiction",
        cover: "",
        description: "A guide to understanding self-sabotage and transforming the obstacles within yourself into opportunities for growth."
    },

    "think-and-grow-rich": {
        title: "Think and Grow Rich",
        author: "Napoleon Hill",
        category: "Non Fiction",
        cover: "",
        description: "A classic personal development book about mindset, determination, and principles associated with achieving success."
    },

    "rich-dad-poor-dad": {
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        category: "Non Fiction",
        cover: "",
        description: "Introduces financial literacy and different ways of thinking about money, investing, and building wealth."
    },

    "မောင့်ကိုမပြောချင်ဘူး": {
        title: "မောင့်ကိုမပြောချင်ဘူး",
        author: "ပုညခင်",
        category: "Normal Fiction",
        cover: "https://pub-a7a0dc4aff994c599af04d73bafcff56.r2.dev/coverphoto/photo_2026-11-18_23-01-17.jpg",
        description: "တချို့ငွေနဲ့လဲလှယ်လို့ရတဲ့ ပစ္စည်းတွေရှိတယ်။ တန်သလား? တချို့ဂုဏ်သိက္ခာနဲ့ ငွေကြေးနဲ့ လဲလှယ်လိုက်တာတွေရှိတယ်။ တန်သလား? တချို့ကိုယ့်မာနနဲ့ ချစ်ရတဲ့သူကို ဆုံးရှုံးလိုက်ရတာတွေရှိတယ်။ တန်သလား? တန်ပါသလား? တချို့ကိစ္စတွေမှာ အနောက်ပြန်လှည့်ကြည့်လိုက်ရင် တကယ်တန်ရဲ့လားလို့ ပြန်မေးဖူးလား။"
    },

    "ikigai": {
        title: "Ikigai",
        author: "Héctor García and Francesc Miralles",
        category: "Non Fiction",
        cover: "",
        description: "Explores the Japanese concept of ikigai and how purpose, meaningful work, and daily habits can contribute to a fulfilling life."
    }

};


/* ==========================================
   BOOK COVER IMAGES
========================================== */

function loadBookCovers() {

    const cards = document.querySelectorAll(".book-card");

    cards.forEach((card) => {

        const detailLink = card.querySelector(
            'a[href*="book-details.html?id="]'
        );

        if (!detailLink) return;

        const url = new URL(detailLink.href, window.location.href);

        const bookId = url.searchParams.get("id");

        const book = books[bookId];

        if (!book || !book.cover) return;

        const coverElement = card.querySelector(".book-cover");

        if (!coverElement) return;

        // Avoid duplicate images
        if (coverElement.querySelector(".book-cover-image")) return;

        const image = document.createElement("img");

        image.className = "book-cover-image";
        image.src = book.cover;
        image.alt = `${book.title} book cover`;
        image.loading = "lazy";

        image.onerror = () => {

            image.remove();

            coverElement.classList.remove("has-cover-image");

            console.error(
                `Readora: Cover image failed for ${book.title}`
            );

        };

        coverElement.classList.add("has-cover-image");

        coverElement.prepend(image);

    });

}


/* ==========================================
   SEARCH + CATEGORY FILTER
========================================== */

function initBookFilter() {

    const grid = document.querySelector(".books-grid");

    if (!grid) return;

    const buttons = Array.from(
        document.querySelectorAll(".category-chip")
    );

    const cards = Array.from(
        grid.querySelectorAll(".book-card")
    );

    const count = document.querySelector(".book-count");

    const searchInput = document.getElementById("bookSearch");

    const clearButton = document.getElementById("clearSearch");

    const emptyMessage = document.getElementById("noBooksMessage");


    let activeCategory = "All";

    let searchText = "";


    /* NORMALIZE TEXT */

    function normalize(value) {

        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    }


    /* GET CATEGORY */

    function getCategory(button) {

        return button.dataset.category || "All";

    }


    /* FILTER BOOKS */

    function filterBooks() {

        let visible = 0;

        cards.forEach((card) => {

            const bookCategory =
                card.dataset.category ||
                card.querySelector(".book-category")?.textContent ||
                "";

            const selectedCategory = normalize(activeCategory);

            const isAll =
                selectedCategory === "all" ||
                selectedCategory === "all-books";

            const categoryMatches =
                isAll ||
                normalize(bookCategory) === selectedCategory;


            const searchableText = card.textContent
                .replace(/\s+/g, " ")
                .trim()
                .toLowerCase();

            const searchMatches =
                !searchText ||
                searchableText.includes(searchText);


            const shouldShow =
                categoryMatches && searchMatches;


            card.hidden = !shouldShow;

            if (shouldShow) {

                visible++;

            }

        });


        /* BOOK COUNT */

        if (count) {

            count.textContent =
                `${visible} ${visible === 1 ? "book" : "books"}`;

        }


        /* EMPTY MESSAGE */

        if (emptyMessage) {

            emptyMessage.hidden = visible !== 0;

        }


        /* ACTIVE CATEGORY */

        buttons.forEach((button) => {

            const isActive =
                normalize(getCategory(button)) ===
                normalize(activeCategory);

            button.classList.toggle("active", isActive);

            button.setAttribute(
                "aria-pressed",
                String(isActive)
            );

        });


        /* CLEAR SEARCH BUTTON */

        if (clearButton) {

            clearButton.classList.toggle(
                "is-visible",
                searchText.length > 0
            );

        }

    }


    /* ======================================
       CATEGORY CLICK
    ====================================== */

    buttons.forEach((button) => {

        button.addEventListener("click", (event) => {

            event.preventDefault();

            activeCategory = getCategory(button);

            // Keep URL clean and use a safe hash
            const newHash =
                "#category-" +
                encodeURIComponent(normalize(activeCategory));

            if (window.location.hash !== newHash) {

                history.replaceState(null, "", newHash);

            }

            filterBooks();

        });

    });


    /* ======================================
       SEARCH
    ====================================== */

    if (searchInput) {

        searchInput.addEventListener("input", () => {

            searchText = searchInput.value
                .trim()
                .toLowerCase();

            filterBooks();

        });

    }


    /* ======================================
       CLEAR SEARCH
    ====================================== */

    if (clearButton) {

        clearButton.addEventListener("click", () => {

            if (searchInput) {

                searchInput.value = "";

                searchInput.focus();

            }

            searchText = "";

            filterBooks();

        });

    }


    /* ======================================
       LOAD CATEGORY FROM URL
    ====================================== */

    function loadFromURL() {

        const hash = window.location.hash;

        if (!hash || hash === "#all-books") {

            activeCategory = "All";

            filterBooks();

            return;

        }


        const categoryHash = hash.replace(/^#category-/, "");

        let decodedCategory = "";

        try {

            decodedCategory = decodeURIComponent(categoryHash);

        } catch (error) {

            decodedCategory = "";

        }


        const matchingButton = buttons.find((button) => {

            return normalize(getCategory(button)) ===
                normalize(decodedCategory);

        });


        activeCategory = matchingButton
            ? getCategory(matchingButton)
            : "All";

        filterBooks();

    }


    window.addEventListener("hashchange", loadFromURL);


    // Initial filter
    loadFromURL();


    console.log(
        `Readora: ${cards.length} books loaded.`
    );

}


/* ==========================================
   INITIALIZE
========================================== */

function initializeBooksPage() {

    loadBookCovers();

    initBookFilter();

}


if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeBooksPage
    );

} else {

    initializeBooksPage();

}
