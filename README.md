# Electric Ball Network

A creative coding experiment that visualises multiple browser windows as glowing electric nodes in a shared animated network.

## 💡 How It Works

Each time you open the `index.html` file in a new browser window, it creates a glowing ball on a shared canvas. The windows communicate with each other using the `BroadcastChannel` API. Nodes are connected with animated electric lines, and shockwave pulses appear when nodes collide.

## 🛠️ Tech Stack

- HTML5 Canvas
- Vanilla JavaScript
- `BroadcastChannel` API
- High-DPI rendering
- No external libraries

## 🚀 Usage

1. Clone or download the project.
2. Open `index.html` in your browser.
3. Open it again in a new **separate window** (not tab).
4. Each window will render itself and other peers as glowing connected nodes.

## 📁 Files

- `index.html` – Entry point with canvas and badge
- `style.css` – Radial background and UI styles
- `main.js` – All canvas drawing, sync, and animation logic

## 📷 Preview

<img width="2552" height="1430" alt="ElectricBallNetwork" src="https://github.com/user-attachments/assets/c21169b7-8b6c-4697-aff5-fad3e4e8db55" />
