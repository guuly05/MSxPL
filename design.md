# Design: Turning Point Finder

The locked app system. Shared by the workspace and its information routes.

## System
- Genre: modern-minimal
- Shape of the first screen: analyst app screen
- Theme: existing project brand, preserved from the source palette and mark
- Axes: cool tinted paper / Segoe UI / deep plum · posture: dense review desk

## Tokens
`src/tokens.css` is the source of truth. The original project purple, lime and neutral palette anchor the system; deeper related tones carry text and chart states.

## Controls
- Primary: deep plum fill · 3px radius · 40px minimum height
- Secondary: transparent with a rule · 3px radius · same hit area
- All links, buttons, replay controls and fixture selectors keep a visible focus ring and a 44px hit target.

## Motion
- Character: still, with brief color feedback on hover and press
- Reduced motion ends transitions and disables smooth scrolling.

## Exports
`src/tokens.css` in this project.