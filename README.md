# Enersense AI – Intelligent Electricity Consumption Analysis and Energy-Saving Platform

> **"Understand Your Energy. Predict Your Bill. Save More."**  
> **Competition Theme:** Swachh & Sustainable Bharat — Sustainable Technologies and Energy Efficiency.

---

## 1. Project Vision

**Enersense AI** is a full-stack, AI-powered energy awareness platform engineered to help households understand their electricity consumption, estimate and predict utility bills, identify high-consuming appliances, and receive personalized, verifiable recommendations for reducing unnecessary power usage.

The platform combines nine foundational innovations into one accessible, hardware-free system:
1. **Electricity Meter Reading Automation** (OCR-assisted photograph digit recognition with ambiguity resolution and confidence scoring).
2. **Tariff-Aware Bill Estimation** (Deterministic progressive slab calculations for major Indian discoms including MSEDCL, BSES, BESCOM, TANGEDCO, and UPPCL).
3. **Appliance-Level Energy Profiling** (Rated wattage, duty-cycle operating hours, monthly cost share, and discrepancy auditing against physical meter readings).
4. **AI Energy Advisory** (Deterministic rule-based recommendation engine with transparent mathematical formulas, plus configurable external Gemini/OpenAI integration).
5. **Statistical Bill Prediction & Forecasting** (Velocity extrapolation with uncertainty intervals and seasonal adjustments).
6. **Household Energy Savings Goals** (Gamified targets, milestone countdowns, and achievement badges).
7. **Historical Consumption Analytics** (Interactive visual ledgers, trends, and expense trajectory charts).
8. **Comprehensive Reports & Data Exports** (Formal audit documents, print/PDF layout, CSV export, and full JSON archive).
9. **Future Smart Meter & IoT Gateway Layer** (REST & MQTT schemas prepared for future smart meters, ESP32 current clamps, and time-series telemetry).

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript & Vite
- **Styling:** Tailwind CSS with custom Enersense AI design tokens (Energy Green `#22C55E`, Deep Green `#14532D`, Electric Blue `#2563EB`, Slate)
- **Data Visualization:** Recharts (BarChart, AreaChart, PieChart, LineChart)
- **Icons:** Lucide React
- **Routing:** React Router v7
- **Typography:** Google Fonts Inter

### Backend
- **Runtime:** Node.js with Express.js & TypeScript
- **Database:** MongoDB & Mongoose with zero-friction embedded JSON file-persistence fallback (`jsonStore.ts`)
- **Authentication:** Password hashing via `bcryptjs`, JWT sessions with secure HttpOnly cookies and Bearer token fallback
- **OCR Engine:** Tesseract.js image extraction with regex digit filtering and voltage/frequency suppression
- **AI Processing:** Server-side Gemini / OpenAI abstraction with a robust mathematical rule-based advisory fallback

---

## 3. Project Structure

```
enersense-ai/
│
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Sidebar, StatCard, Modal, Logo, Badge, EmptyState)
│   │   ├── layouts/            # DashboardLayout (Protected) & PublicLayout
│   │   ├── pages/              # 12 Functional Views (Dashboard, Scanner, Bills, Appliances, etc.)
│   │   ├── services/           # API service wrapper & Auth Context
│   │   ├── types/              # TypeScript definitions
│   │   └── utils/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/             # Environment & Database connectors
│   │   ├── controllers/        # Express request controllers
│   │   ├── middleware/         # Auth, Centralized Error Handling, Uploads
│   │   ├── models/             # Mongoose schemas & dual-engine Data Repository
│   │   ├── routes/             # REST API routes
│   │   ├── services/           # Tariff Engine, OCR, AI Advisor, Forecasting
│   │   ├── tests/              # Vitest calculation test suites
│   │   └── utils/              # Database seed script & fallback JsonStore
│   ├── tsconfig.json
│   └── package.json
│
├── .env.example                # Sample environment configuration
├── README.md                   # Full system documentation
└── package.json                # Root orchestration scripts
```

---

## 4. Quick Start & Installation

### Prerequisites
- Node.js v18+ or v20+ (tested on Node v24)
- npm v9+

### 1. Clone & Install Dependencies
```bash
# From the root directory:
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection URI | `mongodb://localhost:27017/enersense` |
| `JWT_SECRET` | Secret key for signing session tokens | `enersense_ai_super_secret_jwt_key` |
| `OCR_PROVIDER` | OCR service (`tesseract`, `mock`) | `tesseract` |
| `AI_PROVIDER` | AI advisor provider (`gemini`, `openai`, `rule_based`) | `gemini` |
| `AI_API_KEY` | (Optional) API key for Gemini or OpenAI | *(blank = rule-based default)* |

> **Seamless Database Operation:** If a local MongoDB instance is not active, Enersense AI automatically and transparently operates with its file-persisted JSON data store in `server/data/store.json`. No external service setup is required to run the application immediately!

### 3. Run Development Servers
```bash
# Starts both Backend (Port 5000) and Frontend (Port 5173) concurrently:
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 5. Demonstration Account

To evaluate the application instantly with preloaded historical consumption records and realistic appliances:

- **Email:** `demo@enersense.ai`
- **Password:** `password123`
- *Or click the convenient "1-Click Demo Account" button on the Login page.*

---

## 6. Key Modules & Functional Workflows

### A. Smart Meter Scanner
1. Upload an electricity meter photograph (JPEG, PNG, WebP) or click "Use Live Device Camera".
2. The OCR engine reads the display, filters out background electrical ratings (e.g., 240V, 50Hz), and returns the primary numeric counter reading with a confidence score.
3. If multiple numbers appear on the nameplate, an ambiguity selector lets the user select or manually override the exact reading.
4. If a reading is lower than the previous record, an automated rollover and meter-replacement safeguard triggers.

### B. Tariff-Aware Bill Estimation
- Supports progressive slab structures from state distribution companies:
  - **Maharashtra (MSEDCL):** Tiered slabs (0-100 @ ₹3.36, 101-300 @ ₹7.34, 301-500 @ ₹10.37, 501+ @ ₹11.86) + Fixed charges + 16% Electricity Duty.
  - **Delhi (BSES):** Progressive tiers with 100% subsidy for consumption $\le$ 200 kWh.
  - **Karnataka (BESCOM):** Tiered domestic structure.
  - **Tamil Nadu (TANGEDCO):** Tiered structure with first 100 units free.
  - **Uttar Pradesh (UPPCL):** LMV-1 domestic schedule.

### C. Appliance Energy Profiling
- Calculates daily and monthly consumption:
  $$\text{Daily kWh} = \frac{\text{Power (Watts)} \times \text{Quantity} \times \text{Daily Hours}}{1000} + \frac{\text{Standby Watts} \times (24 - \text{Daily Hours})}{1000}$$
  $$\text{Monthly kWh} = \text{Daily kWh} \times \text{Operating Days/Month}$$
- Automatically compares total appliance consumption against recent physical meter readings to identify unlogged vampire loads or usage discrepancies.

### D. AI Energy Advisor
- Analyzes appliance duty cycles and meter trends to generate recommendations.
- Employs deterministic formulas:
  $$\text{Savings} = \text{Power (kW)} \times \Delta\text{Hours} \times \text{Days} \times \text{Effective Tariff Rate}$$
- Provides transparent confidence indicators and action tracking (Mark Done / Dismiss).

### E. Predictive Bill Forecasting
- Computes baseline daily consumption velocity from chronological readings.
- Projects the expected consumption and estimated bill for 15, 30, 45, or 60 day horizons with a $\pm 10\text{--}18\%$ uncertainty interval.

---

## 7. Running Automated Tests

Enersense AI includes a full test suite validating progressive tariff calculations, appliance formulas, statistical forecasting, rollover detection, and OCR digit extraction:

```bash
npm run test
```

Test Results:
- ✓ calculates progressive tariff slabs accurately for 0 - 100 kWh
- ✓ calculates multi-slab progressive energy charges for 250 kWh
- ✓ handles flat rate alternative tariff configuration
- ✓ applies regional subsidy for eligible consumption under Delhi tariff
- ✓ calculates appliance daily and monthly kWh correctly according to formula
- ✓ computes standby phantom power in daily appliance consumption
- ✓ generates statistical electricity forecasts from chronological readings
- ✓ gracefully handles insufficient historical data for forecasting
- ✓ extracts meter reading candidates and detects unit from OCR text

---

## 8. License

Developed for the **Swachh & Sustainable Bharat** competition theme.  
Licensed under the [MIT License](LICENSE).
