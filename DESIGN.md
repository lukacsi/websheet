# WebSheet Design System

## 1. Atmosphere & Identity

WebSheet is fantasy-functional: a leather-bound character journal translated into a modern, readable dashboard. Its signature is warm parchment and restrained gold over layered charcoal surfaces, with Cinzel headings establishing the D&D tone without reducing usability.

## 2. Color

All colors come from the Mantine tuples in `src/theme/index.ts`; components use their Mantine token names rather than raw values.

| Role | Token family | Usage |
|---|---|---|
| Page and surface | `dark` | Page background and layered containers |
| Primary text | `parchment` | Body copy, headings, borders, and focus treatment |
| Primary interaction | `inkBrown` | Default controls and warm interactive emphasis |
| Highlight | `gold` | Primary actions and important values |
| Destructive | `bloodRed` | Damage, failure, and destructive states |

Filled accent controls must meet WCAG AA text contrast. Mantine automatic contrast is the default; do not force white text onto mid-tone gold.

## 3. Typography

- Headings: `Cinzel`, then `Crimson Text`, Georgia, serif.
- Body and labels: `Crimson Text`, Georgia, `Times New Roman`, serif.
- Sizes use Mantine's named scale (`xs`, `sm`, `md`, `lg`, `xl`) and heading orders rather than one-off pixel values.
- Data that must align uses tabular figures or the Mantine monospace fallback.

## 4. Spacing & Layout

- Mantine's 4px spacing base is authoritative; use named spacing values.
- Primary content uses Mantine containers; the home page uses `md`, while the application header uses `xl`.
- Mobile layouts stack actions rather than compressing prose beside fixed-width controls.
- Touch targets are at least 44px high where space permits and never below 24px.
- Cards in the same row align repeated actions to a shared baseline.

## 5. Components

### Cards

- `surfaceStyle`, `cardStyle`, and `elevatedStyle` in `src/theme/styles.ts` define the three depth tiers.
- Only cards rendered as links lift on hover. Static cards must not imply clickability.
- Focus remains on the interactive descendant unless the card itself is the link.

### Buttons

- Filled buttons use automatic foreground contrast.
- Outline buttons use parchment text and borders.
- Every button has visible hover, active, focus, and disabled states supplied by Mantine and the global focus rule.

### Header navigation

- Text links remain visually quiet but expose a minimum 44px interaction height.
- The logo and navigation stay within the 56px header at supported breakpoints.

## 6. Motion & Interaction

- Micro-interactions use 100–150ms transitions.
- Animate only `transform`, `opacity`, `background-color`, `border-color`, or `box-shadow`; never animate layout dimensions or position.
- Clickable cards may lift by 1px. Static cards do not move.
- Keyboard focus uses the warm 2px parchment outline from `src/theme/global.css`.
- Non-essential motion must respect the user's reduced-motion preference when introduced.

## 7. Depth & Surface

WebSheet uses a mixed tonal, border, and shadow strategy already defined in `src/theme/styles.ts`:

| Level | Source | Usage |
|---|---|---|
| Surface | `surfaceStyle` | Headers, sidebars, and drawer backgrounds |
| Card | `cardStyle` | Standard content containers |
| Elevated | `elevatedStyle` | Primary and high-attention content |
| Accent glow | `glowAccent` | Important interactive regions only |

The body noise texture may add atmosphere but never replace live content or reduce contrast. New depth treatments must reuse these tiers before introducing another.
