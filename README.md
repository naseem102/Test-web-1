# Velora — Creative Digital Experiences

Cinematic scroll-driven WebGL studio site (test reel).

Inspired by high-end Awwwards-style digital-experience agencies: particle fields, infinity loop, holographic project cards, glass lab specimen, and smooth chapter navigation.

## Preview

Open `index.html` with a local static server (recommended):

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then visit the URL shown (usually `http://localhost:3000` or `http://localhost:8080`).

> Direct `file://` open may block the CDN script in some browsers. Use a small server.

## Controls

| Action | Result |
|--------|--------|
| **Scroll** | Drive the reel (intro → studio → work → lab → contact) |
| **Work / Contact** | Jump to chapters |
| **Right rail** | Jump to Intro / Studio / Work / Lab / Contact |
| **Filters** | Websites, Installations, XR, Metaverse, Games |
| **Open the case** | Case-study panel |
| **Click a glass card** | Same case panel |
| **Arrow keys** | Page through the reel |
| **Esc** | Close case panel |

## Stack

- Single `index.html` (no build step)
- [Three.js](https://threejs.org/) r186 (CDN)
- Custom GLSL particles + holographic card shaders
- Pure CSS UI overlay

## GitHub Pages

Settings → Pages → Deploy from branch `main` / root. Site will be live at:

`https://naseem102.github.io/Test-web-1/`
