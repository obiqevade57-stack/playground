# ⚡ Playground

> Fun interactive tools — typing speed test, pomodoro timer, and color palette generator. Built with Next.js + Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🎮 Features

### ⌨️ Typing Speed Test
- Random paragraphs from diverse topics
- Real-time character highlighting (correct ✅ / wrong ❌ / untyped ⬜)
- Live WPM (words per minute) and accuracy stats
- Final results card with detailed breakdown
- 🏆 Personal best tracking via localStorage

### 🍅 Pomodoro Timer
- 3 modes: Focus (25min), Short Break (5min), Long Break (15min)
- Large SVG circular progress ring
- Auto-cycle: 4 focus sessions → long break
- Web Audio API beep notification
- Daily stats: sessions completed, total focus minutes
- 🔥 Streak counter (consecutive days)

### 🎨 Color Palette Generator
- 5 harmony modes: Analogous, Complementary, Triadic, Split-Complementary, Monochromatic
- Click-to-copy hex codes with toast notification
- Lock individual colors across regenerations 🔒
- Pure JS color math — no external libraries
- History of last 5 palettes
- Random base color generation

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
# Clone the repo
git clone https://github.com/obiqevade57-stack/playground.git
cd playground

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
playground/
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles & CSS variables
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main page with tab navigation
│   └── components/
│       ├── TypingTest.tsx    # ⌨️ Typing speed test
│       ├── PomodoroTimer.tsx # 🍅 Pomodoro timer
│       └── ColorPalette.tsx  # 🎨 Color palette generator
├── public/                   # Static assets
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json
```

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State:** React hooks + localStorage
- **Audio:** Web Audio API (no external files)
- **Color Math:** Pure JavaScript (no libraries)

---

## 📄 License

MIT © [Alifanethotspot](https://github.com/Alifanethotspot)

---

<div align="center">
  <sub>Built with ⚡ by <a href="https://github.com/obiqevade57-stack">obiqevade57-stack</a></sub>
</div>
