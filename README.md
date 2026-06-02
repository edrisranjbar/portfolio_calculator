# Portfolio Calculator

A minimal, client-side investment calculator for tracking monthly contributions with compound interest. No frameworks, no build step — just HTML, CSS, and JavaScript.

## Features

- **Compound interest calculator** — monthly contributions compounded at a configurable annual rate
- **Growth curve** — line chart of total portfolio value vs. contributions over time, with a yearly breakdown table
- **Breakdown view** — donut chart showing principal vs. interest split, plus a bar chart of monthly interest earned over time
- **Auto-save** — inputs are persisted to `localStorage` and restored on next visit
- **Dark mode** — respects `prefers-color-scheme` automatically

## Getting Started

No installation or build required. Clone the repo and open `index.html` in a browser:

```bash
git clone https://github.com/YOUR_USERNAME/portfolio-calculator.git
cd portfolio-calculator
open index.html
```

> An internet connection is required to load Chart.js from CDN. To run fully offline, download [chart.umd.js](https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js), place it in `assets/`, and update the `<script>` tag in `index.html` accordingly.

## Project Structure

```
portfolio/
├── index.html        # Markup and layout
└── assets/
    ├── style.css     # All styles and CSS variables (light + dark)
    └── script.js     # Calculator logic, chart rendering, localStorage
```

## Inputs

| Field | Description | Default |
|---|---|---|
| Monthly | Amount invested each month | $500 |
| Annual return | Expected yearly return rate | 7% |
| Period | Investment duration in months | 120 (10 yrs) |
| Initial deposit | One-time starting amount | $1,000 |

## Hosting on GitHub Pages

1. Push the repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **Branch: main**, folder **/ (root)**
4. Save — your app will be live at `https://YOUR_USERNAME.github.io/portfolio-calculator`

## License

MIT
