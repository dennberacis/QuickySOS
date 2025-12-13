# QuickySOS - System Manual & Documentation

**Version:** 1.0.0
**Date:** 2024
**Tech Stack:** React, TypeScript, Vite, Google Gemini API, Leaflet Maps, Tailwind CSS

---

## 1. Executive Summary

**QuickySOS** is a Progressive Web Application (PWA) designed for personal safety. It provides immediate access to emergency alerts, real-time location tracking, and AI-powered safety guidance. The application is built with a "Stealth First" approach, allowing users to trigger alerts discreetly via gestures on a simulated black screen.

---

## 2. Feature Specification

### 2.1 One-Tap SOS
*   **Behavior:** A large, pulsating button triggers the alert sequence immediately.
*   **Actions:** 
    *   Activates a loud, high-frequency siren.
    *   Flashes the screen red (visual beacon).
    *   Fetches context-aware advice from Gemini AI.
    *   Simulates notifying contacts (UI feedback).

### 2.2 Stealth Mode (Black Screen)
*   **Purpose:** Allows the user to keep the app active without drawing attention.
*   **Appearance:** Completely black screen with very faint instructions.
*   **Triggers:**
    *   **Shake:** Utilizing the device accelerometer (requires permission).
    *   **Gestures:** Drawing specific shapes ('S', 'Z', 'Circle') on the touchscreen.
    *   **10-Tap:** Tapping the screen 10 times rapidly triggers SOS.
*   **Wake Lock:** Attempts to keep the screen from sleeping while in this mode.

### 2.3 AI Safety Advice (Gemini 2.5)
*   **Model:** `gemini-2.5-flash`
*   **Input:** Emergency Type (Medical, Violence, Fire, etc.) + Geolocation.
*   **Output:** 3 concise steps + 1 critical safety tip.
*   **Fallback:** If offline or API fails, hardcoded expert advice is displayed.

### 2.4 Live Radar Map
*   **Library:** Leaflet.js with CartoDB Dark Matter tiles.
*   **Function:** Displays user location and simulated nearby incidents.
*   **Visuals:** Custom CSS-styled markers with pulsing effects.

---

## 3. Technical Architecture

### 3.1 Project Structure
The project follows a flat, modular structure typical of Vite React apps.

| Path | Description |
| :--- | :--- |
| `/` | Root configuration files (`vite.config.ts`, `package.json`, `.env`). |
| `/index.html` | Entry point. Loads CSS, Maps, and React root. |
| `/App.tsx` | **Main Controller.** Manages global state (SOS status, location). |
| `/services/geminiService.ts` | **AI Layer.** Handles API calls to Google Gemini. |
| `/components/StealthOverlay.tsx` | **Gesture Engine.** Handles touch canvas logic for gesture detection. |
| `/components/GestureManager.tsx` | **Sensor Engine.** Handles `devicemotion` and `WakeLock`. |
| `/components/LiveMap.tsx` | **Map Engine.** Wrapper around Leaflet.js. |

### 3.2 State Management
State is handled via React `useState` and `useRef` hooks in `App.tsx`.
*   `isSOSActive`: Boolean flag for alarm state.
*   `stealthMode`: Boolean flag for overlay rendering.
*   `contacts`: Array of contact objects stored in memory (can be extended to `localStorage`).

### 3.3 Audio System
Uses the Web Audio API for generating the siren sound to ensure it works even if media files fail to load.
*   **Oscillator:** Sawtooth wave for harshness.
*   **LFO:** Modulates frequency to create a "Yelp" siren pattern.

---

## 4. Setup & Deployment Guide

### 4.1 Environment Variables
The application requires a Google Cloud API Key for Gemini.
*   File: `.env`
*   Variable: `API_KEY`

### 4.2 Installation
```bash
# 1. Install Dependencies
npm install

# 2. Run Local Server
npm run dev
```

### 4.3 Building for Production
```bash
# Creates /dist folder optimized for static hosting
npm run build
```

### 4.4 Deployment (Vercel)
1.  Import repository to Vercel.
2.  Framework Preset: **Vite**.
3.  Add Environment Variable `API_KEY`.
4.  Deploy.

---

## 5. Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **Map not loading** | Check internet connection. Leaflet requires online access to fetch tiles. |
| **Shake not working (iOS)** | iOS requires a button click to grant Motion permissions. Click the "Enable Shake" button in Settings or top right. |
| **AI Advice is generic** | Check if `API_KEY` is set correctly in `.env` or Vercel dashboard. If quota is exceeded, fallback advice is used. |
| **Audio not playing** | Browsers block auto-play. User must interact with the page (click anywhere) at least once before audio can play. |

---

**Contact Support:** Admin / Developer Team
