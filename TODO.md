# TODO

## UI/UX Improvements
- [ ] Add a loading spinner during API calls to give better feedback to the user.
- [ ] Implement smooth transitions and animations between the username and password steps.
- [ ] Enhance the visual design of the login form for a more modern look and feel.

## Code Refactoring
- [ ] Move configuration variables (ORG_NAME, REPO_NAME) to a separate configuration file (e.g., `config.js`).
- [ ] Add detailed comments to the `script.js` file to clarify the authentication flow and API interactions.
- [ ] Break down the `checkUserAndFork` function into smaller, single-responsibility functions (e.g., `checkFork`, `fetchCardData`).

## New Features
- [ ] Add a "Logout" button that resets the application state.
- [ ] Implement a simple session mechanism using `sessionStorage` or `localStorage` to keep the user logged in on page refresh.
- [ ] Design and build a proper dashboard page to be displayed after a successful login, replacing the current simple welcome message.