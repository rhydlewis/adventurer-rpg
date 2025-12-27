# Git Workflow

## Branching Strategy

- **Main branch** (`main`) - Production-ready code
- **Feature branches** - One branch per feature/phase
- **Hot fixes** - Fix critical bugs directly from main

## Commit Guidelines

### Commit Message Format

Be descriptive and specific:

```bash
# Good commits
"Add initiative system with d20 roll and DEX modifier"
"Implement critical hit mechanics with double damage"
"Create saving throw utilities for Fort/Reflex/Will"

# Batch commits (Phase 1 workflow)
"Add Phase 1.2 Batch 1: initiative, criticals, saving throws utilities"
"Add Phase 1.2 Batch 2: integrate systems into combat store"
"Complete Phase 1.2: Enhanced Combat Foundation"
```

### What to Commit

**Do commit**:
- Source code changes
- Test files
- Documentation updates
- Configuration changes
- Native project configs (`ios/`, `android/`)
- `CLAUDE.md` improvements

**Don't commit**:
- Generated files (`dist/`)
- Native web assets (`ios/App/App/public/`, `android/app/src/main/assets/`)
- Dependencies (`node_modules/`)
- IDE-specific files (use `.gitignore`)
- Local environment files

## Common Git Operations

### Creating a Feature Branch

```bash
git checkout -b feature/phase-1.2-combat-enhancements
```

### Committing Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add critical hit mechanics with double damage"

# Push to remote
git push origin feature/phase-1.2-combat-enhancements
```

### Keeping Branch Updated

```bash
# Fetch latest changes
git fetch origin

# Rebase on main
git rebase origin/main

# Or merge (if preferred)
git merge origin/main
```

### Viewing History

```bash
# View commit log
git log --oneline

# View changes in last commit
git show

# View file history
git log -p path/to/file
```

## Best Practices

1. **Commit frequently** - Small, focused commits are easier to review and revert
2. **Write clear messages** - Future you will thank present you
3. **Test before committing** - Run `npm test` and `npm run lint`
4. **Review your changes** - Use `git diff` before committing
5. **Keep commits atomic** - One logical change per commit

## Undoing Changes

```bash
# Unstage files
git reset HEAD <file>

# Discard local changes
git checkout -- <file>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

## Working with Remotes

```bash
# View remote repositories
git remote -v

# Add remote
git remote add origin <url>

# Fetch changes
git fetch origin

# Pull changes
git pull origin main
```

## Merge Conflicts

When conflicts occur:

1. **Identify conflicted files** - `git status` shows them
2. **Open files and resolve conflicts** - Look for `<<<<<<<`, `=======`, `>>>>>>>`
3. **Mark as resolved** - `git add <file>`
4. **Complete merge/rebase** - `git commit` or `git rebase --continue`

## Repository Etiquette

- **Pull before starting work** - Stay in sync with team
- **Push regularly** - Don't hoard commits locally
- **Use meaningful branch names** - e.g., `feature/spell-system`, `fix/save-bug`
- **Clean up old branches** - Delete merged branches to keep repo tidy
