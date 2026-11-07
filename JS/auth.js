/* =====================================================
   READORA BOOKSTORE
   FIREBASE LOGIN + SIGN UP
===================================================== */

import {
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import { auth } from "./firebase-config.js";


/* =====================================================
   HELPER FUNCTIONS
===================================================== */

function getElement(id) {
    return document.getElementById(id);
}


function showMessage(message, type = "error") {
    const messageBox = getElement("auth-message");

    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.className = `auth-message auth-${type}`;
}


function clearMessage() {
    const messageBox = getElement("auth-message");

    if (!messageBox) return;

    messageBox.textContent = "";
    messageBox.className = "auth-message";
}


function setButtonLoading(button, loading, defaultText) {
    if (!button) return;

    const span = button.querySelector("span");

    if (loading) {
        if (!button.dataset.originalText) {
            button.dataset.originalText =
                span?.textContent || defaultText;
        }

        button.disabled = true;

        if (span) {
            span.textContent = "Please wait...";
        }
    } else {
        button.disabled = false;

        if (span) {
            span.textContent =
                button.dataset.originalText || defaultText;
        }
    }
}


function getFirebaseErrorMessage(error) {
    switch (error.code) {
        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Incorrect email or password.";

        case "auth/email-already-in-use":
            return "This email already has an account. Please sign in.";

        case "auth/weak-password":
            return "Please choose a stronger password.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        case "auth/operation-not-allowed":
            return "Email/Password sign-in is not enabled in Firebase.";

        case "auth/user-disabled":
            return "This account has been disabled.";

        case "auth/invalid-continue-uri":
        case "auth/unauthorized-continue-uri":
            return "Password reset configuration needs attention.";

        default:
            console.error("Firebase Authentication Error:", error);
            return "Something went wrong. Please try again.";
    }
}


/* =====================================================
   REMEMBER ME / SESSION PERSISTENCE
===================================================== */

async function setLoginPersistence() {
    const rememberCheckbox = getElement("remember-me");

    const rememberMe = rememberCheckbox
        ? rememberCheckbox.checked
        : true;

    const persistence = rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence;

    await setPersistence(auth, persistence);
}


/* =====================================================
   RETURN TO HOME PAGE
===================================================== */

function returnToHome() {
    // Resolve index.html relative to auth.js.
    // This assumes auth.js is one folder below index.html.
    const homeUrl = new URL("../index.html", import.meta.url);

    window.location.replace(homeUrl.href);
}


/* =====================================================
   SIGN UP
===================================================== */

const signupForm = getElement("signup-form");

if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearMessage();

        const nameInput = getElement("signup-name");
        const emailInput = getElement("signup-email");
        const passwordInput = getElement("signup-password");
        const confirmPasswordInput =
            getElement("signup-confirm-password");

        const submitButton = getElement("signup-submit");

        const name = nameInput?.value.trim() || "";
        const email = emailInput?.value.trim() || "";
        const password = passwordInput?.value || "";
        const confirmPassword =
            confirmPasswordInput?.value || "";

        if (!name || !email || !password || !confirmPassword) {
            showMessage("Please complete all required fields.");
            return;
        }

        if (name.length < 2) {
            showMessage("Please enter your full name.");
            nameInput?.focus();
            return;
        }

        if (password.length < 6) {
            showMessage("Password must be at least 6 characters.");
            passwordInput?.focus();
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.");
            confirmPasswordInput?.focus();
            return;
        }

        const agreeTerms = getElement("agree-terms");

        if (agreeTerms && !agreeTerms.checked) {
            showMessage(
                "Please agree to the Terms and Privacy Policy."
            );
            return;
        }

        setButtonLoading(
            submitButton,
            true,
            "Create Account"
        );

        try {
            // Keep the newly created account signed in.
            await setPersistence(auth, browserLocalPersistence);

            // Create Firebase account.
            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            // Save display name to Firebase Authentication.
            await updateProfile(userCredential.user, {
                displayName: name
            });

            showMessage(
                "Account created successfully! Welcome to Readora.",
                "success"
            );

            passwordInput.value = "";
            confirmPasswordInput.value = "";

            // Return to Home after successful registration.
            setTimeout(returnToHome, 800);

        } catch (error) {
            showMessage(getFirebaseErrorMessage(error));
        } finally {
            setButtonLoading(
                submitButton,
                false,
                "Create Account"
            );
        }
    });
}


/* =====================================================
   LOGIN
===================================================== */

const loginForm = getElement("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearMessage();

        const emailInput = getElement("login-email");
        const passwordInput = getElement("login-password");
        const submitButton = getElement("login-submit");

        const email = emailInput?.value.trim() || "";
        const password = passwordInput?.value || "";

        if (!email || !password) {
            showMessage("Please enter your email and password.");
            return;
        }

        setButtonLoading(
            submitButton,
            true,
            "Sign In"
        );

        try {
            // Apply the Remember Me preference.
            await setLoginPersistence();

            // Sign in with Firebase Authentication.
            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const displayName =
                userCredential.user.displayName;

            showMessage(
                `Welcome back${displayName ? ", " + displayName : ""}! You are signed in.`,
                "success"
            );

            // Return to Home after successful login.
            setTimeout(returnToHome, 800);

        } catch (error) {
            showMessage(getFirebaseErrorMessage(error));
        } finally {
            setButtonLoading(
                submitButton,
                false,
                "Sign In"
            );
        }
    });
}


/* =====================================================
   FORGOT PASSWORD / PASSWORD RESET
===================================================== */

const forgotPasswordButton = getElement("forgot-password");

if (forgotPasswordButton) {
    forgotPasswordButton.addEventListener(
        "click",
        async (event) => {
            event.preventDefault();
            clearMessage();

            const emailInput = getElement("login-email");
            const email = emailInput?.value.trim() || "";

            if (!email) {
                showMessage(
                    "Enter your email address first to reset your password.",
                    "info"
                );

                emailInput?.focus();
                return;
            }

            try {
                await sendPasswordResetEmail(auth, email);

                showMessage(
                    "If this email is registered, a password reset email will be sent.",
                    "success"
                );

            } catch (error) {
                showMessage(getFirebaseErrorMessage(error));
            }
        }
    );
}


/* =====================================================
   END OF READORA AUTHENTICATION
===================================================== */
