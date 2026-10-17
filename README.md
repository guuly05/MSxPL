# Turning Point Finder

A responsive football match-intelligence demo. Replay fictional match events, inspect the evidence, and see which moment most changed the match's direction.

## Run locally

Requirements: Node.js 20 or newer.

~~~powershell
npm install
npm run dev
~~~

Open http://localhost:4178. The app runs without Azure or a model. Its three fictional matches and deterministic analysis are bundled with the project.

To make a production build and serve it locally:

~~~powershell
npm run build
$env:NODE_ENV = "production"
npm start
~~~

## Microsoft Foundry

Foundry is optional for the local demo. The app only makes a model request when the user presses **Generate with Microsoft Foundry**. Without a connection, the app gives a local evidence-based explanation.

See [docs/AZURE_SETUP.md](docs/AZURE_SETUP.md) for the current recommended resource plan, setup steps, safe configuration, and cost estimate. Put credentials in a local .env file; never commit that file or place a key in browser code.

## Product and hackathon

- [Product requirements document](docs/PRD.md)
- [Official Microsoft Premier League Hackathon rules](https://github.com/microsoft/insidethegamehackathon/blob/main/OFFICIAL%20RULES.md)
- [Microsoft Reactor hackathon page](https://developer.microsoft.com/en-us/reactor/series/S-1709/)

The app uses original synthetic data and no Premier League logos, footage, or real player data. The hackathon rules require a public GitHub repository and a public demo video under two minutes for submission. Neither has been published or submitted from this workspace.
