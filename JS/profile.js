
/* =========================================
   READORA PROFILE PAGE
   FIREBASE AUTH + SAVED BOOKS
========================================= */

import {
    onAuthStateChanged,
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import { auth } from "./firebase-config.js";


document.addEventListener("DOMContentLoaded", () => {

    const $ = selector => document.querySelector(selector);

    const profileName = $("#profileName");
    const profileEmail = $("#profileEmail");
    const profileAvatar = $("#profileAvatar");
    const avatarPlaceholder = $("#avatarPlaceholder");

    const editProfileBtn = $("#editProfileBtn");
    const logoutBtn = $("#logoutBtn");

    const modalOverlay = $("#modalOverlay");
    const modalTitle = $("#modalTitle");
    const modalContent = $("#modalContent");
    const modalClose = $("#modalClose");

    const toast = $("#toast");

    let currentUser = null;
    let toastTimer;


    /* =====================================
       TOAST
    ===================================== */

    function showToast(message) {

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);

    }


    /* =====================================
       HTML ESCAPE
    ===================================== */

    function escapeHTML(value) {

        return String(value ?? "").replace(/[&<>"']/g, char => {

            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[char];

        });

    }


    /* =====================================
       MODAL
    ===================================== */

    function openModal(title, content) {

        modalTitle.textContent = title;
        modalContent.innerHTML = content;

        modalOverlay.classList.add("show");

    }


    function closeModal() {

        modalOverlay.classList.remove("show");
        modalContent.innerHTML = "";

    }


    modalClose.addEventListener("click", closeModal);

    modalOverlay.addEventListener("click", event => {

        if (event.target === modalOverlay) {
            closeModal();
        }

    });


    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeModal();
        }

    });


    /* =====================================
       PROFILE DISPLAY
    ===================================== */

    function updateUserInterface(user) {

        const name =
            user.displayName ||
            user.email?.split("@")[0] ||
            "Reader";

        profileName.textContent = name;

        profileEmail.textContent =
            user.email || "No email available";

        avatarPlaceholder.textContent =
            name.charAt(0).toUpperCase();

        // Keep displaying an existing Firebase profile photo.
        // Photo uploading has been removed.

        if (user.photoURL) {

            profileAvatar.src = user.photoURL;
            profileAvatar.hidden = false;
            avatarPlaceholder.hidden = true;

            profileAvatar.onerror = () => {
                profileAvatar.hidden = true;
                avatarPlaceholder.hidden = false;
            };

        } else {

            profileAvatar.hidden = true;
            avatarPlaceholder.hidden = false;

        }

        if (user.metadata?.creationTime) {

            const date = new Date(user.metadata.creationTime);

            $("#memberSince").textContent =
                "Joined " + date.toLocaleDateString();

        }

    }


    /* =====================================
       FIREBASE AUTH
    ===================================== */

    onAuthStateChanged(auth, async user => {

        currentUser = user;

        if (user) {

            updateUserInterface(user);

            await loadSavedBooks();

        } else {

            profileName.textContent = "Guest Reader";
            profileEmail.textContent = "You are not signed in";

            profileAvatar.hidden = true;
            avatarPlaceholder.hidden = false;
            avatarPlaceholder.textContent = "R";

            $("#memberSince").textContent = "Guest";

            renderEmptyBooks();

        }

    });


    /* =====================================
       EDIT PROFILE
       NAME ONLY - NO PHOTO UPLOAD
    ===================================== */

    editProfileBtn.addEventListener("click", () => {

        if (!currentUser) {
            showToast("Please sign in first.");
            return;
        }

        openModal("Edit Profile", `

            <form id="editProfileForm">

                <label>
                    Display Name

                    <input
                        type="text"
                        id="editName"
                        value="${escapeHTML(currentUser.displayName || "")}"
                        maxlength="60"
                        placeholder="Enter your name"
                        required
                    >
                </label>

                <p class="modal-description">
                    Update the name displayed on your Readora profile.
                </p>

                <button
                    class="modal-action"
                    id="saveProfileBtn"
                    type="submit"
                >
                    Save Changes
                </button>

            </form>

        `);


        $("#editProfileForm").addEventListener("submit", async event => {

            event.preventDefault();

            const button = $("#saveProfileBtn");
            const newName = $("#editName").value.trim();

            if (!newName) {
                showToast("Please enter your name.");
                return;
            }

            button.disabled = true;
            button.textContent = "Saving...";

            try {

                await updateProfile(currentUser, {
                    displayName: newName
                });

                updateUserInterface(currentUser);

                closeModal();

                showToast("Profile updated successfully!");

            } catch (error) {

                console.error("Profile update error:", error);

                showToast(
                    error.message || "Unable to update profile."
                );

                button.disabled = false;
                button.textContent = "Save Changes";

            }

        });

    });


    /* =====================================
       SAVED BOOKS - INDEXEDDB
    ===================================== */

    function openReadoraDatabase() {

        return new Promise((resolve, reject) => {

            const request = indexedDB.open("ReadoraDatabase");

            request.onupgradeneeded = () => {

                const db = request.result;

                if (!db.objectStoreNames.contains("savedBooks")) {

                    db.createObjectStore("savedBooks", {
                        keyPath: "id"
                    });

                }

            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };

        });

    }


    async function getSavedBooks() {

        const db = await openReadoraDatabase();

        return new Promise((resolve, reject) => {

            if (!db.objectStoreNames.contains("savedBooks")) {

                db.close();
                resolve([]);
                return;

            }

            const transaction = db.transaction(
                "savedBooks",
                "readonly"
            );

            const request = transaction
                .objectStore("savedBooks")
                .getAll();

            request.onsuccess = () => {

                resolve(request.result || []);
                db.close();

            };

            request.onerror = () => {

                reject(request.error);
                db.close();

            };

        });

    }


    async function removeSavedBook(bookId) {

        const db = await openReadoraDatabase();

        return new Promise((resolve, reject) => {

            const transaction = db.transaction(
                "savedBooks",
                "readwrite"
            );

            transaction.objectStore("savedBooks").delete(bookId);

            transaction.oncomplete = () => {
                db.close();
                resolve(true);
            };

            transaction.onerror = () => {
                db.close();
                reject(transaction.error);
            };

        });

    }


    /* =====================================
       EMPTY BOOKS
    ===================================== */

    function renderEmptyBooks() {

        $("#savedCount").textContent = "0 Books";

        $("#savedBooksGrid").innerHTML = `

            <div class="saved-empty">

                <span class="empty-icon">📚</span>

                <h3>No saved books yet</h3>

                <p>Books you save will appear here.</p>

                <a href="books.html">Explore Books</a>

            </div>

        `;

    }


    /* =====================================
       DISPLAY SAVED BOOKS
    ===================================== */

    async function loadSavedBooks() {

        const grid = $("#savedBooksGrid");

        grid.innerHTML = `
            <div class="saved-empty">
                <span class="empty-icon">⏳</span>
                <p>Loading your saved books...</p>
            </div>
        `;

        try {

            const books = await getSavedBooks();

            $("#savedCount").textContent =
                `${books.length} Books`;

            if (!books.length) {

                renderEmptyBooks();
                return;

            }

            grid.innerHTML = "";

            books.forEach(book => {

                const card = document.createElement("article");

                card.className = "saved-book-card";

                const title = book.title || "Untitled Book";
                const author = book.author || "Unknown Author";
                const cover = book.cover || "";
                const readerUrl = book.readerUrl || "";

                card.innerHTML = `

                    <img
                        class="saved-book-cover"
                        src="${escapeHTML(cover)}"
                        alt="${escapeHTML(title)}"
                        loading="lazy"
                    >

                    <h3 class="saved-book-title">
                        ${escapeHTML(title)}
                    </h3>

                    <p class="saved-book-author">
                        ${escapeHTML(author)}
                    </p>

                    <div class="saved-book-actions">

                        ${
                            readerUrl
                            ? `
                                <a
                                    class="read-book-btn"
                                    href="${escapeHTML(readerUrl)}"
                                >
                                    Read
                                </a>
                            `
                            : ""
                        }

                        <button
                            class="remove-book-btn"
                            data-remove-book
                        >
                            Remove
                        </button>

                    </div>

                `;

                card.querySelector("img").addEventListener(
                    "error",
                    event => {
                        event.target.style.display = "none";
                    }
                );

                card.querySelector(
                    "[data-remove-book]"
                ).addEventListener("click", async () => {

                    const confirmed = confirm(
                        `Remove "${title}" from saved books?`
                    );

                    if (!confirmed) return;

                    try {

                        await removeSavedBook(book.id);

                        showToast("Book removed from saved books.");

                        await loadSavedBooks();

                    } catch (error) {

                        console.error(error);

                        showToast("Unable to remove this book.");

                    }

                });

                grid.appendChild(card);

            });

        } catch (error) {

            console.error("Saved books error:", error);

            grid.innerHTML = `
                <div class="saved-empty">
                    <h3>Unable to load saved books</h3>
                    <p>Please refresh and try again.</p>
                </div>
            `;

        }

    }


    /* =====================================
       DEVICE INFORMATION
    ===================================== */

    function getDeviceInformation() {

        const userAgent = navigator.userAgent || "";
        const platform = navigator.userAgentData?.platform ||
            navigator.platform ||
            "Unknown";

        let browser = "Unknown Browser";
        let device = "Computer";

        if (/Edg\//i.test(userAgent)) {
            browser = "Microsoft Edge";
        } else if (/OPR\//i.test(userAgent)) {
            browser = "Opera";
        } else if (/Chrome\//i.test(userAgent)) {
            browser = "Google Chrome";
        } else if (/Firefox\//i.test(userAgent)) {
            browser = "Mozilla Firefox";
        } else if (/Safari\//i.test(userAgent)) {
            browser = "Safari";
        }

        if (/Android/i.test(userAgent)) {
            device = "Android Device";
        } else if (/iPhone/i.test(userAgent)) {
            device = "iPhone";
        } else if (/iPad/i.test(userAgent)) {
            device = "iPad";
        } else if (/Windows/i.test(userAgent)) {
            device = "Windows Computer";
        } else if (/Mac/i.test(userAgent)) {
            device = "Mac Computer";
        } else if (/Linux/i.test(userAgent)) {
            device = "Linux Computer";
        }

        const loginDate =
            currentUser?.metadata?.lastSignInTime
                ? new Date(
                    currentUser.metadata.lastSignInTime
                ).toLocaleString()
                : "Unavailable";

        const accountCreated =
            currentUser?.metadata?.creationTime
                ? new Date(
                    currentUser.metadata.creationTime
                ).toLocaleDateString()
                : "Unavailable";

        return {
            browser,
            device,
            platform,
            language: navigator.language || "Unknown",
            screen: `${window.screen.width} × ${window.screen.height}`,
            timezone:
                Intl.DateTimeFormat().resolvedOptions().timeZone ||
                "Unknown",
            loginDate,
            accountCreated
        };

    }


    function showDeviceInformation() {

        const info = getDeviceInformation();

        openModal("Manage Devices", `

            <div class="device-status">
                <span class="device-status-dot"></span>
                Current device is active
            </div>

            <div class="device-details">

                <div class="device-detail-row">
                    <span class="device-detail-label">Device</span>
                    <span class="device-detail-value">
                        ${escapeHTML(info.device)}
                    </span>
                </div>

                <div class="device-detail-row">
                    <span class="device-detail-label">Browser</span>
                    <span class="device-detail-value">
                        ${escapeHTML(info.browser)}
                    </span>
                </div>

                <div class="device-detail-row">
                    <span class="device-detail-label">Platform</span>
                    <span class="device-detail-value">
                        ${escapeHTML(info.platform)}
                    </span>
                </div>

                <div class="device-detail-row">
                    <span class="device-detail-label">Screen Size</span>
                    <span class="device-detail-value">
                        ${escapeHTML(info.screen)}
                    </span>
                </div>

                <div class="device-detail-row">
                    <span class="device-detail-label">Language</span>
                    <span class="device-detail-value">
                        ${escapeHTML(info.language)}
                    </span>
                </div>

                <div class="device-detail-row">
                    <span class="device-detail-label">Time Zone</span>
                    <span class="device-detail-value">
                        ${escapeHTML(info.timezone)}
                    </span>
                </div>

                <div class="device-detail-row">
                    <span class="device-detail-label">Last Sign In</span>
                    <span class="device-detail-value">
                        ${escapeHTML(info.loginDate)}
                    </span>
                </div>

                <div class="device-detail-row">
                    <span class="device-detail-label">Account Created</span>
                    <span class="device-detail-value">
                        ${escapeHTML(info.accountCreated)}
                    </span>
                </div>

            </div>

            <div class="device-note">
                <strong>About device management</strong><br>
                This page displays information about the browser
                currently signed in to Readora. It does not list
                other devices or remotely terminate their sessions.
            </div>

        `);

    }


    /* =====================================
       CHANGE PASSWORD
       RE-AUTHENTICATION + FIREBASE
    ===================================== */

    function showChangePassword() {

        if (!currentUser) {

            showToast("Please sign in first.");
            return;

        }

        const supportsPassword =
            currentUser.providerData.some(
                provider => provider.providerId === "password"
            );

        if (!supportsPassword || !currentUser.email) {

            showToast(
                "Password changes are unavailable for this sign-in method."
            );

            return;

        }

        openModal("Change Password", `

            <form id="passwordForm">

                <label>
                    Current Password

                    <input
                        type="password"
                        id="currentPassword"
                        autocomplete="current-password"
                        placeholder="Enter current password"
                        required
                    >
                </label>

                <label>
                    New Password

                    <input
                        type="password"
                        id="newPassword"
                        minlength="8"
                        autocomplete="new-password"
                        placeholder="Enter new password"
                        required
                    >
                </label>

                <label>
                    Confirm New Password

                    <input
                        type="password"
                        id="confirmPassword"
                        minlength="8"
                        autocomplete="new-password"
                        placeholder="Confirm new password"
                        required
                    >
                </label>

                <p class="modal-description">
                    Your new password must contain at least 8 characters.
                </p>

                <button
                    class="modal-action"
                    id="changePasswordBtn"
                    type="submit"
                >
                    Update Password
                </button>

            </form>

        `);


        $("#passwordForm").addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const button = $("#changePasswordBtn");

                const currentPassword =
                    $("#currentPassword").value;

                const newPassword =
                    $("#newPassword").value;

                const confirmPassword =
                    $("#confirmPassword").value;


                if (!currentPassword || !newPassword || !confirmPassword) {

                    showToast("Please complete all password fields.");
                    return;

                }

                if (newPassword.length < 8) {

                    showToast(
                        "New password must be at least 8 characters."
                    );

                    return;

                }

                if (newPassword !== confirmPassword) {

                    showToast("New passwords do not match.");
                    return;

                }

                if (currentPassword === newPassword) {

                    showToast(
                        "New password must be different from current password."
                    );

                    return;

                }


                button.disabled = true;
                button.textContent = "Updating...";

                try {

                    // 1. Verify current password with Firebase.

                    const credential =
                        EmailAuthProvider.credential(
                            currentUser.email,
                            currentPassword
                        );

                    await reauthenticateWithCredential(
                        currentUser,
                        credential
                    );


                    // 2. Update password in Firebase Authentication.

                    await updatePassword(
                        currentUser,
                        newPassword
                    );


                    closeModal();

                    showToast(
                        "Password changed successfully!"
                    );

                } catch (error) {

                    console.error(
                        "Change password error:",
                        error
                    );

                    let message =
                        "Unable to change password. Please try again.";

                    if (
                        error.code === "auth/invalid-credential" ||
                        error.code === "auth/wrong-password" ||
                        error.code === "auth/invalid-login-credentials"
                    ) {

                        message = "Your current password is incorrect.";

                    } else if (
                        error.code === "auth/weak-password"
                    ) {

                        message = "Please choose a stronger password.";

                    } else if (
                        error.code === "auth/too-many-requests"
                    ) {

                        message =
                            "Too many attempts. Please try again later.";

                    } else if (
                        error.code === "auth/requires-recent-login"
                    ) {

                        message =
                            "Please sign in again before changing your password.";

                    }

                    showToast(message);

                    button.disabled = false;
                    button.textContent = "Update Password";

                }

            }
        );

    }


    /* =====================================
       SETTINGS
    ===================================== */

    document.querySelectorAll("[data-setting]").forEach(button => {

        button.addEventListener("click", () => {

            const type = button.dataset.setting;

            switch (type) {

                case "devices":
                    showDeviceInformation();
                    break;

                case "password":
                    showChangePassword();
                    break;

            }

        });

    });


    /* =====================================
       LOGOUT
    ===================================== */

    logoutBtn.addEventListener("click", async () => {

        if (!currentUser) {

            showToast("You are not signed in.");
            return;

        }

        const confirmed = confirm(
            "Are you sure you want to log out?"
        );

        if (!confirmed) return;

        try {

            await signOut(auth);

            showToast("Logged out successfully.");

            setTimeout(() => {

                window.location.href = "index.html";

            }, 700);

        } catch (error) {

            console.error(error);

            showToast("Unable to log out.");

        }

    });


    /* =====================================
       BACK BUTTON
    ===================================== */

    $("#backBtn").addEventListener("click", () => {

        if (window.history.length > 1) {

            window.history.back();

        } else {

            window.location.href = "index.html";

        }

    });

});
