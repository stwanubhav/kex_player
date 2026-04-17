# 🎬 KEX Player – Next-Gen Video Experience

A modern, responsive, and feature-rich custom HTML5 video player with advanced controls, sleek UI, and smooth user experience.

---

## 🚀 Features

- ▶️ Custom Play/Pause Controls  
- ⏱️ Real-time Progress Bar & Seek  
- 🔊 Volume Control with Mute Toggle  
- ⚡ Playback Speed Options (0.5x – 2x)  
- 🎛️ Quality Selector (Auto / 720p / 480p)  
- 📺 Fullscreen Support (Cross-browser)  
- 🎯 Keyboard Shortcuts Support  
- 📱 Fully Responsive (Mobile + Desktop)  
- 🎨 Modern UI with Glassmorphism Design  
- ⏳ Loading Spinner Indicator  
- 🚫 Disable Right Click & Download Protection  

---

## 📁 Project Structure

```

KEX-Player/
│── player.html   # Main video player file
│── README.md     # Project documentation

````

---

## ⚙️ How It Works

### 🎥 Video Playback
- Uses native `<video>` element  
- Custom UI replaces default browser controls  

### 🎛️ Quality Switching
- UI-based quality selector  
- Currently simulated (can be upgraded to HLS/DASH)  
- Easily extendable with multiple video sources  

### 📊 Progress Bar
- Updates in real-time using `timeupdate`  
- Click or drag to seek  

### 🔄 Controls Behavior
- Auto-hide controls when inactive  
- Smooth animations on hover/touch  

---

## 🧠 Technologies Used

- HTML5  
- CSS3 (Advanced UI + Animations)  
- Vanilla JavaScript  
- Font Awesome Icons  

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space / K | Play / Pause |
| M | Mute |
| F | Fullscreen |
| ← / → | Seek -5s / +5s |
| ↑ / ↓ | Volume Up / Down |

---

## 📦 Setup & Usage

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/kex-player.git
````

2. Open the file:

   ```bash
   player.html
   ```

3. Done ✅ — No installation required

---

## 🔥 Future Improvements

* Real HLS (.m3u8) streaming support
* Multiple quality source switching
* Subtitle support
* Audio track selection
* Streaming integration

---

## ⚠️ Notes

* Quality switching is currently simulated
* For real quality switching, integrate:

  * HLS.js
  * Multiple video sources

---

## 📜 License

This project is open-source and free to use.

---

## ❤️ Credits

Developed by stwanubhav
