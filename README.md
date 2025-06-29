# Data Alchemist

A smart AI-powered dashboard to upload, validate, edit, and export data for **clients**, **workers**, and **tasks**. It includes:

- Inline editing with validation and AI error correction
- AI rule creation from natural language
- Rule builder and prioritization panel
- Export functionality (CSV + JSON bundle)
- Natural language filtering and future modification capabilities

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/data-alchemist.git
cd data-alchemist
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Gemini API key

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_google_generative_ai_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the dashboard.

---

## Features

### Data Upload + Inline Editing

- Upload `.csv` or `.xlsx` files
- Edit directly in the table
- Real-time validation and error highlighting

### AI Fix Suggestions

- Get suggestions for invalid cells using Gemini AI
- One-click apply for fixes

### Rule Builder

- Add rules like `coRun`, `slotRestriction`, `loadLimit`, `phaseWindow`
- Rules are stored in JSON format and downloadable

### Prioritization Panel

- Adjust weights for fairness, fulfillment, workload, etc.
- Export prioritization settings as JSON

### Natural Language Rule Creator _(beta)_

- Convert English sentences to structured rules using Gemini

### Export Bundle

- Export validated data (clients, workers, tasks) as `.csv`
- Export `rules.json` and `prioritization.json`
- All included in a `.zip` package

---

## Technologies Used

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Gemini API (via @google/generative-ai)
- Papaparse, XLSX, FileSaver

---

> Built with to simplify resource planning workflows
