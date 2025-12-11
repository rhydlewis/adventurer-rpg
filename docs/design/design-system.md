# ⚔️ Adventurer RPG Mobile Style Guide

This guide condenses the Adventurer RPG Design System v1.0 into core rules and tokens for front-end development, specifically focusing on a dark, fantasy-immersive mobile UI.

## I. Core Principles & Accessibility

* **Mobile-First, Portrait Focus:** Design for full-width components on mobile portrait screens (Max $\text{width}: \mathbf{480px}$). Use `max(16px, env(safe-area-inset-*))` for padding.
* **One-Handed Access:** Primary actions ($\mathbf{48px}$ height, $\mathbf{44px}$ min tap target) must be easily accessible (e.g., bottom navigation).
* **Aesthetic:** Dark theme optimization (`--bg-primary: \#0F1419`) with high contrast text (`--text-primary: \#E8E6E3`).
* **Accessibility (WCAG 2.1 AA):**
    * **Min Tap Target:** $\mathbf{44 \times 44px}$ for all interactive elements.
    * **Min Body Text Size:** $\mathbf{16px}$ (`--text-body`).
    * **Focus:** Use $\mathbf{2px}$ solid `--color-player` outline (`:focus-visible`).
    * **Reduced Motion:** Must respect `prefers-reduced-motion: reduce`.
* **Spacing:** Follow a $\mathbf{4px}$ grid system. Default spacing is $\mathbf{16px}$ (`--space-4`).

## II. Typography & Hierarchy

| Usage Category | Font Family | Weight/Size (Token) | Key Rule |
| :--- | :--- | :--- | :--- |
| **Titles/Headings** | **Cinzel** (Decorative) | `--font-bold`, `--font-black` | Use for screen titles, major headings, character names. |
| **UI/Interface** | **Inter** (Sans-serif) | `--font-medium`, `--font-semibold` | Use for buttons, stats, labels, and combat log. |
| **Narrative/Body** | **Merriweather** (Serif) | `--font-regular` ($\mathbf{16px}$) | Use for dialogue, long descriptions, modal content. |
| **Code/Dice** | **Courier New** (Monospace) | $\mathbf{13-14px}$ (`--text-dice`) | Use for all dice rolls and code-like output. |

| Text Token | Size (px) | Line Height |
| :--- | :--- | :--- |
| `--text-display` | $\mathbf{32px}$ | $1.2$ |
| `--text-h1` | $\mathbf{24px}$ | $1.3$ |
| `--text-body` | $\mathbf{16px}$ | $1.6$ |
| `--text-caption` | $\mathbf{12px}$ | $1.4$ |

## III. Color System & Semantic Usage

Use the color variables (CSS variables) below for all color applications.

| Token Category | CSS Variable | Hex Value | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Background** | `--bg-primary` | $\#0F1419$ | Main screen background. |
| **Surface/Card** | `--bg-secondary` | $\#1A1F26$ | Cards, panels. |
| **Primary Text** | `--text-primary` | $\#E8E6E3$ | Default text on dark backgrounds. |
| **Accent/Gold** | `--text-accent` | $\#D4AF37$ | Highlights, emphasis (e.g., Critical Hits, Legendary). |
| **Player/Ally** | `--color-player` | $\#3B82F6$ | Player actions, primary buttons, borders. |
| **Enemy/Danger** | `--color-enemy` | $\#DC2626$ | Enemy actions, danger buttons, low HP. |
| **Success/Heal** | `--color-success` | $\#10B981$ | Healing, buffs, positive feedback. |
| **Warning/Caution** | `--color-warning` | $\#F59E0B$ | Low-to-mid HP ($\mathbf{50-74\%}$), debuffs. |
| **Magic** | `--color-magic` | $\#8B5CF6$ | Spells, magical effects. |
| **Borders/Default** | `--border-default` | $\#374151$ | Standard borders, dividers. |

### Semantic Color Rules

* **HP Color Coding:** HP status must change based on percentage:
    * $\mathbf{75-100\%}$: `--text-primary`
    * $\mathbf{50-74\%}$: `--color-warning`
    * $\mathbf{0-49\%}$: `--color-enemy-light` or `--color-enemy`
* **Combat Log:** Color-code entry backgrounds: Player (`rgba(59, 130, 246, 0.2)` - blue), Enemy (`rgba(220, 38, 38, 0.2)` - red), System (`rgba(139, 92, 246, 0.2)` - purple).

## IV. Component Specifications

### Buttons
* **Primary/Danger:** $\mathbf{48px}$ height, $\mathbf{8px}$ border-radius, `Inter Semibold 16px`. Use `box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3)` for depth.
* **Focus State:** All buttons must have a visible focus ring using `--border-focus` or `--color-player`.

### Cards (Character/Enemy)
* **Layout:** Full-width, $\mathbf{16px}$ padding, $\mathbf{12px}$ border-radius.
* **Border:** $\mathbf{2px}$ solid, using `--border-player` or `--border-enemy`.
* **HP Bar:** $\mathbf{8px}$ high, visually represented with color gradient based on $\mathbf{HP\%}$.

### Combat Log
* **Container:** `max-height: 320px` (portrait), `overflow-y: auto`, $\mathbf{8px}$ border-radius.
* **Entries:** `Inter Regular 14px`, with color-coded backgrounds based on actor.
* **Dice Notation:** Use `Courier New 13px` inside a small, dark background chip (`rgba(0,0,0,0.3)`).

## V. Iconography & Motion

* **Icon Library:** Use **Lucide React**. Ensure all icons $\mathbf{24 \times 24px}$ (`--icon-md`) by default.
    * **Accessibility:** Always include `aria-label` or screen reader text; set icons to `aria-hidden="true"` when text is present.
    * **Color:** Color icons semantically (e.g., `<Heart className="text-success" />`).
* **Motion:** Animations must be **Purposeful, Subtle, and Fast** ($\mathbf{200-300ms}$).
    * **Button Press:** `transform: scale(0.98)` over $\mathbf{100ms}$ (`--duration-instant`).
    * **HP Transition:** Use animated transitions (e.g., $\mathbf{300ms}$ ease) when HP changes.

## VI. Implementation Guidelines

* **Tech Stack:** Use **Tailwind CSS v4** with CSS variables (`@theme` block) to map design tokens.
* **Font Loading:** **Preload** Merriweather, Inter, and Cinzel to prevent FOUT (Flash of Unstyled Text).
* **Safe Areas:** Explicitly handle iOS/Android safe areas in top/bottom navigation and main containers using `env(safe-area-inset-*)`.