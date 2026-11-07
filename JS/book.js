/* ==========================================
   READORA - SEARCH + CATEGORY FILTER
========================================== */

(() => {
    "use strict";

    function initBookFilter() {

        const grid = document.querySelector(".books-grid");
        const buttons = Array.from(
            document.querySelectorAll(".category-chip")
        );

        const count = document.querySelector(".book-count");
        const searchInput = document.getElementById("bookSearch");
        const clearButton = document.getElementById("clearSearch");
        const emptyMessage = document.getElementById("noBooksMessage");

        if (!grid || buttons.length === 0) {
            console.error("Readora: Books grid or category buttons not found.");
            return;
        }

        const cards = Array.from(
            grid.querySelectorAll(".book-card")
        );

        let activeCategory = "all-books";
        let searchText = "";

        // Normalize category names
        function normalize(value) {
            return String(value || "")
                .trim()
                .toLowerCase()
                .replace(/&/g, "and")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
        }

        function getCategory(button) {
            return (button.getAttribute("href") || "")
                .replace(/^#/, "");
        }

        // MAIN FILTER
        function filterBooks() {

            let visible = 0;

            cards.forEach((card) => {

                const categoryElement =
                    card.querySelector(".book-category");

                const bookCategory = categoryElement
                    ? normalize(categoryElement.textContent)
                    : "";

                const selectedCategory = normalize(activeCategory);

                const isAll =
                    selectedCategory === "all-books" ||
                    selectedCategory === "all";

                // Category matching
                const categoryMatches =
                    isAll || bookCategory === selectedCategory;

                // Search matching
                const searchableText = card.textContent
                    .replace(/\s+/g, " ")
                    .trim()
                    .toLowerCase();

                const searchMatches =
                    !searchText ||
                    searchableText.includes(searchText);

                // Final result
                const shouldShow =
                    categoryMatches && searchMatches;

                card.hidden = !shouldShow;

                if (shouldShow) {
                    visible++;
                }

            });

            // Update book count
            if (count) {
                count.textContent =
                    `${visible} ${visible === 1 ? "book" : "books"}`;
            }

            // Empty message
            if (emptyMessage) {
                emptyMessage.hidden = visible !== 0;
            }

            // Active category
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

            // Clear button
            if (clearButton) {
                clearButton.classList.toggle(
                    "is-visible",
                    searchText.length > 0
                );
            }
        }

        // CATEGORY CLICK
        buttons.forEach((button) => {

            button.addEventListener("click", (event) => {

                event.preventDefault();

                activeCategory =
                    getCategory(button) || "all-books";

                const newHash =
                    "#" + encodeURIComponent(activeCategory);

                if (window.location.hash !== newHash) {
                    history.replaceState(null, "", newHash);
                }

                filterBooks();

            });

        });

        // SEARCH INPUT
        if (searchInput) {

            searchInput.addEventListener("input", () => {

                searchText = searchInput.value
                    .trim()
                    .toLowerCase();

                filterBooks();

            });

        }

        // CLEAR SEARCH
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

        // LOAD CATEGORY FROM URL
        function loadFromURL() {

            let categoryFromURL = "";

            try {
                categoryFromURL = decodeURIComponent(
                    window.location.hash.substring(1)
                );
            } catch (error) {
                categoryFromURL = "";
            }

            const matchingButton = buttons.find((button) => {

                return normalize(getCategory(button)) ===
                    normalize(categoryFromURL);

            });

            activeCategory = matchingButton
                ? getCategory(matchingButton)
                : "all-books";

            filterBooks();

        }

        window.addEventListener("hashchange", loadFromURL);

        loadFromURL();

        console.log(
            `Readora: Search + Category Filter ready. ${cards.length} books found.`
        );

    }

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initBookFilter
        );

    } else {

        initBookFilter();

    }

})();
