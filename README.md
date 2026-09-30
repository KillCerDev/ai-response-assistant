# Interview Assistant Mini

AI assistant for interviews, classes, meetings and live conversations.

## Features

- Microphone and browser-shared computer audio capture
- Interview, Class, Meeting and General modes
- OpenAI transcription and suggested responses
- Automatic language-aware responses
- React frontend and Node.js/Express backend
- Playwright tests with mocked API responses

## Tech stack

React, TypeScript, Vite, Node.js, Express, OpenAI API and Playwright.

## Setup

```bash
npm install
```

Create `.env` from `.env.example` and set your own key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Start the app:

```bash
npm run dev
```

Open `http://127.0.0.1:5174`.

## Scripts

- `npm run dev` - start frontend and backend
- `npm run typecheck` - check TypeScript
- `npm run build` - create a production frontend build
- `npm run test:e2e` - run Playwright tests with mocks
- `npm run test:openai` - verify the local OpenAI configuration

## Status

Active local-development project. The TypeScript migration is incremental; `src/App.tsx` and `server/index.ts` currently retain temporary `@ts-nocheck` markers while their existing runtime logic is migrated in smaller verified steps.

Audio is processed only after the user explicitly chooses to record. Obtain appropriate consent before recording classes, meetings or interviews.
