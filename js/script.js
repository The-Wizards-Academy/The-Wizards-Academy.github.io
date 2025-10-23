document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const loginForm = document.getElementById("login-form"); // Main form for both steps
    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");
    const message = document.getElementById("message");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const spinner = document.getElementById("spinner");
    const demoBtn = document.getElementById("demo-btn");
    const checkUserBtn = document.getElementById("check-user-btn");
    const backToUsernameBtn = document.getElementById("back-to-username-btn"); // New: Back button for step 2
    
    // --- State ---
    let verifiedUsername = "";
    let storedHash = "";

    // --- Initialization ---
    checkSession();

    // --- Event Listeners ---
    loginForm.addEventListener("submit", handleFormSubmit);
    demoBtn.addEventListener("click", startDemoMode);
    checkUserBtn.addEventListener("click", handleFormSubmit); // Submits step 1
    if (backToUsernameBtn) {
        backToUsernameBtn.addEventListener("click", goBackToUsernameStep); // New: Back button listener
    }

    // --- Functions ---

    /**
     * Checks for an active session and redirects to the dashboard if found.
     */
    function checkSession() { // JSDoc: Checks for an active session and redirects to the dashboard if found.
        if (sessionStorage.getItem("loggedInUser")) {
            window.location.href = "dashboard.html";
        }
    }

    /**
     * Handles the form submission for both steps.
     * @param {Event} e - The submit event.
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        if (!verifiedUsername) {
            await handleUsernameSubmission(); // Call the refactored function for step 1
        } else {
            await checkPassword();
        }
    }

    /**
     * Starts the demo mode.
     */
    function startDemoMode() { // JSDoc: Starts the demo mode, pre-filling username and hash.
        verifiedUsername = "demo-user";
        // SHA-256 hash for "password"
        storedHash = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8";
        usernameInput.value = verifiedUsername;
        
        setMessage("Demo mode activated. Please enter the password.", "success");
        
        step1.classList.add("fade-out");
        setTimeout(() => {
            step1.classList.add("hidden");
            step1.classList.remove("fade-out");
            step2.classList.remove("hidden");
            step2.classList.add("fade-in");
        }, 500);
        usernameInput.disabled = true;
    }

    /**
     * Step 1: Checks if the user has forked the repository and fetches the hash.
     */
    async function checkUserAndFork() {
        console.log("Inside checkUserAndFork()...");
        const username = usernameInput.value;
        if (!username) {
            console.log("Username is empty. Returning.");
            return;
        }

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
                step1.classList.add("fade-out");
                setTimeout(() => {
                    step1.classList.add("hidden");
                    step1.classList.remove("fade-out");
                    step2.classList.remove("hidden");
                    step2.classList.add("fade-in");
                }, 500);
                usernameInput.disabled = true;
            }, 1000);

        } catch (error) {
            setLoading(false);
            setMessage(error.message, "error");
        }
    }

    /**
     * Finds if a user has forked the repository, using cache if available.
     */
    async function findUserFork(username) {
        console.log(`Finding fork for user: ${username}`);
        const cachedForks = sessionStorage.getItem("forksCache");
        if (cachedForks) {
            const forks = JSON.parse(cachedForks);
            const userFork = forks.find(fork => fork.owner.login.toLowerCase() === username.toLowerCase());
            if(userFork) {
                console.log("Fork found in cache.");
                return userFork;
            }
        }

        console.log("Fork not in cache. Fetching from API...");
        const forkUrl = `https://api.github.com/repos/${CONFIG.ORG_NAME}/${CONFIG.REPO_NAME}/forks`;
        const response = await fetch(forkUrl);
        if (!response.ok) {
            handleApiError(response, `Could not check repo forks. Status: ${response.status}`);
        }
        const forks = await response.json();
        sessionStorage.setItem("forksCache", JSON.stringify(forks));
        return forks.find(fork => fork.owner.login.toLowerCase() === username.toLowerCase());
    }

    /**
     * Fetches the wizard-card.json from the user's fork.
     * @param {string} username - The GitHub username.
     * @returns {Promise<object>} The JSON content of wizard-card.json.
     * @throws {Error} If the API call fails.
     */
    async function fetchCardData(username) {
        const hashUrl = `https://raw.githubusercontent.com/${username}/${CONFIG.REPO_NAME}/main/${CONFIG.CARD_FILE_PATH}`;
        const response = await fetch(hashUrl);
        if (!response.ok) {
            handleApiError(response, `Could not find wizard-card.json. Status: ${response.status}`);
        }
        return await response.json();
    }

    /**
     * Step 2: Checks the entered password and redirects to the dashboard.
     * @returns {Promise<void>}
     * @throws {Error} If password is incorrect.
     */
    async function checkPassword() {
        const password = passwordInput.value;
        if (!password) {
            return;
            // No message here, as the input field itself should indicate required.
        }

        setLoading(true);
        setMessage("Verifying password...");

        try {
            const inputHash = await sha256(password);
            if (inputHash === storedHash) {
                sessionStorage.setItem("loggedInUser", verifiedUsername);
                setMessage("Access Granted! Redirecting...", "success");
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
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
     * @param {Response} response - The fetch API response object.
     * @param {string} defaultMessage - A default error message.
     * @throws {Error} A more specific error message based on the response status.
     */
    function handleApiError(response, defaultMessage) {
        if (response.status === 403) {
            throw new Error("GitHub API rate limit exceeded. Please try again later.");
        } else if (response.status === 404) {
            throw new Error("The requested resource was not found. Please check the configuration.");
        } else if (response.status >= 500) {
            throw new Error("A server error occurred. Please try again later.");
        }
        throw new Error(defaultMessage);
    }

    /**
     * Sets the loading state.
     * @param {boolean} isLoading - True to show spinner, false to hide.
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
     * @param {string} msg - The message to display.
     * @param {string} [type=""] - The type of message (e.g., "success", "error") for styling.
     */
    function setMessage(msg, type = "") {
        message.textContent = msg;
        message.className = type;
        message.classList.remove("hidden");
    }

    /**
     * Hashes a string using SHA-256.
     * @param {string} message - The string to hash.
     * @returns {Promise<string>} The SHA-256 hash as a hexadecimal string.
     */
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }
});