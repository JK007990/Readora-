/* =====================================================
   READORA BOOKSTORE
   PROFILE PAGE + FIREBASE AUTHENTICATION
===================================================== */

import {
    onAuthStateChanged,
    updateProfile,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import { auth } from "../firebase-config.js";


/* ==================== DOM ELEMENTS ==================== */

const profileAvatar = document.getElementById("profile-avatar");

const sidebarUserName = document.getElementById("sidebar-user-name");
const sidebarUserEmail = document.getElementById("sidebar-user-email");

const displayNameInput = document.getElementById("display-name");
const profileEmailInput = document.getElementById("profile-email");

const profileForm = document.getElementById("profile-form");
const saveProfileButton = document.getElementById("save-profile");
const profileMessage = document.getElementById("profile-message");

const logoutButton = document.getElementById("logout-button");
const settingsLogoutButton = document.getElementById(
    "settings-logout-button"
);

const currentYear = document.getElementById("current-year");


/* ==================== CURRENT USER ==================== */

let currentUser = null;

let originalDisplayName = "";


/* ==================== DEFAULT AVATAR ==================== */

const DEFAULT_AVATAR =
    "https://placehold.co/120x120/fff0e6/f47721?text=R";


/* ==================== MESSAGE ==================== */

function showMessage(message, type = "") {

    if (!profileMessage) return;

    profileMessage.textContent = message;
    profileMessage.className = type;

}


/* ==================== UPDATE PROFILE UI ==================== */

function updateProfileUI(user) {

    if (!user) {

        currentUser = null;

        sidebarUserName.textContent = "Guest Reader";
        sidebarUserEmail.textContent = "Not signed in";

        displayNameInput.value = "";
        profileEmailInput.value = "";

        profileAvatar.src = DEFAULT_AVATAR;
        profileAvatar.alt = "Guest Reader";

        displayNameInput.disabled = true;
        saveProfileButton.disabled = true;

        showMessage(
            "Sign in to manage your profile."
        );

        return;
    }

    currentUser = user;

    const name = user.displayName?.trim() || "Reader";
    const email = user.email || "No email available";

    originalDisplayName = user.displayName || "";

    sidebarUserName.textContent = name;
    sidebarUserEmail.textContent = email;

    displayNameInput.value = originalDisplayName;
    profileEmailInput.value = email;

    profileAvatar.src = user.photoURL || DEFAULT_AVATAR;
    profileAvatar.alt = `${name}'s profile picture`;

    displayNameInput.disabled = false;
    saveProfileButton.disabled = false;

    showMessage("");

}


/* ==================== AVATAR ERROR HANDLING ==================== */

profileAvatar.addEventListener("error", () => {

    if (profileAvatar.src !== DEFAULT_AVATAR) {
        profileAvatar.src = DEFAULT_AVATAR;
    }

});


/* ==================== AUTH STATE ==================== */

onAuthStateChanged(auth, (user) => {

    updateProfileUI(user);

});


/* ==================== SAVE PROFILE ==================== */

profileForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!currentUser) {

        showMessage(
            "Please sign in before updating your profile.",
            "error"
        );

        return;
    }

    const newDisplayName = displayNameInput.value.trim();

    if (!newDisplayName) {

        showMessage(
            "Please enter your full name.",
            "error"
        );

        displayNameInput.focus();

        return;
    }

    if (newDisplayName.length > 80) {

        showMessage(
            "Name must be 80 characters or fewer.",
            "error"
        );

        return;
    }

    if (newDisplayName === originalDisplayName) {

        showMessage("No changes to save.");

        return;
    }

    saveProfileButton.disabled = true;

    saveProfileButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Saving...
    `;

    showMessage("");

    try {

        await updateProfile(currentUser, {
            displayName: newDisplayName
        });

        originalDisplayName = newDisplayName;

        sidebarUserName.textContent = newDisplayName;

        profileAvatar.alt = `${newDisplayName}'s profile picture`;

        showMessage(
            "Profile updated successfully!",
            "success"
        );

    } catch (error) {

        console.error("Profile update error:", error);

        if (error.code === "auth/requires-recent-login") {

            showMessage(
                "Please sign in again before changing your profile.",
                "error"
            );

        } else {

            showMessage(
                "Unable to update your profile. Please try again.",
                "error"
            );

        }

    } finally {

        saveProfileButton.disabled = !currentUser;

        saveProfileButton.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Save Changes
        `;

    }

});


/* ==================== LOGOUT ==================== */

async function handleLogout() {

    const confirmed = window.confirm(
        "Are you sure you want to log out of Readora?"
    );

    if (!confirmed) return;

    if (logoutButton) {
        logoutButton.disabled = true;
    }

    if (settingsLogoutButton) {
        settingsLogoutButton.disabled = true;
    }

    try {

        await signOut(auth);

        showMessage(
            "You have been logged out successfully.",
            "success"
        );

        // Stay on profile.html.
        // Do not automatically redirect to Login.

    } catch (error) {

        console.error("Logout error:", error);

        showMessage(
            "Unable to log out. Please try again.",
            "error"
        );

    } finally {

        if (logoutButton) {
            logoutButton.disabled = false;
        }

        if (settingsLogoutButton) {
            settingsLogoutButton.disabled = false;
        }

    }

}


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        handleLogout
    );

}


if (settingsLogoutButton) {

    settingsLogoutButton.addEventListener(
        "click",
        handleLogout
    );

}


/* ==================== PROFILE MENU ==================== */

const menuItems = document.querySelectorAll(
    ".profile-menu .menu-item"
);

menuItems.forEach((item) => {

    item.addEventListener("click", () => {

        menuItems.forEach((menuItem) => {
            menuItem.classList.remove("active");
        });

        item.classList.add("active");

    });

});


/* ==================== CURRENT YEAR ==================== */

if (currentYear) {

    currentYear.textContent = new Date().getFullYear();

}


/* ==================== TEMPORARY COUNTS ==================== */

// These values remain temporary until Orders and Wishlist
// are connected to their actual data sources.

const ordersCount = document.getElementById("orders-count");
const wishlistCount = document.getElementById("wishlist-count");
const booksCount = document.getElementById("books-count");

if (ordersCount) ordersCount.textContent = "0";
if (wishlistCount) wishlistCount.textContent = "0";
if (booksCount) booksCount.textContent = "0";