# GEMINI.md

## Active Skill: UI/UX Pro Max

The **UI/UX Pro Max** design intelligence skill (`v2.13.0`) is installed in this repository.

### Skill Location
- Skill definition and databases: `.gemini/skills/ui-ux-pro-max/` and `.agents/skills/ui-ux-pro-max/`
- Associated sub-skills: `banner-design`, `brand`, `design`, `design-system`, `slides`, `ui-styling`, `ui-ux-pro-max`

### CLI Search Engine
Query the design intelligence database using Python 3:

```bash
python3 .gemini/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain> [-n <max_results>]
```

#### Available Domains:
- `product`: Product type recommendations (SaaS, civic portal, dashboard, e-commerce)
- `style`: 79 UI styles with CSS keywords and design rationale
- `color`: 192 color palettes categorized by product type and mood
- `typography`: 74 font pairings with Google Fonts imports
- `chart`: 25 chart types and visualization best practices
- `ux`: 119 UX guidelines, heuristics, and anti-pattern warnings
- `landing`: Page layouts, hero sections, and CTA strategies
- `icons`: Icon recommendations (Lucide, Phosphor, Heroicons)
- `react`: React & Next.js UI performance and component patterns
- `gsap`: Motion intensity presets and animation curves

#### Design System Generation:
```bash
python3 .gemini/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --variance <1-10> --motion <1-10> --density <1-10>
```

#### Stack-Specific Best Practices:
```bash
python3 .gemini/skills/ui-ux-pro-max/scripts/search.py "<query>" --stack react
```
