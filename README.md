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

Testing modes

- Local interactive testing (recommended for development):

```sh
npm start           # run the app (real external APIs)
npm run cypress:open
```

- Deterministic test runs (fixtures in Cypress): the `wizard` spec stubs external APIs using fixtures in `cypress/fixtures`. This makes interactive and CI tests deterministic and not dependent on external network.

- CI-friendly e2e with server-side fallback: if your CI environment cannot reach external APIs, use the `e2e:ci` script which starts the server with `MOCK_EXTERNAL=1` and runs the headless suite.

```sh
npm run e2e           # start server and run tests using the real server (no server-side mocks)
npm run e2e:ci        # CI-friendly - server will use internal mock responses if external APIs fail
```

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
