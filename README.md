# PackTrack Monorepo

- `shared`: Shared TypeScript domain contracts.
- `server`: NestJS API + Supabase integration.
- `client`: Angular standalone app consuming the API.

## Quick start

1. `npm install`
2. Copy `server/.env.example` to `server/.env` and fill values.
3. Run API: `npm run dev:server`
4. Run UI: `npm run dev:client`
