# Steam Bot Network

A Node.js service that runs multiple Steam bot accounts in a single process and exposes them through a small, API-key-protected REST API for creating trade offers and reading inventories.

## Features

- **Concurrent start-up.** All configured bots log in in parallel, with Steam Guard codes generated automatically (TOTP). A bot that fails to log in is reported and skipped. The service only stops if every bot fails. Each login times out after 120 seconds.
- **Least-busy assignment.** Each bot's active offers are tracked from trade-offer state changes, and new work goes to the bot with the fewest.
- **Trade offers.** Supports *incoming* offers (the user gives items) and *outgoing* offers (the bot gives items). Every requested asset is checked against the live inventory before an offer is sent.
- **Automatic confirmations.** Mobile trade confirmations are accepted every 5 seconds using each bot's identity secret.
- **Defensive offer handling.** Unsolicited and countered offers are declined automatically, and unknown active offers sent from a bot are cancelled.
- **Account health.** Account limitations (limited, community banned, locked) are detected and logged at start-up.
- **API-key authentication** on every request.

## Tech stack

Node.js (ES modules) · Express 5 · steam-user · steam-totp · steamcommunity · steam-tradeoffer-manager

## API

Base path: `/api.botnet/v1`. Every request needs the API key in the `Authorization` header.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/bots/least_busy` | Returns the Steam ID of the bot with the fewest active offers |
| `POST` | `/bots/trade_offers` | Creates and sends trade offers (`offer_type`: `incoming` or `outgoing`) |
| `POST` | `/fetch/inventory` | Fetches a user's inventory through a given bot |

## Getting started

```sh
npm install
node app.mjs   # listens on port 3000
```

Before starting:

1. Create `config/bots.json` (gitignored) containing an array of bot accounts: credentials, `two_factor` secrets and polling/cancel settings.
2. Set the API key in `src/utils/deps.mjs`.

## Status

Functional and tested with 2 bot accounts. It was designed to coordinate up to ~500. *Mutual* offers (both parties give items) are planned but not implemented yet.
