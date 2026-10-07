# LandLens 3-Color System Implementation

## Strict Color Palette

### Primary Colors
- **Deep Royal Navy**: `#1F2A44` - Main backgrounds, headings on beige
- **Warm Beige**: `#E8DCC8` - Card surfaces, body text on navy
- **Soft Gold**: `#C6A75E` - All interactive elements, accents, borders

### Text Contrast Rules

#### On Deep Royal Navy (#1F2A44) Backgrounds:
- Headings: `#FFFFFF` (pure white)
- Body text: `rgba(232, 220, 200, 0.9)` (#E8DCC8 at 90% opacity)
- Muted text: `rgba(232, 220, 200, 0.65)` (#E8DCC8 at 65% opacity)

#### On Warm Beige (#E8DCC8) Backgrounds:
- Headings: `#1F2A44` (Deep Royal Navy)
- Body text: `#2A3655` (rich navy-slate)
- Muted text: `rgba(31, 42, 68, 0.7)` (#1F2A44 at 70% opacity)

#### On Soft Gold (#C6A75E) Buttons:
- Button text: `#1F2A44` (Deep Royal Navy)
- Font weight: `700` (bold)
- Hover state: `#d4b36e` (lighter gold)

### Border & Accent Rules
- All borders use gold: `rgba(198, 167, 94, 0.35)` for subtle, `#C6A75E` for prominent
- Hover states: Add soft gold glow with shadow `shadow-[#C6A75E]/30`
- Focus rings: `ring-[#C6A75E]`

## Implementation Status

### ✅ Completed Components

1. **globals.css**
   - Updated CSS variables for strict text contrast rules
   - Added `--text-on-navy-*` and `--text-on-beige-*` variables
   - Modified button styles to use gold with navy text
   - Updated color governance utilities to map all colors to 3-color system

2. **PremiumLandingPage.tsx**
   - Complete renovation with alternating Navy/Beige sections
   - Navigation: Navy background with white/beige/gold
   - Hero: Navy with white headings, beige body text
   - Project Intro: Beige section with navy headings
   - Features: Navy with beige cards
   - Land Truth Engine: Beige with white cards
   - How It Works: Navy with white text
   - For Citizens/Government: Beige with navy and contrasting cards
   - Technology: Navy with beige cards
   - Trust: Beige with white cards
   - Final CTA: Navy with gold buttons
   - Footer: Beige with navy text
   - All buttons: Gold background, navy text, bold

### 🔄 Needs Update

3. **Login Page** (`src/app/login/page.tsx`)
   - Update background to navy (#1F2A44)
   - Update card surfaces to beige (#E8DCC8)
   - Update all button colors to gold (#C6A75E) with navy text
   - Fix text contrast: white/beige on navy, navy on beige
   - Remove all cyan, random colors

4. **AppShell** (`src/components/AppShell.tsx`)
   - Sidebar background: #1F2A44 (navy)
   - Sidebar text: #E8DCC8 (beige)
   - Active state: Gold background/border
   - Update all accent colors from cyan/indigo to gold
   - Card backgrounds: beige
   - Fix all text contrast

5. **Dashboard Page** (`src/app/dashboard/page.tsx`)
   - Background: Navy
   - Cards: Beige with navy text
   - All indigo/cyan/emerald → Gold
   - Button colors: Gold with navy text
   - Fix KPI card colors

6. **District Admin Page** (`src/app/district-admin/page.tsx`)
   - Same color renovation as dashboard

7. **Citizen Page** (`src/app/citizen/page.tsx`)
   - Background: Navy
   - Cards: Beige
   - All blue/cyan/emerald accents → Gold
   - Button text: Navy on gold

8. **DemoBadge** (`src/components/ui/DemoBadge.tsx`)
   - Background: Beige with gold border
   - Text: Navy

## Testing Checklist

- [ ] Landing page alternates Navy/Beige sections correctly
- [ ] All headings on navy are pure white
- [ ] All body text on navy is warm beige (E8DCC8)
- [ ] All headings on beige are navy (1F2A44)
- [ ] All body text on beige is dark slate (2A3655)
- [ ] All buttons are gold with navy bold text
- [ ] All hover states show gold glow
- [ ] No cyan, indigo, emerald, or random colors remain
- [ ] Borders use gold tones only
- [ ] Cards on navy use beige, cards on beige use white

## Commands to Run

```bash
# Check for color consistency
npm run dev

# View pages:
# - / (landing)
# - /login
# - /dashboard
# - /citizen
# - /district-admin
# - /map
```

## Notes

- The global CSS now has strict color governance that remaps legacy Tailwind classes
- Any `bg-cyan-*`, `bg-indigo-*`, `bg-emerald-*` classes are automatically converted to gold
- Any `text-slate-*` classes adjust based on background context
- Primary buttons ALWAYS use gold background with navy text
- The system maintains accessibility with WCAG-compliant contrast ratios
