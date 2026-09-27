# Serverless Functions with Netlify

A small TypeScript project for learning **Netlify Functions**. It includes simple HTTP functions and a GitHub webhook that sends repository activity to Discord.

## Tech stack

- Node.js and TypeScript (strict mode)
- [Netlify Functions](https://docs.netlify.com/build/functions/overview/)
- `@netlify/functions`
- Native Fetch and Web Crypto APIs

## Functions

| Function | Purpose |
| --- | --- |
| `/.netlify/functions/hello` | Returns `{ "message": "Hello, world!" }`. |
| `/.netlify/functions/variables` | Returns the `MY_ENV_VAR` environment variable. |
| `/.netlify/functions/github-discord` | Receives GitHub `star` and `issues` webhooks and posts them to Discord. |

## Getting started

### Prerequisites

- Node.js (current LTS recommended)
- A Netlify account and the Netlify CLI

### Install and run locally

```bash
npm install
npx netlify dev
```

The project also provides this script when the Netlify CLI is installed globally:

```bash
npm run netlify:dev
```

Netlify serves the functions locally under `http://localhost:8888/.netlify/functions/`.

## Environment variables

Create a local `.env` file or configure these variables in Netlify. Never commit this file.

```env
MY_ENV_VAR=example-value
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SECRET_TOKEN_WEBHOOK=your-github-webhook-secret
```

| Variable | Used by | Description |
| --- | --- | --- |
| `MY_ENV_VAR` | `variables` | Example variable returned by the function. |
| `DISCORD_WEBHOOK_URL` | `github-discord` | Discord webhook destination. |
| `SECRET_TOKEN_WEBHOOK` | `github-discord` | Shared secret used to validate GitHub webhook signatures. |

## GitHub to Discord webhook

1. Deploy the site to Netlify.
2. In your GitHub repository, open **Settings → Webhooks → Add webhook**.
3. Set the payload URL to:

   ```text
   https://<your-netlify-site>/.netlify/functions/github-discord
   ```

4. Set the secret to the same value as `SECRET_TOKEN_WEBHOOK` in Netlify.
5. Select the **Stars** and **Issues** events.

The function validates GitHub's `x-hub-signature-256` header before sending a formatted notification to Discord.

## Deployment

Connect this repository to Netlify, add the environment variables in the site's configuration, and deploy. Netlify automatically discovers functions in `netlify/functions`.

## Notes

- `.env`, `.netlify`, and `node_modules` are intentionally ignored by Git.
- Discord delivery errors are logged by the function.

## License

No license has been specified yet.
