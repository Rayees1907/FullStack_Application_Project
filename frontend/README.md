# Simple Bank Frontend

A tiny React + Vite frontend for the Simple Bank demo.

Environment:
- Copy `.env.example` to `.env` and set `VITE_API_URL` to your backend API (e.g. `http://localhost:4000/api`)

Scripts:
- `npm run dev` - start dev server
- `npm run build` - build production bundle

Notes:
- Token is stored in `localStorage` as `sb_token` and attached as `Authorization: Bearer <token>`.
- The UI is intentionally small and naive (for learning). For production consider better token handling, refresh tokens, and form validation.
