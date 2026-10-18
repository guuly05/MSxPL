# Turning Point Finder

An analyst-first football match-review workspace. Validate a ranked turning point against an auditable scoring breakdown and traceable synthetic event evidence; replay the match alongside the report.

## Run locally

Requirements: Node.js 20 or newer.

~~~powershell
npm install
npm run dev
~~~

Open http://localhost:4178. The app runs without Azure or a model. Its three fictional matches and deterministic analysis are bundled with the project.

The site includes [Methodology](http://localhost:4178/methodology), [About and limitations](http://localhost:4178/about), and a [Privacy Policy](http://localhost:4178/privacy). The workspace opens with a completed synthetic match report so the evidence is immediately available.

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
- [Azure Foundry setup](docs/AZURE_SETUP.md)
- [Official Microsoft Premier League Hackathon rules](https://github.com/microsoft/insidethegamehackathon/blob/main/OFFICIAL%20RULES.md)
- [Microsoft Reactor hackathon page](https://developer.microsoft.com/en-us/reactor/series/S-1709/)

The app uses original synthetic data and no Premier League logos, footage, or real player data. The [source repository is public](https://github.com/guuly05/MSxPL); the demo video and hackathon submission still need to be completed.
