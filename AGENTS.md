# AGENTS.md

## Active Skill: UI/UX Pro Max

The **UI/UX Pro Max** design intelligence skill (`v2.13.0`) is installed in this repository.

### Skill Location
- Skill definition and databases: `.agents/skills/ui-ux-pro-max/`
- Sub-skills:
  - `banner-design` (`.agents/skills/banner-design/`)
  - `brand` (`.agents/skills/brand/`)
  - `design` (`.agents/skills/design/`)
  - `design-system` (`.agents/skills/design-system/`)
  - `slides` (`.agents/skills/slides/`)
  - `ui-styling` (`.agents/skills/ui-styling/`)
  - `ui-ux-pro-max` (`.agents/skills/ui-ux-pro-max/`)

### CLI Search Engine
Query the design intelligence database using Python 3:

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain> [-n <max_results>]
```

#### Available Domains:
- `product`: Product type recommendations (SaaS, e-commerce, portfolio, civic dashboard)
- `style`: 79 UI styles (minimalism, brutalism, bento grid, neo-brutalism) with CSS keywords
- `color`: 192 color palettes categorized by product type and domain
- `typography`: 74 font pairings with Google Fonts imports and hierarchy rules
- `chart`: 25 chart types and best-practice visualizers (recharts, d3)
- `ux`: 119 UX guidelines, heuristics, and anti-pattern warnings
- `landing`: Page structure patterns and CTA hierarchy
- `icons`: Icon recommendations (Lucide, Phosphor, Heroicons)
- `react`: React & Next.js UI performance and state patterns
- `gsap`: Motion intensity presets and animation curves

#### Design System Generation:
```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --variance <1-10> --motion <1-10> --density <1-10>
```

#### Stack-Specific Best Practices:
```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --stack react
```
*(Stacks: `react`, `html-tailwind`, `nextjs`, `shadcn`, `vue`, `svelte`, etc.)*
