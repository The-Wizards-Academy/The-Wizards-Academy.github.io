document.addEventListener("DOMContentLoaded", () => {
    const usernameSpan = document.getElementById("dashboard-username");
    const logoutBtn = document.getElementById("dashboard-logout-btn");
    const cardContainer = document.getElementById("wizard-card-container");

    const loggedInUser = sessionStorage.getItem("loggedInUser");

    if (loggedInUser) {
        usernameSpan.textContent = loggedInUser;
        fetchWizardCard(loggedInUser);
    } else {
        // If no user is logged in, redirect to the login page
        window.location.href = "index.html";
        return; // Stop further execution
    }

    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("loggedInUser");
        // Also clear the forks cache if it exists
        sessionStorage.removeItem("forksCache");
        window.location.href = "index.html";
    });

    /**
     * Fetches the wizard-card.json data for the given user.
     * @param {string} username - The GitHub username.
     */
    async function fetchWizardCard(username) {
        // In demo mode, display a sample card
        if (username === 'demo-user') {
            const demoCard = {
                name: "Demo Wizard",
                image: "../assets/logo.png",
                attributes: [
                    { "trait_type": "House", "value": "Gryffindor" },
                    { "trait_type": "Wand", "value": "Holly, 11', Phoenix Feather" }
                ]
            };
            displayWizardCard(demoCard);
            return;
        }

        const cardUrl = `https://raw.githubusercontent.com/${username}/${CONFIG.REPO_NAME}/main/${CONFIG.CARD_FILE_PATH}`;
        try {
            const response = await fetch(cardUrl);
            if (!response.ok) {
                throw new Error(`Could not retrieve your wizard card. Please ensure the 'wizard-card.json' file exists in your repository's main branch.`);
            }
            const cardData = await response.json();
            displayWizardCard(cardData);
        } catch (error) {
            cardContainer.innerHTML = `<p class="error">${error.message}</p>`;
        }
    }

    /**
     * Renders the wizard card data into the DOM.
     * @param {object} cardData - The wizard card data object.
     */
    function displayWizardCard(cardData) {
        // Clear loading message
        cardContainer.innerHTML = '';

        const cardElement = document.createElement('div');
        cardElement.className = 'wizard-card';

        cardElement.innerHTML = `
            <img src="${cardData.image}" alt="Image of ${cardData.name}" class="wizard-image">
            <h3 class="wizard-name">${cardData.name}</h3>
            <ul class="wizard-attributes">
                ${cardData.attributes.map(attr => 
                    `<li><strong>${attr.trait_type}:</strong> ${attr.value}</li>`
                ).join('')}
            </ul>
        `;
        cardContainer.appendChild(cardElement);
    }
});
