# Cypress Wizard POC

Simple proof-of-concept demonstrating end-to-end tests with Cypress for a small wizard app.

Requirements

- Node.js (16+)

Setup
Open shell in the project root and run:

```sh
npm install
```

Run the server

```sh
npm start
# or for live reload
npm run dev
```

Open Cypress (interactive)

```sh
npm run cypress:open
```

Run Cypress headless

```sh
npm run cypress:run
```

Notes

- Seeded user: `alice` / `password`.
- The wizard uses the public Open-Meteo geocoding and forecast APIs.

E2E (start server + run tests)

The project includes an `e2e` script that starts the app on an isolated port (3001) and runs the Cypress suite.

```sh
cd 'C:\Users\User\Workspace\test\weather'
npm install
npm run e2e
```

What `e2e` does:

- Starts the server using `PORT=3001` so it won't conflict with a locally running instance.
- Waits until `http://localhost:3001` responds and then runs `cypress:run` headless.

Notes

- Videos for each spec are saved to `cypress/videos/`.
- The `e2e` script uses `cross-env` and `start-server-and-test` (already in `devDependencies`).

Persisting videos/screenshots per run

You can save Cypress artifacts into timestamped folders to keep each run's videos/screenshots separate. A helper script is included at `scripts/run-cypress-timestamped.js` and two npm scripts:

- `npm run cypress:run:timestamp` — run Cypress locally and save videos/screenshots under `cypress/videos/<timestamp>/` and `cypress/screenshots/<timestamp>/`.
- `npm run e2e:timestamp` — start the app on an isolated port (3001) and run the timestamped Cypress run (useful for CI).

Example (local):

```sh
npm run cypress:run:timestamp
```

Example (start server + run timestamped):

```sh
npm run e2e:timestamp
```
