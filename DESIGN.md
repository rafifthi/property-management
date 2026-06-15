---
name: Rentra Property Management
description: A calm property-operations command center for Indonesian landlords.
colors:
  primary: "#2563eb"
  primary-foreground: "#ffffff"
  background: "#f8fafc"
  foreground: "#1d2129"
  card: "#ffffff"
  card-foreground: "#1d2129"
  muted: "#f7f8fa"
  muted-foreground: "#4e5969"
  accent: "#f7f8fa"
  accent-foreground: "#1d2129"
  border: "#e5e6eb"
  input: "#e5e6eb"
  ring: "#2563eb"
  destructive: "#ef4444"
  success-soft: "#dcfce7"
  success-foreground: "#15803d"
  warning-soft: "#fef3c7"
  warning-foreground: "#b45309"
typography:
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "0"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "36px"
  card-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "4px 12px"
    height: "36px"
  tab-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
---

# Design System: Rentra Property Management

## 1. Overview

**Creative North Star: "Quiet Command Center"**

Rentra is a restrained product interface for owners who need operational clarity before visual delight. The system should feel like a quiet command center: enough density to manage properties, payments, tenants, utilities, tickets, and settings, but never so much decoration that the next action gets harder to find.

The visual language is clean, efficient, and easy. Surfaces are flat layered with soft borders, not heavy cards. Components are soft approachable: modest radius, familiar controls, readable labels, and clear state feedback. This system explicitly rejects flashy SaaS marketing UI, generic AI-looking card grids, gradients, ornamental motion, and visuals that compete with the operational task.

**Key Characteristics:**
- Owner-first operational clarity.
- Restrained blue accent used for selection, primary action, and focus.
- Soft bordered surfaces over heavy shadows.
- Familiar app-shell patterns: sidebar, sticky header, horizontal settings tabs, tables, cards, badges.
- Indonesian property-management vocabulary stays visible where it matters: kos, ruko, kontrakan, PPOB, KTP, WhatsApp.

## 2. Colors

The palette is a restrained product palette: cool near-white background, white cards, dark ink, soft neutral borders, and one trustworthy blue accent.

### Primary
- **Command Blue**: The primary action, current navigation, focus ring, and selected-state color. It should stay rare enough to mean "act here" or "you are here."

### Secondary
- **Operational Green**: Soft success states for paid, active, occupied, and resolved statuses.
- **Follow-up Amber**: Soft warning states for partial, assigned, and follow-up work.

### Neutral
- **Cool Workspace**: The main application background; use it behind panels and content areas.
- **Paper Surface**: Default card, panel, popover, and header surface.
- **Ink**: Primary text for headings, labels, table values, and high-importance data.
- **Muted Copy**: Secondary labels, helper text, metadata, and inactive navigation.
- **Soft Border**: Dividers, input strokes, table rules, and panel boundaries.

### Named Rules

**The One Accent Rule.** Command Blue is for action, selection, focus, and key status only. Do not use it as decoration.

**The Soft Border Rule.** Depth is primarily created with borders and tonal layering. Shadows are secondary and must stay subtle.

## 3. Typography

**Display Font:** Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
**Body Font:** Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
**Label/Mono Font:** Same family; no separate display or mono style is established.

**Character:** Single-family product typography keeps the interface familiar and fast to scan. The hierarchy is tight and functional, with weight and spacing doing the work instead of oversized type.

### Hierarchy
- **Display**: Not a default product role. Avoid hero-scale text inside authenticated app surfaces.
- **Headline** (600, 20px, 28px): Page titles and major section headers.
- **Title** (600, 16px-18px, 24px): Card titles, table group labels, modal titles.
- **Body** (400, 14px, 21px): Form copy, table values, descriptions, and general content. Keep prose blocks under 65-75ch.
- **Label** (500-650, 12px-13px, 16px-20px): Buttons, metadata, compact labels, badges, and navigation items.

### Named Rules

**The No Display Theater Rule.** Product UI uses a tight type scale. If a heading feels like landing-page marketing, it is too large for this product.

## 4. Elevation

Rentra uses flat layered elevation. Most surfaces sit on the page through white/card backgrounds, soft borders, and spacing. Shadows are allowed for popovers, hovered cards, and transient overlays, but they must remain ambient and low contrast.

### Shadow Vocabulary
- **Surface Rest** (`box-shadow: none` or `0 1px 2px rgba(15, 23, 42, 0.04)`): Default cards and panels.
- **Surface Hover** (`box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08)`): Interactive cards only, used sparingly.
- **Floating Overlay** (`box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14)`): Dialogs, dropdowns, and live overlays.

### Named Rules

**The Flat Until Needed Rule.** Surfaces are flat at rest. Elevation appears only to clarify interaction, layering, or temporary focus.

## 5. Components

### Buttons

Buttons are precise and approachable: compact height, modest radius, readable labels, and no decorative effects.

- **Shape:** Soft rectangle (6px radius).
- **Primary:** Command Blue background with white text; use for the main action in a local area only.
- **Hover / Focus:** Slight blue darkening on hover; visible one-pixel focus ring using the ring token.
- **Secondary / Ghost / Tertiary:** Outline or ghost styles should use neutral surfaces and accent hover states, not extra colors.

### Chips

- **Style:** Badges and chips use soft filled semantic backgrounds with dark readable text.
- **State:** Success and warning chips must pair color with text. Do not rely on hue alone for status meaning.

### Cards / Containers

- **Corner Style:** Soft container corners (12px for cards, 8px for compact panels).
- **Background:** Paper Surface on Cool Workspace.
- **Shadow Strategy:** Flat by default; low ambient hover only when the card is clickable.
- **Border:** Always use Soft Border for static surfaces.
- **Internal Padding:** 16px for compact surfaces, 20px-24px for cards and panels.

### Inputs / Fields

- **Style:** 36px height, 6px radius, soft border, transparent or card background.
- **Focus:** One-pixel focus ring in Command Blue. Focus must be visible against both card and workspace surfaces.
- **Error / Disabled:** Error states use destructive color plus text. Disabled states reduce opacity and cursor affordance.

### Navigation

Navigation is familiar and quiet. Sidebar items use muted text at rest, soft accent backgrounds on hover, and Command Blue for the active route. Collapsed sidebar items rely on tooltips. Settings submodules use horizontal tabs with a soft active background and a primary underline.

### Metric Cards

Metric cards summarize operational state, not marketing claims. They use Paper Surface, Soft Border, compact icons on muted tiles, and strong numeric values. Keep hints short and action-oriented.

## 6. Do's and Don'ts

### Do:
- **Do** use Command Blue only for actions, selected states, focus, and high-importance links.
- **Do** keep surfaces flat layered with soft borders before reaching for shadows.
- **Do** use familiar product controls for standard tasks: tabs, tables, forms, side navigation, badges, dialogs, and dropdowns.
- **Do** keep copy direct and operational; labels should help owners act quickly.
- **Do** preserve Indonesian domain terms when they reduce ambiguity: kos, ruko, kontrakan, PPOB, KTP, WhatsApp.

### Don't:
- **Don't** make it feel like a flashy SaaS marketing page.
- **Don't** use generic AI-looking card grids.
- **Don't** use gradients, gradient text, glassmorphism, or ornamental motion.
- **Don't** let visuals compete with the operational task.
- **Don't** use hero-scale typography, decorative metrics, or landing-page composition inside the authenticated app.
