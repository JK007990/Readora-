
/* =========================================
   READORA PROFILE PAGE
   FIREBASE + SAVED BOOKS
========================================= */

import {
    onAuthStateChanged,
    updateProfile,
    updatePassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";

import { getApp } from
    "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

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
    let storage = null;


    /* =====================================
       FIREBASE STORAGE
    ===================================== */

    try {
        storage = getStorage(getApp());
    } catch (error) {
        console.error("Firebase Storage initialization:", error);
    }


    /* =====================================
       TOAST
    ===================================== */

    let toastTimer;

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
    ===================================== */

    editProfileBtn.addEventListener("click", () => {

        if (!currentUser) {
            showToast("Please sign in first.");
            return;
        }

        openModal("Edit Profile", `

            <form id="editProfileForm">

                <img
                    id="uploadPreview"
                    class="upload-preview"
                    src="${escapeHTML(currentUser.photoURL || "")}"
                    alt="Photo Preview"
                    ${currentUser.photoURL ? "" : "hidden"}
                >

                <label>
                    Display Name

                    <input
                        type="text"
                        id="editName"
                        value="${escapeHTML(currentUser.displayName || "")}"
                        maxlength="60"
                        required
                    >
                </label>

                <label>
                    Upload Profile Photo

                    <input
                        type="file"
                        id="photoFile"
                        accept="image/png,image/jpeg,image/webp"
                    >
                </label>

                <p class="modal-description">
                    Choose a JPG, PNG or WebP image.
                    Maximum file size: 5 MB.
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


        const photoInput = $("#photoFile");
        const preview = $("#uploadPreview");

        let selectedPhoto = null;


        /* PHOTO PREVIEW */

        photoInput.addEventListener("change", () => {

            const file = photoInput.files[0];

            if (!file) return;

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!allowedTypes.includes(file.type)) {

                showToast("Please select JPG, PNG or WebP.");

                photoInput.value = "";
                return;

            }

            if (file.size > 5 * 1024 * 1024) {

                showToast("Image must be smaller than 5 MB.");

                photoInput.value = "";
                return;

            }

            selectedPhoto = file;

            const previewURL = URL.createObjectURL(file);

            preview.src = previewURL;
            preview.hidden = false;

            preview.onload = () => {
                URL.revokeObjectURL(previewURL);
            };

        });


        /* SAVE PROFILE */

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

                let photoURL = currentUser.photoURL || null;


                /* UPLOAD IMAGE TO FIREBASE STORAGE */

                if (selectedPhoto) {

                    if (!storage) {
                        throw new Error(
                            "Firebase Storage is not initialized."
                        );
                    }

                    const fileExtension =
                        selectedPhoto.name.split(".").pop();

                    const photoRef = ref(
                        storage,
                        `profilePhotos/${currentUser.uid}/avatar.${fileExtension}`
                    );

                    await uploadBytes(photoRef, selectedPhoto, {
                        contentType: selectedPhoto.type
                    });

                    photoURL = await getDownloadURL(photoRef);

                }


                /* UPDATE FIREBASE PROFILE */

                await updateProfile(currentUser, {
                    displayName: newName,
                    photoURL: photoURL
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

            const store = transaction.objectStore("savedBooks");

            const request = store.getAll();

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

                <a href="index.html">Explore Books</a>

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
       SETTINGS
    ===================================== */

    document.querySelectorAll("[data-setting]").forEach(button => {

        button.addEventListener("click", () => {

            const type = button.dataset.setting;

            switch (type) {

                case "security":

                    openModal("Application Security", `

                        <p class="modal-description">
                            Your account is protected by Firebase Authentication.
                            Keep your login credentials private.
                        </p>

                        <div class="device-box">

                            <strong>Account Email</strong><br>
                            ${escapeHTML(currentUser?.email || "Not signed in")}

                            <br><br>

                            <strong>Email Verified</strong><br>
                            ${currentUser?.emailVerified ? "Yes" : "No"}

                        </div>

                    `);

                    break;


                case "devices":

                    openModal("Manage Devices", `

                        <div class="device-box">

                            <strong>Current Device</strong><br>

                            ${escapeHTML(navigator.userAgent)}

                            <br><br>

                            <strong>Status:</strong>
                            <span style="color:#16a34a">Active</span>

                        </div>

                        <p class="modal-description">
                            This is the current browser information.
                            Full device session management requires
                            a separate backend implementation.
                        </p>

                    `);

                    break;


                case "password":

                    if (!currentUser) {

                        showToast("Please sign in first.");
                        return;

                    }

                    const supportsPassword =
                        currentUser.providerData.some(
                            provider => provider.providerId === "password"
                        );

                    if (!supportsPassword) {

                        showToast(
                            "Password changes are unavailable for this sign-in method."
                        );

                        return;

                    }

                    openModal("Change Password", `

                        <form id="passwordForm">

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
                                Confirm Password

                                <input
                                    type="password"
                                    id="confirmPassword"
                                    minlength="8"
                                    autocomplete="new-password"
                                    placeholder="Confirm new password"
                                    required
                                >
                            </label>

                            <button class="modal-action" type="submit">
                                Update Password
                            </button>

                        </form>

                    `);


                    $("#passwordForm").addEventListener(
                        "submit",
                        async event => {

                            event.preventDefault();

                            const password = $("#newPassword").value;
                            const confirm = $("#confirmPassword").value;

                            if (password.length < 8) {

                                showToast(
                                    "Password must be at least 8 characters."
                                );

                                return;

                            }

                            if (password !== confirm) {

                                showToast("Passwords do not match.");
                                return;

                            }

                            try {

                                await updatePassword(
                                    currentUser,
                                    password
                                );

                                closeModal();

                                showToast(
                                    "Password updated successfully!"
                                );

                            } catch (error) {

                                console.error(error);

                                if (
                                    error.code ===
                                    "auth/requires-recent-login"
                                ) {

                                    showToast(
                                        "Please sign in again before changing your password."
                                    );

                                } else {

                                    showToast(
                                        error.message ||
                                        "Password update failed."
                                    );

                                }

                            }

                        }
                    );

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
