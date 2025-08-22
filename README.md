# Aesthetic To‑Do (React + Tailwind)

A polished, animated to‑do app with a built‑in Pomodoro timer. Uses React, Tailwind CSS, Framer Motion, and lucide‑react. Tasks persist in `localStorage`, include search/filter/reorder, dark mode, inline editing, and a full Pomodoro cycle (Focus → Short Break; every 4th Focus → Long Break). In Focus mode the large title becomes the active task; time appears as a badge.

## Features

* Add, edit (inline), delete, complete, reorder
* Filters: All / Active / Completed
* Search with **Ctrl/⌘ + K**
* Dark/Light mode toggle
* Pomodoro timer with auto‑switching (25/5/15 by default)
* Active‑task focus mode (Start disabled if no active task)
* Smooth animations (Framer Motion)
* `localStorage` persistence

## Tech stack

* React 18+
* Tailwind CSS 3+
* Framer Motion
* lucide‑react

## Quick start (Vite)

```bash
# 1) Create a React app
npm create vite@latest aesthetic-todo -- --template react
cd aesthetic-todo

# 2) Install deps
npm i framer-motion lucide-react
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure Tailwind:

```js
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
}
```

Create `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Wire CSS in `src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import AestheticTodoApp from './AestheticTodoApp.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AestheticTodoApp />
  </React.StrictMode>
)
```

Add the component from this repo as `src/AestheticTodoApp.jsx`.

Run it:

```bash
npm run dev
```

## Project structure (suggested)

```
src/
  AestheticTodoApp.jsx
  index.css
  main.jsx
index.html
```

## Keyboard shortcuts

* **Enter**: add task
* **Ctrl/⌘ + K**: focus search
* **Enter** while editing: save
* **Esc** while editing: cancel

## Pomodoro behavior

* Focus 25 minutes → Short Break 5 minutes
* Every 4th Focus → Long Break 15 minutes
* After any break → Focus
* Start/Pause controls; Focus requires an **active task**

## Configuration

* Durations live in `getModeDuration(mode)` inside the component.
* Storage keys: `aesthetic-todo-v1` (tasks), `theme` (light/dark).

## Testing

Basic runtime assertions log to the browser console on load. Open DevTools and check for `✅ Dev tests passed`.

## Troubleshooting

* Tailwind styles not applying → verify `tailwind.config.js` `content` paths and that `index.css` is imported once.
* Icons missing → ensure `lucide-react` is installed and imported.
* Timer not starting in Focus → select an **active task** first.

## Attribution

* Icons: [lucide‑react](https://lucide.dev)
* Animations: [Framer Motion](https://www.framer.com/motion/)

## License

