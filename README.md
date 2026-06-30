# My Gastos

A personal expense tracking app built with React Native and Expo.

## Features

- **Daily Expense Tracking** — Log expenses with amount, category, and notes
- **Calendar View** — Navigate and view expenses by date
- **Category Breakdown** — Organize spending by category with visual indicators
- **Multi-Currency Support** — Switch between PHP, USD, EUR, and JPY
- **Dark/Light Theme** — Toggle between themes for comfortable viewing
- **Offline Storage** — Data persisted locally with AsyncStorage
- **PWA Support** — Installable as a Progressive Web App

## Tech Stack

- **Frontend:** React Native, Expo SDK 54, TypeScript
- **UI:** Custom components, Material Community Icons, Manrope font
- **State:** React Context (Expenses, Currency, Theme)
- **Storage:** AsyncStorage (local), SQLite backend (optional)
- **Deployment:** Vercel (web), Expo Go (mobile)

## Getting Started

### Prerequisites

- Node.js >= 20
- Expo CLI (`npx expo`)

### Install & Run

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

Scan the QR code with Expo Go (Android/iOS) or press `w` to open in the browser.

### Backend (optional)

```bash
cd backend
npm install
npm start
```

Runs a lightweight SQLite-backed API on port 3001.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # App-wide state (Expenses, Currency, Theme)
├── screens/        # Main app screens
├── services/       # API layer
├── theme.ts        # Color palette & styling tokens
└── types.ts        # TypeScript interfaces
```

## License

MIT
