# UI/UX Design System - AI2AIM RX Platform (Aeterna OS)

**Date**: January 17, 2026  
**Version**: 2.1  
**Status**: Active Design System

---

## Design Philosophy

The AI2AIM RX platform features a **dual-skin adaptive design system** that allows users to switch between two distinct visual experiences:

1. **Aeterna OS Cinematic Skin** - Futuristic, space-age aesthetic with glassmorphism and neural effects
2. **Clinical Legacy Skin** - High-density, efficient medical interface optimized for clinical workflows

This dual approach balances **artistic vision** with **clinical efficiency**, allowing users to choose their preferred experience.

---

## Aeterna OS Cinematic Skin

### Visual Identity

**Theme**: Space-age medical command center  
**Aesthetic**: Dark, cinematic, high-tech  
**Inspiration**: Sci-fi medical interfaces, neural networks, space command centers

### Color Palette

#### Primary Colors
- **The Void** (`#020408` / `hsl(222, 47%, 4%)`) - Deep space background
- **Nebula Emerald** (`#10B981` / `hsl(160, 84%, 39%)`) - Primary accent, AI intelligence
- **Neural Violet** (`#8B5CF6` / `hsl(262, 83%, 58%)`) - Secondary accent, neural pathways
- **Supernova** (`#F9FAFB`) - High-intensity white for text
- **Stellar Gold** (`#F59E0B`) - Golden starlight accents

#### CSS Variables
```css
--background: 222 47% 4%;           /* The Void */
--foreground: 210 40% 98%;         /* Supernova white */
--primary: 160 84% 39%;            /* Nebula Emerald */
--secondary: 262 83% 58%;          /* Neural Violet */
--glass-background: rgba(2, 4, 8, 0.7);
--glass-border: rgba(255, 255, 255, 0.08);
--neural-glow: 0 0 20px rgba(16, 185, 129, 0.2);
--card-bg: rgba(2, 4, 8, 0.6);
```

### Visual Effects

#### Glassmorphism
- **Class**: `.aeterna-glass`
- **Effect**: Backdrop blur with translucent surfaces
- **Properties**:
  - `backdrop-blur-xl`
  - Semi-transparent background (`rgba(2, 4, 8, 0.7)`)
  - Subtle border (`rgba(255, 255, 255, 0.08)`)
  - Deep shadow (`0 8px 32px 0 rgba(0, 0, 0, 0.8)`)

#### Neural Glow
- **Class**: `.neural-glow`
- **Effect**: Subtle emerald glow around AI-related elements
- **Use Cases**: AI agent indicators, system IQ, cognitive feed items

#### Parallax Background
- **Component**: `AeternaBackground`
- **Features**:
  - Animated particle field (emerald particles)
  - Radial gradient overlays
  - Atmospheric vignette
  - Parallax nebula layers
- **Performance**: Canvas-based animation, optimized particle count

### Typography

- **Headings**: Bold, high contrast
- **Body**: Clean, readable
- **Code/Data**: Monospace for technical data
- **AI Narratives**: Slightly italicized for distinction

### Component Styling

#### Cards
- Glassmorphism effect (`.aeterna-glass`)
- Rounded corners (`border-radius: 0.75rem`)
- Neural glow on hover for interactive cards
- Deep shadows for depth

#### Buttons
- Primary: Nebula Emerald with glow
- Secondary: Neural Violet
- Hover: Enhanced glow effect
- Active: Pulsing animation

#### Input Fields
- Glassmorphism background
- Subtle border glow on focus
- Emerald accent for active state

---

## Clinical Legacy Skin

### Visual Identity

**Theme**: High-density medical interface  
**Aesthetic**: Clean, efficient, information-dense  
**Inspiration**: Medical records systems, clinical dashboards, EMR interfaces

### Color Palette

#### Primary Colors
- **Lab White** (`#F9FAFB` / `hsl(210, 40%, 98%)`) - Clean background
- **Physician Blue** (`#3B82F6` / `hsl(221, 83%, 53%)`) - Primary actions
- **High Contrast Text** (`#1E293B` / `hsl(222, 47%, 4%)`) - Maximum readability
- **Neutral Grays** - For secondary elements

#### CSS Variables
```css
--background: 210 40% 98%;         /* Lab White */
--foreground: 222 47% 4%;          /* High Contrast Text */
--primary: 221 83% 53%;            /* Physician Blue */
--secondary: 215 20% 65%;
--glass-background: #ffffff;
--glass-border: #e2e8f0;
--neural-glow: none;
--card-bg: #ffffff;
--radius: 0.25rem;                 /* Efficient sharp corners */
```

### Visual Effects

#### Minimal Effects
- **No glassmorphism** - Solid backgrounds for clarity
- **No neural glow** - Clean, professional appearance
- **Sharp corners** - Efficient, space-saving design
- **High contrast** - Maximum readability

### Typography

- **Headings**: Bold, clear hierarchy
- **Body**: Standard medical font sizes
- **Data**: Monospace for numerical data
- **Dense spacing** - Maximum information density

### Component Styling

#### Cards
- Solid white background
- Subtle border (`#e2e8f0`)
- Minimal shadow
- Sharp corners (`0.25rem`)

#### Buttons
- Primary: Physician Blue
- Clean, flat design
- No glow effects
- Clear hover states

#### Input Fields
- White background
- Clear borders
- Blue focus ring
- Standard medical form styling

---

## Adaptive Skinning System

### Implementation

**Provider**: `SkinProvider` component  
**Hook**: `useSkin()` hook  
**Storage**: LocalStorage persistence  
**Toggle**: Header button to switch skins

### Skin-Specific Utilities

#### Visibility Classes
- `.aeterna-only` - Visible only in Aeterna skin
- `.legacy-only` - Visible only in Legacy skin

#### Conditional Rendering
```tsx
const { skin } = useSkin()
{skin === "aeterna" && <AeternaBackground />}
```

### Design Tokens

Both skins share the same design tokens but with different values:

| Token | Aeterna | Legacy |
|-------|---------|--------|
| Background | Dark void | Lab white |
| Primary | Emerald | Blue |
| Border Radius | 0.75rem | 0.25rem |
| Glass Effect | Yes | No |
| Neural Glow | Yes | No |
| Shadow Depth | Deep | Minimal |

---

## Medical-Specific Design Elements

### Status Colors

**Success**: `hsl(142, 76%, 36%)` - Green  
**Warning**: `hsl(38, 92%, 50%)` - Yellow/Amber  
**Error**: `hsl(0, 84%, 60%)` - Red  
**Info**: `hsl(199, 89%, 48%)` - Blue

### Medical Card Component

```css
.medical-card {
  @apply bg-card text-card-foreground rounded-lg border shadow-sm;
}
```

### Status Classes

- `.status-success` - Green text
- `.status-warning` - Yellow text
- `.status-error` - Red text
- `.status-info` - Blue text

---

## Component Library

### Base Components (shadcn/ui)

All components from shadcn/ui are used as the foundation:
- Button
- Card
- Input
- Select
- Dialog
- Badge
- Tabs
- etc.

### Custom Aeterna Components

#### AeternaBackground
- Parallax particle animation
- Nebula gradient layers
- Atmospheric effects
- Only visible in Aeterna skin

#### CognitiveCard
- Displays AI decision narratives
- Neural glow effect
- Glassmorphism styling
- Real-time updates

#### WorkflowArchitect
- 3D node-graph visualization
- Interactive workflow builder
- Neural pathway styling

#### AgentAvatar
- AI agent visual representation
- Neural glow indicator
- Status animations

---

## Layout System

### Grid System

**Mobile** (< 768px):
- Single column layouts
- Stacked components
- Touch-friendly targets (min 44x44px)

**Tablet** (768px - 1024px):
- 2-column grids where appropriate
- Collapsible sidebar
- Optimized spacing

**Desktop** (> 1024px):
- Multi-column grids (3-4 columns)
- Full sidebar visible
- Maximum information density

### Spacing Scale

- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)

---

## Animation & Motion

### Aeterna Animations

- **Pulse**: Slow, breathing effect for AI indicators
- **Glow**: Pulsing neural glow
- **Particle Movement**: Smooth particle animation
- **Fade In**: Subtle entrance animations

### Legacy Animations

- **Minimal**: Only essential transitions
- **Fast**: Quick, efficient animations
- **No decorative effects**: Focus on functionality

### Framer Motion

Used for:
- Page transitions
- Component entrances
- Interactive feedback
- Workflow visualizations

---

## Accessibility

### WCAG 2.1 AA Compliance

- **Color Contrast**: Minimum 4.5:1 for text
- **Focus Indicators**: Visible on all interactive elements
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Touch Targets**: Minimum 44x44px on mobile

### Aeterna-Specific Considerations

- Neural glow effects are decorative only (not required for understanding)
- Glassmorphism maintains sufficient contrast
- Particle animations are subtle and don't interfere

---

## Icon System

### Lucide React Icons

Primary icon library used throughout:
- Medical icons (Pill, Users, Stethoscope)
- System icons (Zap, Brain, Activity)
- Navigation icons (ChevronRight, ArrowRight)

### Custom Icons

- AI Agent avatars
- System IQ indicator
- Neural pathway indicators

---

## Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1400px

### Mobile Optimizations

- Touch-friendly button sizes (min 44x44px)
- Optimized text sizing
- Prevented text selection on buttons
- Improved tap highlight colors

---

## Art Direction

### Aeterna OS Vision

**Concept**: A futuristic medical command center where AI agents operate as a neural network, making autonomous decisions in a cinematic, space-age environment.

**Visual Language**:
- Dark, deep space backgrounds
- Emerald and violet neural pathways
- Glassmorphism for depth
- Particle effects for atmosphere
- Glowing indicators for AI activity

**Narrative Elements**:
- "The Bridge" - Main dashboard
- "Neural Analytics Hub" - Analytics center
- "Cognitive Feed" - AI decision stream
- "System IQ" - Overall intelligence metric
- "Vanguard" - Compliance guardian
- "Nexus" - Core orchestrator

### Clinical Legacy Vision

**Concept**: A high-density, efficient medical interface optimized for clinical workflows and information density.

**Visual Language**:
- Clean, white backgrounds
- High contrast for readability
- Sharp, efficient corners
- Minimal decorative elements
- Maximum information density

---

## Implementation Guidelines

### When to Use Aeterna Skin

- Default for new installations
- Preferred for demonstrations
- Suitable for AI-focused workflows
- Good for visual presentations

### When to Use Legacy Skin

- High-volume clinical workflows
- Users preferring efficiency over aesthetics
- Low-light environments (optional)
- Maximum information density needs

### Skin Toggle

- Located in header (top-right)
- Persists user preference
- Applies immediately
- No page reload required

---

## Design Tokens Reference

### Colors (Aeterna)
```typescript
aeterna: {
  void: "#020408",        // Deep space
  nebula: "#10B981",      // Emerald
  supernova: "#F9FAFB",   // White
  stellar: "#F59E0B",     // Gold
  neural: "#8B5CF6",      // Violet
  acrylic: "rgba(255, 255, 255, 0.03)"
}
```

### Colors (Medical)
```typescript
medical: {
  success: "hsl(142, 76%, 36%)",
  warning: "hsl(38, 92%, 50%)",
  error: "hsl(0, 84%, 60%)",
  info: "hsl(199, 89%, 48%)"
}
```

### Border Radius
- **Aeterna**: `0.75rem` (12px) - Rounded, organic
- **Legacy**: `0.25rem` (4px) - Sharp, efficient

---

## Component Usage Examples

### Aeterna Glass Card
```tsx
<Card className="aeterna-glass neural-glow">
  {/* Content */}
</Card>
```

### Legacy Card
```tsx
<Card className="legacy-only">
  {/* Content */}
</Card>
```

### Skin-Specific Content
```tsx
<div className="aeterna-only">
  <AeternaBackground />
</div>
```

---

## Future Enhancements

### Planned Visual Features
- [ ] 3D workflow visualization enhancements
- [ ] Advanced particle effects
- [ ] Custom medical icon set
- [ ] Enhanced parallax effects
- [ ] More skin options (future)

### Design System Expansion
- [ ] Component style guide
- [ ] Design token documentation
- [ ] Animation library
- [ ] Icon library expansion

---

## Current Status & Maintenance (January 17, 2026)

### 🚨 Known Issue: Background Obscuration
During recent refactors, a solid `bg-background` class was applied to the main dashboard container in `src/app/(dashboard)/layout.tsx`. Because `bg-background` is opaque, it can obscure the `AeternaBackground` component (z-index: -20) and the "Neural Aurora" blur effects (z-index: -10).

**Resolution**:
- Ensure the main dashboard wrapper is transparent or uses a translucent background.
- Verify `AeternaBackground` is rendering (requires `Aeterna` skin to be active).

### 🛠️ Verification Checklist
When making UI changes, verify that the skin engine is still functional:
1. Toggle skin in Header (Aeterna/Legacy).
2. Check for `data-skin` attribute on `<html>`.
3. Verify CSS variables are correctly scoped in `globals.css`.
4. Ensure `aeterna-only` and `legacy-only` utility classes are working.

---

## References

- **Design System File**: `src/app/globals.css`
- **Skin Provider**: `src/components/theme/skin-provider.tsx`
- **Background Component**: `src/components/ui/aeterna-background.tsx`
- **Tailwind Config**: `tailwind.config.ts`
- **SRS Reference**: `docs/SRS.md` (Section 1.2 - Adaptive Skinning Engine)

---

**Last Updated**: January 17, 2026  
**Design System Version**: 2.1
