document.addEventListener("DOMContentLoaded", () => {
    const usernameSpan = document.getElementById("dashboard-username");
    const logoutBtn = document.getElementById("dashboard-logout-btn");

    const loggedInUser = sessionStorage.getItem("loggedInUser");

    if (loggedInUser) {
        usernameSpan.textContent = loggedInUser;
    } else {
        // If no user is logged in, redirect to the login page
        window.location.href = "index.html";
    }

    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    });
});
