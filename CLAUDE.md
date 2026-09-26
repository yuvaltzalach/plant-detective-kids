# CLAUDE.md

## Git workflow

- After finishing and pushing a change, always open a pull request to `main` and merge it yourself — do not ask for confirmation first. The app is deployed from `main` (Cloudflare Pages), so unmerged changes are not visible to the user.
- Before merging, run `npm run test` and `npm run build` locally and make sure both pass.
