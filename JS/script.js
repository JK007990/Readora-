
/* =====================================================
   FIREBASE AUTH IMPORTS
===================================================== */

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import { auth } from "./firebase-config.js";


/* =====================================================
   READORA BOOKSTORE - MAIN JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       RESPONSIVE MOBILE MENU
    ===================================================== */

    const menuToggle = document.getElementById("mobileMenuBtn");
    const navLinks = document.getElementById("mainNav");
    const menuIcon = menuToggle
        ? menuToggle.querySelector("i")
        : null;

    function closeMobileMenu() {
        if (!menuToggle || !navLinks) return;

        navLinks.classList.remove("open");
        menuToggle.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");

        if (menuIcon) {
            menuIcon.classList.remove("fa-xmark");
            menuIcon.classList.add("fa-bars");
        }
    }

    if (menuToggle && navLinks) {

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-controls", "mainNav");

        menuToggle.addEventListener("click", event => {
            event.stopPropagation();

            const isOpen = navLinks.classList.toggle("open");

            menuToggle.classList.toggle("active", isOpen);

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close menu" : "Open menu"
            );

            if (menuIcon) {
                menuIcon.classList.toggle("fa-bars", !isOpen);
                menuIcon.classList.toggle("fa-xmark", isOpen);
            }
        });

        // Close when clicking a navigation link
        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                closeMobileMenu();
            });
        });

        // Close when clicking outside
        document.addEventListener("click", event => {
            if (
                !navLinks.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                closeMobileMenu();
            }
        });

        // Close with Escape key
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeMobileMenu();
            }
        });

        // Close when switching to desktop
        window.addEventListener("resize", () => {
            if (window.innerWidth > 850) {
                closeMobileMenu();
            }
        });
    }


    /* =====================================================
       SEARCH BOOKS
    ===================================================== */

    const searchForm = document.getElementById("searchForm");

    const searchInputs = document.querySelectorAll(
        "#searchInput, #search-input, .search-input, input[type='search']"
    );

    const bookCards = document.querySelectorAll(
        "#bookGrid .book-card, .book-card, .book-item"
    );

    const noResults = document.getElementById("noResults");
    const resetSearch = document.getElementById("resetSearch");

    function searchBooks(keyword = "") {

        const query = keyword.trim().toLowerCase();

        let visibleCount = 0;

        bookCards.forEach(book => {

            const searchableText = [
                book.textContent,
                book.dataset.title || "",
                book.dataset.category || ""
            ].join(" ").toLowerCase();

            const matches = searchableText.includes(query);

            book.style.display = matches ? "" : "none";

            if (matches) visibleCount++;
        });

        if (noResults) {
            noResults.classList.toggle(
                "hidden",
                visibleCount > 0
            );
        }
    }

    searchInputs.forEach(input => {

        input.addEventListener("input", () => {

            searchInputs.forEach(otherInput => {

                if (otherInput !== input) {
                    otherInput.value = input.value;
                }

            });

            searchBooks(input.value);
        });

    });

    if (searchForm) {

        searchForm.addEventListener("submit", event => {

            event.preventDefault();

            const input = document.getElementById("searchInput");

            searchBooks(input ? input.value : "");
        });

    }

    if (resetSearch) {

        resetSearch.addEventListener("click", () => {

            searchInputs.forEach(input => {
                input.value = "";
            });

            searchBooks("");

            document.querySelectorAll(".filter-btn").forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.filter === "all"
                );

            });

        });

    }


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    const categoryButtons = document.querySelectorAll(
        ".filter-btn, [data-category-filter], [data-category], .category-filter"
    );

    function filterBooks(category = "all") {

        const selected = category.trim().toLowerCase();

        let visibleCount = 0;

        bookCards.forEach(book => {

            const bookCategory = (
                book.dataset.category ||
                book.dataset.genre ||
                ""
            ).trim().toLowerCase();

            const matches =
                selected === "all" ||
                selected === "all books" ||
                selected === "all categories" ||
                bookCategory === selected;

            book.style.display = matches ? "" : "none";

            if (matches) visibleCount++;
        });

        if (noResults) {
            noResults.classList.toggle(
                "hidden",
                visibleCount > 0
            );
        }
    }

    categoryButtons.forEach(button => {

        button.addEventListener("click", () => {

            const category =
                button.dataset.filter ||
                button.dataset.categoryFilter ||
                button.dataset.category ||
                button.textContent.trim();

            categoryButtons.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            filterBooks(category);
        });

    });

    document.querySelectorAll("[data-category-filter]").forEach(card => {

        card.addEventListener("click", () => {

            const category = card.dataset.categoryFilter;

            if (!category) return;

            const matchingFilter = document.querySelector(
                `.filter-btn[data-filter="${category}"]`
            );

            if (matchingFilter) {
                matchingFilter.click();
            } else {
                filterBooks(category);
            }

        });

    });


    /* =====================================================
       FIREBASE USER PROFILE
    ===================================================== */

    const guestActions = document.getElementById("guestActions");
    const userArea = document.getElementById("userArea");

    const avatarBtn = document.getElementById("avatarBtn");
    const profileMenu = document.getElementById("profileMenu");

    const headerAvatar = document.getElementById("headerAvatar");
    const avatarFallback = document.getElementById("avatarFallback");

    const menuAvatar = document.getElementById("menuAvatar");
    const menuAvatarFallback = document.getElementById("menuAvatarFallback");

    const userDisplayName = document.getElementById("userDisplayName");
    const userEmail = document.getElementById("userEmail");

    const logoutBtn = document.getElementById("logoutBtn");


    /* =====================================================
       SET USER AVATAR
    ===================================================== */

    function setAvatar(user) {

        const displayName =
            user.displayName ||
            user.email?.split("@")[0] ||
            "Reader";

        const initial = displayName.charAt(0).toUpperCase();

        const photoURL = user.photoURL || "";

        if (userDisplayName) {
            userDisplayName.textContent = displayName;
        }

        if (userEmail) {
            userEmail.textContent = user.email || "";
        }

        function updateAvatar(image, fallback) {

            if (!image || !fallback) return;

            fallback.textContent = initial;

            image.onload = () => {
                image.style.display = "block";
                fallback.style.display = "none";
            };

            image.onerror = () => {
                image.style.display = "none";
                fallback.style.display = "flex";
            };

            if (photoURL) {

                image.src = photoURL;
                image.alt = displayName;

            } else {

                image.removeAttribute("src");

                image.style.display = "none";
                fallback.style.display = "flex";
            }
        }

        updateAvatar(headerAvatar, avatarFallback);
        updateAvatar(menuAvatar, menuAvatarFallback);
    }


    /* =====================================================
       FIREBASE AUTH STATE
    ===================================================== */

    onAuthStateChanged(auth, user => {

        if (user) {

            // Hide Login and Sign Up
            if (guestActions) {
                guestActions.classList.add("hidden");
            }

            // Show profile avatar
            if (userArea) {
                userArea.classList.remove("hidden");
            }

            setAvatar(user);

        } else {

            // Show Login and Sign Up
            if (guestActions) {
                guestActions.classList.remove("hidden");
            }

            // Hide profile area
            if (userArea) {
                userArea.classList.add("hidden");
            }

            // Close dropdown
            if (profileMenu) {
                profileMenu.classList.add("hidden");
            }

            if (avatarBtn) {
                avatarBtn.setAttribute("aria-expanded", "false");
            }
        }

    });


    /* =====================================================
       PROFILE DROPDOWN
    ===================================================== */

    if (avatarBtn && profileMenu) {

        avatarBtn.addEventListener("click", event => {

            event.stopPropagation();

            const isOpen =
                profileMenu.classList.toggle("hidden") === false;

            avatarBtn.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        });

        profileMenu.addEventListener("click", event => {
            event.stopPropagation();
        });

        document.addEventListener("click", () => {

            profileMenu.classList.add("hidden");

            avatarBtn.setAttribute("aria-expanded", "false");

        });

        document.addEventListener("keydown", event => {

            if (event.key === "Escape") {

                profileMenu.classList.add("hidden");

                avatarBtn.setAttribute("aria-expanded", "false");
            }

        });

    }


    /* =====================================================
       LOG OUT
    ===================================================== */

    if (logoutBtn) {

        logoutBtn.addEventListener("click", async () => {

            logoutBtn.disabled = true;

            try {

                await signOut(auth);

                if (profileMenu) {
                    profileMenu.classList.add("hidden");
                }

                // Return to Home page
                window.location.href = "index.html";

            } catch (error) {

                console.error("Logout failed:", error);

                alert("Unable to log out. Please try again.");

                logoutBtn.disabled = false;
            }

        });

    }


    /* =====================================================
       NEWSLETTER FORM
    ===================================================== */

    const newsletterForm = document.querySelector(
        "#newsletterForm, .newsletter-form, #newsletter-form"
    );

    if (newsletterForm) {

        newsletterForm.addEventListener("submit", event => {

            event.preventDefault();

            const emailInput = newsletterForm.querySelector(
                "input[type='email']"
            );

            if (!emailInput || !emailInput.value.trim()) {

                alert("Please enter your email address.");

                return;
            }

            alert("Thank you for subscribing to Readora!");

            newsletterForm.reset();
        });

    }


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    const yearElements = document.querySelectorAll(
        "#currentYear, #current-year, .current-year"
    );

    yearElements.forEach(element => {

        element.textContent = new Date().getFullYear();

    });


    /* =====================================================
       SMOOTH SCROLL
    ===================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    /* =====================================================
       SCROLL REVEAL ANIMATION
    ===================================================== */

    const revealElements = document.querySelectorAll(
        ".reveal, .fade-in, .book-card, .category-card"
    );

    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observer.unobserve(entry.target);
                    }

                });

            },
            {
                threshold: 0.12
            }
        );

        revealElements.forEach(element => {
            observer.observe(element);
        });

    } else {

        revealElements.forEach(element => {
            element.classList.add("visible");
        });

    }


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    const backToTop = document.querySelector(
        "#back-to-top, .back-to-top"
    );

    if (backToTop) {

        backToTop.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

        window.addEventListener("scroll", () => {

            backToTop.classList.toggle(
                "visible",
                window.scrollY > 300
            );

        });

    }

});
