# Design Guide: Zwembadredders Planning

## 🎨 Design Philosophy

> **User First** — We fight for the human expert using the tool.  
> **Pixel Perfect** — Alignment, whitespace, and contrast matter.  
> **Accessibility** — WCAG 2.1 AA compliance is non-negotiable.

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Primary** | `#0ea5e9` | CTAs, links, active states |
| **Primary Dark** | `#0284c7` | Hover states |
| **Secondary** | `#6366f1` | Accents, badges |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#10b981` | Confirmations, available |
| **Warning** | `#f59e0b` | Alerts, part-time status |
| **Danger** | `#ef4444` | Errors, conflicts |

### Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Background** | `#0f172a` | Page background |
| **Surface** | `#1e293b` | Cards, containers |
| **Surface Hover** | `#334155` | Interactive hover |
| **Text** | `#f1f5f9` | Primary text |
| **Text Muted** | `#94a3b8` | Secondary text |
| **Border** | `#334155` | Dividers |

### Employee Colors (Personal)

Each employee has a unique color for calendar identification:

- `#e74c3c` — Red
- `#3498db` — Blue
- `#2ecc71` — Green
- `#9b59b6` — Purple
- `#f39c12` — Orange

---

## Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| **H1 (Page Title)** | Inter | 700 | 28px |
| **H2 (Section)** | Inter | 600 | 24px |
| **H3 (Card Title)** | Inter | 600 | 18px |
| **Body** | Inter | 400 | 16px |
| **Small/Muted** | Inter | 400 | 14px |
| **Badge** | Inter | 500 | 12px |

**Line Height:** 1.6 for body text

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Badge padding |
| `--space-sm` | 8px | Icon gaps |
| `--space-md` | 16px | Card padding |
| `--space-lg` | 24px | Section gaps |
| `--space-xl` | 32px | Page padding |

---

## Components

### Cards

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
}
```

### Buttons

| Variant | Background | Text |
|---------|------------|------|
| Primary | Gradient (primary → secondary) | White |
| Secondary | Surface | Text |
| Danger | Danger/20% | Danger |

**Hover Effect:** `translateY(-2px)` + shadow

### Badges

| Type | Background | Text |
|------|------------|------|
| Lifeguard | `rgba(14, 165, 233, 0.2)` | Primary |
| Instructor | `rgba(99, 102, 241, 0.2)` | Secondary |
| Fulltime | `rgba(16, 185, 129, 0.2)` | Success |
| Parttime | `rgba(245, 158, 11, 0.2)` | Warning |

---

## Layout

### 3-Panel Structure (Desktop)

```
┌─────────────┬────────────────────────────────────┐
│             │                                    │
│   SIDEBAR   │          MAIN CONTENT              │
│   (280px)   │          (flex: 1)                 │
│             │                                    │
│  Navigation │   ┌────────────────────────────┐   │
│             │   │  Page Header               │   │
│             │   ├────────────────────────────┤   │
│             │   │  Cards / Calendar          │   │
│             │   └────────────────────────────┘   │
│             │                                    │
└─────────────┴────────────────────────────────────┘
```

### Mobile (< 768px)

- Sidebar becomes horizontal nav bar
- Single column layout
- Touch-friendly tap targets (44px min)

---

## Accessibility Checklist

- [x] Color contrast ratio ≥ 4.5:1 for text
- [x] Focus indicators on all interactive elements
- [x] Semantic HTML (headings, landmarks)
- [x] Form labels associated with inputs
- [x] Alt text for meaningful images
- [x] Keyboard navigable
- [x] No color-only meaning (icons + text)

---

## Calendar Considerations

### Event Colors

Events inherit user's personal color for quick identification.

### Time Grid

- Slot height: comfortable for touch
- Time labels: left aligned, muted color
- Today: subtle highlight background

### Event Cards

```css
.fc-event {
  border: none;
  border-radius: 6px;
  padding: 2px 6px;
}
```

---

## Do's and Don'ts

### ✅ Do

- Use consistent spacing
- Group related information
- Provide visual feedback on interactions
- Use icons with text labels
- Test with keyboard navigation

### ❌ Don't

- Use more than 3 font weights
- Create walls of text
- Hide critical info in tooltips
- Use low-contrast placeholder text
- Rely on color alone for meaning
