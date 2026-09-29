# Brand — Funded

Community crowdfunding on Arc, where creators raise native USDC toward clear campaign goals.

_Generated on 2026-09-28 from user-selected palette and typography previews._

## Palette — Peach Comfort

**Vibe:** friendly, open, warm, minimal  
**Category:** consumer / social  
**Mood:** minimal + warm

| Role | OKLCH | Hex |
|---|---|---|
| Page background | `oklch(0.97 0.02 45)` | `#FCF5EC` |
| Elevated surface | `oklch(1 0 0)` | `#FFFFFF` |
| Primary | `oklch(0.62 0.19 30)` | `#D96C4A` |
| Primary soft | `oklch(0.80 0.14 30)` | `#EFA487` |
| Foreground | `oklch(0.22 0.02 30)` | `#241812` |

Dark palette seed values: background `#1B1512`, surface `#261D19`, primary `#F09070`, soft `#F4B59C`, foreground `#F5ECE4`, muted `#CBB7AA`.

Contrast measured in the browser preview: body text on background 16.0:1; button label on primary 5.6:1; primary on background 3.1:1.

No gradients. The project uses Vite and Tailwind CSS without shadcn; map these colors through CSS variables in `src/index.css` and Tailwind's `theme.extend.colors` rather than shadcn tokens.

## Typography — Inter + JetBrains Mono

- **Display and body:** Inter
- **Numbers, addresses, and transaction identifiers:** JetBrains Mono with tabular numerals
- **Load through CSS in `src/index.css`**; do not use Next.js font APIs in this Vite project.

## Voice

Use warm, clear language addressed to the creator or supporter. Explain the funding outcome and fee directly. Avoid hype, vague promises, and claims of automatic payout or refund unless the contract performs that action.

## Usage

- Display all campaign and contribution values as USDC. Native Arc amounts use 18-decimal `msg.value`; convert with the native 18-decimal scale and limit user-entered display values to standard 6-decimal USDC precision.
- Use `font-mono tabular-nums` for changing amounts and addresses.
- Keep core layouts restrained and functional; use terracotta for primary actions and status accents, not as a large background.
- Preserve accessible contrast and visible keyboard focus states.
