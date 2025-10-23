document.addEventListener("DOMContentLoaded", () => {
    
    // --- Configuration ---
    const ORG_NAME = "The-Wizards-Academy";
    const REPO_NAME = "wizards-card-repo";
    const CARD_FILE_PATH = "wizard-card.json";
    // ---
    
    const loginForm = document.getElementById("login-form");
    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");
    const content = document.getElementById("content");
    const message = document.getElementById("message");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    let verifiedUsername = "";
    let storedHash = "";

    // Handle form submission
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!verifiedUsername) {
            // Step 1: Check Username and Fork
            await checkUserAndFork();
        } else {
            // Step 2: Check Password
            await checkPassword();
        }
    });

    /**
     * Step 1: Check if the user exists and has forked the repo.
     */
    async function checkUserAndFork() {
        const username = usernameInput.value;
        if (!username) return;

        setLoadingMessage("Checking initiate status...");

        try {
            // 1. Check if the user has forked the repo
            const forkUrl = `https://api.github.com/repos/${ORG_NAME}/${REPO_NAME}/forks`;
            const forksResponse = await fetch(forkUrl);
            if (!forksResponse.ok) throw new Error("Could not check repo forks.");
            
            const forks = await forksResponse.json();
            const userFork = forks.find(fork => fork.owner.login.toLowerCase() === username.toLowerCase());

            if (!userFork) {
                throw new Error("Initiate not found. Have you forked the Wizards Card repo?");
            }

            // 2. If fork exists, fetch the password hash from their repo
            const hashUrl = `https://raw.githubusercontent.com/${username}/${REPO_NAME}/main/${CARD_FILE_PATH}`;
            const hashResponse = await fetch(hashUrl);
            if (!hashResponse.ok) {
                throw new Error("Could not find `wizard-card.json`. Did you create it in your fork?");
            }
            
            const cardData = await hashResponse.json();
            storedHash = cardData.hash;
            
            if (!storedHash) {
                throw new Error("`wizard-card.json` is malformed. No hash found.");
            }

            // Success! Move to step 2
            setLoadingMessage("Initiate found. Please enter your password.", "success");
            verifiedUsername = username; // Lock in the username
            step1.classList.add("hidden");
            step2.classList.remove("hidden");
            usernameInput.disabled = true; // Disable the username field

        } catch (error) {
            setLoadingMessage(error.message, "error");
        }
    }

    /**
     * Step 2: Check the entered password against the fetched hash.
     */
    async function checkPassword() {
        const password = passwordInput.value;
        if (!password) return;

        setLoadingMessage("Verifying password...");

        try {
            // Hash the password the user just typed
            const inputHash = await sha256(password);

            // Compare!
            if (inputHash === storedHash) {
                // SUCCESS!
                setLoadingMessage("Access Granted.", "success");
                loginForm.classList.add("hidden");
                content.classList.remove("hidden");
            } else {
                // Failure
                throw new Error("Password incorrect.");
            }

        } catch (error) {
            setLoadingMessage(error.message, "error");
        }
    }

    // --- Helper Functions ---

    function setLoadingMessage(msg, type = "") {
        message.textContent = msg;
        message.className = type; // "success" or "error"
    }

    /**
     * Hashes a string using the built-in Web Crypto API (SHA-256).
     * Returns a hex string.
     */
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        return hashHex;
    }
});