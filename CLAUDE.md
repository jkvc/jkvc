# CLAUDE.md

## Important Rules

### 1. Build Commands Must Use Separate Directory
If you need to run `pnpm run build` for any reason (only when it is appropriate for complex changes), you **must** use the separate build directory to avoid conflicts with a running dev server:

```bash
CHECK_BUILD=1 pnpm run build
```

This uses `.next-check` as the output directory instead of `.next`. See `next.config.ts` for implementation.

### 2. Never Commit or Push Without Explicit Permission
You are **never allowed** to commit or push any code unless the user explicitly tells you to do so in a **separate user message**. Do not proactively commit or push changes, even if they appear complete.

### 3. Keep CLAUDE.md Stable
Do **not** add frequently-changing content to this file such as:
- Lists of demos or features
- Specific environment variable names
- Configuration details that evolve with code

This file is for stable rules and conventions. Use code comments or README for implementation details.

### 4. Package Manager
This project uses **pnpm**. Never use `npm` or `yarn` commands.
