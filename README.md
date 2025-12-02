# Test Your Viral Sense

A minimalist quiz app where users guess which short-form video hook went viral based on the first frame.

## Setup

### 1. Add your images

Create two folders in the project root:

```
winners/
  w1.png
  w2.png
  ...
  w16.png

losers/
  l1.png
  l2.png
  ...
  l16.png
```

Images should be iPhone 15 resolution (1179 × 2556 or similar 9:16 aspect ratio).

### 2. Update view counts

Edit `data.json` with the actual view counts for each video:

```json
{
  "winners": {
    "w1": 1500000,
    "w2": 2300000,
    ...
  },
  "losers": {
    "l1": 45000,
    "l2": 32000,
    ...
  }
}
```

### 3. Run locally

Simply open `index.html` in a browser, or use a local server:

```bash
python3 -m http.server 8000
# or
npx serve
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in Vercel
3. Deploy (no build configuration needed)

Vercel will automatically serve `index.html` as the entry point.

## Structure

- `index.html` - Main HTML structure
- `styles.css` - Minimalist dark theme with pink accents
- `app.js` - Quiz logic (pairs generation, scoring, reveal)
- `data.json` - View counts for all 16 pairs
- `winners/` - Viral video images (you provide)
- `losers/` - Non-viral video images (you provide)

## Features

- 16 question pairs with randomized left/right placement
- Bottom-right blur overlay (mimicking Instagram/TikTok view count area)
- View counts revealed after user choice
- Score tracking and final results screen
- Fully responsive, mobile-friendly design
- No backend required - everything runs client-side

