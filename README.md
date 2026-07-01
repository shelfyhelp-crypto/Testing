# 🏪 ShelfGuard — F&B Multi-Store Expiry Tracker

A React app for F&B businesses to track expiry dates across multiple stores — for food items, chemicals, documents, beverages, and equipment certificates.

---

## ✨ Features

- **Multi-store support** — each store manager sees only their store
- **Super Admin view** — see all stores, all items, cross-store analytics
- **Expiry alerts** — 🔔 bell notifications for items expiring within 30 days
- **Color-coded urgency rings** — visual countdown per item
- **Category filtering** — Food, Chemical, Document, Beverage, Equipment Certificate
- **Add / Edit / Delete items** — full CRUD per store

---

## 🔐 Demo Credentials

| Role | Username | Password | Store |
|------|----------|----------|-------|
| Store User | `alice` | `alice123` | FreshMart Downtown |
| Store User | `carlos` | `carlos123` | QuickBite Airport |
| Store User | `priya` | `priya123` | GreenTable Eastside |
| **Super Admin** | `admin` | `admin2024` | All Stores |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### 1. Clone the repo
```bash
git clone https://github.com/shelfyhelp-crypto/Testing.git
cd Testing
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for production
```bash
npm run build
```
Output goes to the `dist/` folder.

---

## ☁️ Deploy to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Select the `shelfyhelp-crypto/Testing` repo
4. Leave all settings as default — Vercel auto-detects Vite
5. Click **Deploy** ✅

Your app will be live at a URL like `https://testing-xxxx.vercel.app`

---

## 📁 Project Structure

```
Testing/
├── index.html              # HTML entry point
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite bundler config
├── .gitignore
├── src/
│   ├── main.tsx            # React root mount
│   ├── index.css           # Global styles
│   └── App.tsx             # Main app (rename from fnb-expiry-tracker.tsx)
└── README.md
```

---

## 🛠 Tech Stack

- **React 18** + **TypeScript**
- **Vite** (bundler)
- **No external UI libraries** — pure inline styles for portability

---

## 📌 Roadmap

- [ ] Real database (Supabase / Firebase)
- [ ] Email/SMS notifications via cron job
- [ ] CSV export for audit reports
- [ ] Mobile app (React Native)
