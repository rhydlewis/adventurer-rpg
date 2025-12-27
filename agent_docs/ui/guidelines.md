# UI Guidelines

## Semantic Typography System

The app uses **semantic typography classes** instead of direct font utilities. This makes it easy to change fonts, sizes, and weights globally without touching component code.

**Defined in**: `src/index.css` under `@layer utilities`

### Usage Pattern

```tsx
// ❌ Avoid (hard to theme)
<h1 className="font-cinzel font-bold text-display text-text-accent">Title</h1>
<p className="font-inter text-body text-text-primary">Body text</p>

// ✅ Prefer (semantic, themeable)
<h1 className="heading-display text-text-accent">Title</h1>
<p className="body-primary">Body text</p>
```

### Available Classes

Reference `src/index.css` for the authoritative list of available classes. Common categories:

**Headings**: `.heading-display`, `.heading-primary`, `.heading-secondary`, `.heading-tertiary`

**Stats & Numbers**: `.stat-large`, `.stat-medium`, `.stat-small`, `.stat-modifier`

**Body Text**: `.body-primary`, `.body-secondary`, `.body-muted`, `.body-narrative`

**UI Elements**: `.button-text`, `.label-primary`, `.label-secondary`, `.combat-log`, `.tab-text`, `.input-text`

**Special Purpose**: `.character-name`, `.skill-name`, `.feat-name`, `.attribute-value`, `.attribute-label`

### Benefits

- Change fonts app-wide by modifying one CSS file
- Consistent typography across all screens
- Easier to maintain and theme
- Self-documenting code

### When Working on UI

1. **Always use semantic classes** - Check `src/index.css` for available options
2. **Create new semantic classes** - If you need a new style, add it to the semantic system
3. **Never use direct font utilities** - Except for one-off edge cases with clear justification
4. **Follow existing patterns** - Look at other screens to understand conventions

## Component Patterns

When creating new UI components:

1. **Examine existing screens** - Understand established patterns first
2. **Reuse components** - Check if a similar component already exists
3. **Follow the separation of concerns** - Keep state in stores, logic in utils, presentation in components
4. **Use semantic typography** - Don't hardcode fonts/sizes
5. **Test responsiveness** - Ensure it works on mobile and desktop

## Mobile Considerations

- Test on actual devices when possible (`npm run build && npx cap sync`)
- Use touch-friendly hit targets (minimum 44x44 pixels)
- Consider thumb zones for bottom navigation
- Test with Safari dev tools for iOS, Chrome inspect for Android
