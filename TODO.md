# TODO

## UI/UX Improvements
- [x] Add a loading spinner during API calls to give better feedback to the user.
- [x] Implement smooth transitions and animations between the username and password steps.
- [ ] Enhance the visual design of the login form for a more modern look and feel.
- [ ] Improve accessibility by adding ARIA attributes to form elements and interactive components.

## Code Refactoring
- [x] Move configuration variables (ORG_NAME, REPO_NAME) to a separate configuration file (e.g., `config.js`).
- [x] Add detailed comments to the `script.js` file to clarify the authentication flow and API interactions.
- [x] Break down the `checkUserAndFork` function into smaller, single-responsibility functions.
- [x] Consolidate the two `config.js` files into one to avoid confusion.
- [x] Remove `console.log` statements used for debugging from the production code.

## New Features
- [x] Add a "Logout" button that resets the application state.
- [x] Implement a simple session mechanism using `sessionStorage` to keep the user logged in on page refresh.
- [x] Design and build a proper dashboard page to be displayed after a successful login.
- [ ] Fetch and display user data from `wizard-card.json` on the dashboard.
- [x] Add a "Back" button on the password step to allow the user to change the GitHub username. (JS logic implemented, HTML button needs to be added)

## Housekeeping
- [x] Review and update the `DEBUG.md` file to reflect the latest state of mitigated issues.