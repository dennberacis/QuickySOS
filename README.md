# QuickySOS - AI Emergency Alert System

QuickySOS is a stealth-focused emergency alert web application designed to help users in dangerous situations (Medical, Violence, Harassment, etc.). It leverages the **Google Gemini API** to provide real-time, context-aware safety advice and uses browser APIs for geolocation and gesture recognition.

## 🚀 Live Demo & Features

### Core Features
1.  **One-Tap SOS:** Large, accessible button to trigger a loud alarm and visual alerts.
2.  **AI Safety Advice:** Uses `gemini-2.5-flash` to generate immediate, situation-specific steps based on the emergency type (e.g., "Fire", "Harassment").
3.  **Stealth Mode:** A black screen overlay that mimics a turned-off phone.
    *   **Gestures:** Draw 'S', 'Z', or 'Circle' on the black screen to trigger SOS silently.
    *   **Shake to Alert:** Shake the device vigorously to trigger the alarm.
4.  **Live Radar Map:** Visualizes the user's location and simulates nearby alerts using `Leaflet` maps.
5.  **Emergency Contacts:** Local storage management of emergency contacts.
6.  **Siren & Flash:** High-frequency audio oscillator and screen flashing for attention.

---

## 📂 Project Structure & Explanation

Here is an explanation of the files in this "Softcopy":

### Root Configuration
*   **`index.html`**: The entry point. Loads Tailwind CSS (styling), Leaflet (maps), and the React app.
*   **`vite.config.ts`**: Configuration for the build tool (Vite). It handles loading environment variables (like the API Key) so they work in the browser.
*   **`tsconfig.json`**: Rules for TypeScript to ensure code quality.
*   **`package.json`**: Lists dependencies (`react`, `@google/genai`, `leaflet`) and build scripts.

### Source Code (`/` root conceptually)
*   **`App.tsx`**: The main controller. It manages the state (is SOS active? is Stealth mode on?) and orchestrates the UI components. It handles the "Loud Siren" logic using the Web Audio API.
*   **`index.tsx`**: Mounts the React application to the DOM.
*   **`types.ts`**: Defines the data structures (e.g., what an `EmergencyType` is, what a `Contact` looks like) to keep code type-safe.

### Components (`/components`)
*   **`StealthOverlay.tsx`**: The "Dark Mode" screen. It listens for touch events to detect drawing gestures (S, Z, Circle) and passes them to the `GestureManager`.
*   **`GestureManager.tsx`**: Handles the device accelerometer. It calculates g-force to detect a "Shake" motion and requests Wake Lock to keep the screen on.
*   **`LiveMap.tsx`**: Renders the dark-themed map using Leaflet.js. It places the user's location and nearby mock alerts on the map.
*   **`MapRadar.tsx`**: A purely visual "Radar" animation used as a fallback or aesthetic element.
*   **`SettingsModal.tsx` & `ContactsModal.tsx`**: UI for managing user preferences and phone numbers.

### Services (`/services`)
*   **`geminiService.ts`**: The bridge to AI.
    *   It calls `ai.models.generateContent` using the `gemini-2.5-flash` model.
    *   It requests a structured JSON response containing `steps` (array) and a `safetyTip`.
    *   Includes fallback advice if the device is offline.

---

## 🛠️ Setup & Installation

### Prerequisites
*   Node.js (v18 or higher)
*   A Google Gemini API Key (Get one at [Google AI Studio](https://aistudio.google.com/))

### Local Development
1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up Environment Variable:**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_google_api_key_here
    ```
3.  **Run the app:**
    ```bash
    npm run dev
    ```
    Open the local URL provided (usually `http://localhost:5173`).

---

## ☁️ Deployment (Vercel)

This app is optimized for Vercel deployment.

1.  **Push code** to a GitHub repository.
2.  **Import project** in Vercel.
3.  **Build Settings** (Vercel usually detects these automatically):
    *   Framework Preset: **Vite**
    *   Build Command: `npm run build`
    *   Output Directory: `dist`
4.  **Environment Variables:**
    *   Go to Project Settings > Environment Variables.
    *   Add `API_KEY` with your actual Gemini API key value.
5.  **Deploy.**

---

## 📱 Mobile Considerations

*   **Permissions:** The app will request `Geolocation` and `Motion Sensors` (for shake detection). On iOS, motion permission requires a specific user interaction (button click), which is handled in `GestureManager.tsx`.
*   **Wake Lock:** The app attempts to keep the screen awake during Stealth Mode.

---

*Built with ❤️ for safety.*
