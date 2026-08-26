# Contributing

## Before submitting changes

Run the project checks:

```bash
npm run format:check
npm run lint
npm run build
```

Use `npm run format` to apply the project formatting rules automatically.

## Place data

Travel place records live in `src/data/places.ts`. Preserve the existing `Place` structure when
adding or updating records, keep IDs unique, and use valid coordinates and URLs.

## Commit messages

This project follows [Conventional Commits 1.0.0-beta.4](https://www.conventionalcommits.org/en/v1.0.0-beta.4/).

Use this structure:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

Allowed common types:

- `feat`: add a user-visible feature.
- `fix`: correct a defect.
- `docs`: change documentation only.
- `style`: change formatting without changing behavior.
- `refactor`: restructure code without adding a feature or fixing a defect.
- `perf`: improve performance.
- `test`: add or update tests.
- `build`: change the build system or dependencies.
- `ci`: change continuous integration.
- `chore`: make routine maintenance changes.
- `revert`: revert an earlier commit.

Examples:

```text
feat(map): add a new journey marker
fix(layout): prevent route label overflow
build: configure eslint and prettier
docs: document commit conventions
```

For a breaking change, add `!` before the colon and include a `BREAKING CHANGE:` footer.

Keep the description concise, imperative, and lowercase. Prefer separate commits when one change
would need multiple unrelated types.

To validate a message manually:

```bash
echo "feat(map): add a new place" | npm run lint:commit
```
