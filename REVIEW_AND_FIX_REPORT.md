# Review and Fix Report

## Changes
- Initialized the auth store before installing the router, preventing refreshes of protected routes from seeing an empty token.
- Added the missing `initialStock` field when loading an existing product into the edit dialog.
- Changed order product lookup to use `getProduct(id)` instead of searching only the first 50 products, so totals work for remotely searched products outside page 1.

## Verification
- `npm run build` passed.
- `git diff --check` passed.

## Remaining
- `npm ci` reported 2 moderate dependency vulnerabilities; I did not run dependency upgrades in this task.
