document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const loginForm = document.getElementById("login-form");
    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");
    const content = document.getElementById("content");
    const message = document.getElementById("message");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const spinner = document.getElementById("spinner");
    const logoutBtn = document.getElementById("logout-btn");
    const welcomeUsername = document.getElementById("welcome-username");

    // --- State ---
    let verifiedUsername = "";
    let storedHash = "";

    // --- Initialization ---
    checkSession();

    // --- Event Listeners ---
    loginForm.addEventListener("submit", handleFormSubmit);
    logoutBtn.addEventListener("click", logout);

    // --- Functions ---

    /**
     * Checks for an active session in sessionStorage.
     */
    function checkSession() {
        const sessionUser = sessionStorage.getItem("loggedInUser");
        if (sessionUser) {
            verifiedUsername = sessionUser;
            showContent();
        }
    }

    /**
     * Handles the form submission for both steps.
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        if (!verifiedUsername) {
            await checkUserAndFork();
        } else {
            await checkPassword();
        }
    }

    /**
     * Step 1: Checks if the user has forked the repository and fetches the hash.
     */
    async function checkUserAndFork() {
        const username = usernameInput.value;
        if (!username) return;

        setLoading(true);
        setMessage("Checking initiate status...");

        try {
            setMessage("Searching for user's fork...");
            const userFork = await findUserFork(username);
            if (!userFork) {
                throw new Error("Initiate not found. Have you forked the Wizards Card repo?");
            }
            setMessage("Fork found. Looking for wizard-card.json...", "success");

            const cardData = await fetchCardData(username);
            if (!cardData.hash) {
                throw new Error("`wizard-card.json` is malformed. No hash found.");
            }
            storedHash = cardData.hash;
            setMessage("Found wizard-card.json. Verification complete.", "success");

            // Success! Move to step 2
            setTimeout(() => {
                setLoading(false);
                setMessage("Please enter your password.", "success");
                verifiedUsername = username;
                step1.classList.add("hidden");
                step2.classList.remove("hidden");
                usernameInput.disabled = true;
            }, 1000);

        } catch (error) {
            setLoading(false);
            setMessage(error.message, "error");
        }
    }

    /**
     * Finds if a user has forked the repository.
     */
    async function findUserFork(username) {
        const forkUrl = `https://api.github.com/repos/${CONFIG.ORG_NAME}/${CONFIG.REPO_NAME}/forks`;
        const response = await fetch(forkUrl);
        if (!response.ok) {
            handleApiError(response, "Could not check repo forks.");
        }
        const forks = await response.json();
        return forks.find(fork => fork.owner.login.toLowerCase() === username.toLowerCase());
    }

    /**
     * Fetches the wizard-card.json from the user's fork.
     */
    async function fetchCardData(username) {
        const hashUrl = `https://raw.githubusercontent.com/${username}/${CONFIG.REPO_NAME}/main/${CONFIG.CARD_FILE_PATH}`;
        const response = await fetch(hashUrl);
        if (!response.ok) {
            throw new Error("Could not find `wizard-card.json`. Did you create it in your fork?");
        }
        return await response.json();
    }

    /**
     * Step 2: Checks the entered password against the stored hash.
     */
    async function checkPassword() {
        const password = passwordInput.value;
        if (!password) return;

        setLoading(true);
        setMessage("Verifying password...");

        try {
            const inputHash = await sha256(password);
            if (inputHash === storedHash) {
                sessionStorage.setItem("loggedInUser", verifiedUsername);
                setTimeout(() => {
                    setLoading(false);
                    showContent();
                }, 500);
            } else {
                throw new Error("Password incorrect.");
            }
        } catch (error) {
            setLoading(false);
            setMessage(error.message, "error");
            passwordInput.value = "";
        }
    }

    /**
     * Handles API errors.
     */
    function handleApiError(response, defaultMessage) {
        if (response.status === 403) {
            throw new Error("GitHub API rate limit exceeded. Please try again later.");
        }
        throw new Error(defaultMessage);
    }

    /**
     * Shows the main content area.
     */
    function showContent() {
        welcomeUsername.textContent = verifiedUsername;
        loginForm.classList.add("hidden");
        message.classList.add("hidden");
        content.classList.remove("hidden");
    }

    /**
     * Logs the user out.
     */
    function logout() {
        sessionStorage.removeItem("loggedInUser");
        verifiedUsername = "";
        storedHash = "";
        usernameInput.value = "";
        passwordInput.value = "";
        usernameInput.disabled = false;
        content.classList.add("hidden");
        loginForm.classList.remove("hidden");
        step1.classList.remove("hidden");
        step2.classList.add("hidden");
        setMessage("You have been logged out.");
    }

    /**
     * Sets the loading state.
     */
    function setLoading(isLoading) {
        if (isLoading) {
            spinner.classList.remove("hidden");
        } else {
            spinner.classList.add("hidden");
        }
    }

    /**
     * Sets the message text and style.
     */
    function setMessage(msg, type = "") {
        message.textContent = msg;
        message.className = type;
        message.classList.remove("hidden");
    }

    /**
     * Hashes a string using SHA-256.
     */
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }
});