# DebtPath: Payoff Planner — iOS tester instructions

Share this doc (or a PDF export) with people helping you test on **iPhone** only. **You** (the host) run the dev server; testers use **Expo Go** on their iPhone (QR code) or you use the **iOS Simulator** on your Mac.

---

## Part A — What testers install (iPhone + QR)

1. Install **[Expo Go](https://apps.apple.com/app/expo-go/id982107779)** from the App Store.
2. Open the **Camera** app and scan the QR code the host shows (or open the link from Messages if the host shares it).
3. Tap the banner to open in **Expo Go**.
4. **First open:** if iOS asks about **Local Network**, allow it when the host is on the same Wi‑Fi.

### If the QR code does not load

- Confirm iPhone and host Mac are on the **same Wi‑Fi**, **or** ask the host to restart with **tunnel mode** (see Part C).
- Try toggling **VPN** off on the iPhone.
- **Settings → Expo Go** → ensure **Local Network** is on.

---

## Part B — iOS Simulator (host: Mac only)

The iOS Simulator runs on **your Mac** (Xcode). Testers can also watch via screen share.

1. Install **Xcode** from the Mac App Store (large download).
2. Open Xcode once → accept the license → **Xcode → Settings → Locations → Command Line Tools** → select your Xcode.
3. In Terminal, from the project folder:

   ```bash
   npm install
   npx expo start
   ```

4. Press **`i`** in the terminal to open **iOS Simulator** (first launch may take a minute).

---

## Part C — Host: start the dev server and show the QR code

Run from the **project root** (folder that contains `package.json`):

```bash
npm install
npx expo start
```

You should see:

- A **QR code** in the terminal, and/or  
- A **browser tab** (Expo Dev Tools) with another QR code.

### Same Wi‑Fi (fastest for nearby testers)

- Default **LAN** mode works when the iPhone and your Mac share the same network.
- Testers scan the QR with the **Camera** app → open in **Expo Go**.

### Remote testers (different Wi‑Fi / city)

Use **tunnel** so the iPhone does not need your LAN:

```bash
npx expo start --tunnel
```

First run may prompt to install **`@expo/ngrok`** — accept. Tunnel is slower but works through most firewalls.

### Your own QR image to paste in Notion/email

The QR encodes a URL starting with **`exp://`**. After `npx expo start`, copy that URL from the terminal or Dev Tools, then generate a QR, for example:

- [https://www.qr-code-generator.com/](https://www.qr-code-generator.com/) — paste the **`exp://...`** link → download PNG.

**Note:** Tunnel URLs change each session unless you use a fixed Expo account workflow; regenerate the PNG when you restart with a new URL.

---

## Part D — Optional feedback checklist (iOS)

Copy/paste into a message or form:

1. Device: **iPhone model** & **iOS version** (Settings → General → About).  
2. Could you complete onboarding and add at least one debt? (Yes / No — what blocked you?)  
3. Any confusing labels, errors, or missing buttons?  
4. Plan tab: logging a payment — clear? (Yes / No)  
5. Anything that felt slow, broken, or “not like a real app”?  
6. One thing you’d improve first.

---

## Quick reference — project scripts

| Goal | Command |
|------|--------|
| Dev server + QR (LAN) | `npx expo start` |
| Remote iPhone testers | `npx expo start --tunnel` |
| Open iOS Simulator from CLI | `npx expo start` then press **`i`** |
| Repo shortcut | `npm run expo:tunnel` |

**App name:** DebtPath: Payoff Planner (Expo Go shows the project name from `app.json` while in development).

---

## Requirements

- **Mac** with **Xcode** (for Simulator and recommended for hosting the dev server).  
- **Node.js** LTS (e.g. 20.x): [https://nodejs.org/](https://nodejs.org/)  
- **Expo SDK 54** in this repo — keep **Expo Go** on the iPhone updated from the App Store.

If something fails, capture a **screenshot** of the red error screen or terminal output and send it to the host.
