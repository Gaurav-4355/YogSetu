# YogSetu (योगसेतु) • Therapeutic Guided Yoga Bridge

> **"We do not replace the therapist. We show the therapist what happens at home."**

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks--Vision-orange.svg)](https://developers.google.com/mediapipe)
[![Gemma 4](https://img.shields.io/badge/Gemma%204-Google%20GenAI-blueviolet.svg)](https://ai.google.dev/)

YogSetu is a therapeutic guided-yoga web platform that closes the critical gap between physiotherapy clinic visits and home rehabilitation. Doctors prescribe tailored routines directly from handwritten notes or clinical goals, patients practice at home with on-device camera angle tracking and Hinglish voice coaching, and doctors receive verified 14-day compliance telemetry, angle trends, and red-flag pain reports.

---

## 🌟 Key Capabilities

1. **Doctor Prescription Workflow**:
   - **Gemma 4 Vision OCR**: Snap a photo of a doctor's handwritten prescription or exercise sheet. Gemma extracts exercises and strictly maps them to clinically validated poses in the library.
   - **Clinical Customization**: Doctors fine-tune hold seconds, set counts, and days of the week before assigning via Gmail or Phone number.
   - **Pre-Assignment Privacy**: Nothing reaches the patient until the doctor explicitly reviews and clicks *Assign*.
2. **On-Device Computer Vision & Coaching**:
   - **Zero Video Uploads**: Powered by `@mediapipe/tasks-vision` running 100% in the user's browser. No camera feed or images ever leave the device.
   - **Angle Verification**: Joint angle trigonometry computes vertical spine tilt and knee flexion/extension in real time.
   - **Strict Hold Timer**: The hold timer ticks **only** while the patient maintains the correct posture.
   - **Hinglish Voice Coach**: Contextual debounced audio feedback (e.g. *"Reeda seedhi rakhein aur dono pairo par samaan vajan dalein"*) with text fallback.
3. **Objective Doctor Telemetry & Gemma Reporting**:
   - **14-Day Calendar Compliance Grid**: Color-coded tracking for done, skipped, and pain-stopped sessions.
   - **Angle-over-Time Charts**: Recharts visualizations displaying longitudinal posture improvements.
   - **Red-Flag Pain Telemetry**: Any pain report triggers an immediate red flag in the clinical portal with patient notes.
   - **Gemma 4 Factual Summary**: Concise 3-4 sentence clinical brief synthesized purely from recorded logs (zero medical cure claims).
   - **Instant Clinical Sharing**: One-click WhatsApp dispatch (`wa.me`) or clipboard summary copying + clean printable layout.
4. **Normal User Self-Care Mode**:
   - People without a doctor can request personalized routines from Gemma 4 for their own goals (e.g. *"Homemaker, only 30 minutes in the morning"*).
   - **Strict Privacy Isolation**: Sessions logged from personal routines are tagged with `source="self"` and are **never** included in doctor clinical reports.
5. **In-Tab Daily Acoustic Reminder**:
   - Harmonic temple bell chime using Web Audio API synthesis (no push notification permissions required).

---

## 🏗️ Architecture & Data Flow

```mermaid
graph TD
    subgraph "Doctor Workflow"
        Doc[Doctor] -->|Prescription Photo / Clinical Prompt| D_UI[Doctor Dashboard / New Assignment]
        D_UI -->|POST /api/doctor/plan-draft| GemmaSvc[Gemma 4 Service]
        GemmaSvc -->|Filtered Draft JSON| D_UI
        D_UI -->|POST /api/assign| DB[(SQLite DB)]
    end

    subgraph "Patient Home Workflow"
        Patient[Patient] -->|Logs In| P_UI[Assigned Dashboard]
        P_UI -->|GET /api/assignments| DB
        P_UI -->|Start Pose| Session[Live Session Screen]
        Webcam[Webcam Video Stream] --> MP[MediaPipe PoseLandmarker (WASM)]
        MP --> Angles[Joint Angle Calculator]
        Angles --> Rules[Pose Rules & Thresholds]
        Rules --> Voice[Hinglish Voice Coach]
        Rules --> Timer[Pose-Dependent Hold Timer]
        Session -->|POST /api/session (source='doctor')| DB
    end

    subgraph "Doctor Clinical Telemetry Loop"
        DB -->|source='doctor' rows only| RepSvc[Report Service]
        RepSvc --> GemmaSumm[Gemma Factual Summary]
        GemmaSumm --> RepUI[14-Day Clinical Report]
        RepUI --> WhatsApp[WhatsApp / Print Export]
    end
```

---

## 📦 Monorepo Structure

```
yogsetu/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry & global error handlers
│   │   ├── config.py            # Pydantic Settings & environment variables
│   │   ├── db.py                # SQLAlchemy engine & session factory
│   │   ├── models.py            # User, Doctor, Assignment, SessionRecord models
│   │   ├── schemas.py           # Pydantic v2 validation schemas
│   │   ├── deps.py              # X-Demo-Identity & X-Demo-Role header parsers
│   │   ├── data/poses.json      # Single source of truth for 10 therapeutic poses
│   │   ├── routers/             # auth, plans, doctor, patient, reports, seed
│   │   └── services/            # gemma_service, plan_service, report_service, safety, identity
│   ├── tests/                   # Pytest test suites (safety, identity, reports, plans)
│   ├── requirements.txt         # Pinned Python dependencies
│   └── pytest.ini
├── frontend/
│   ├── public/
│   │   ├── models/              # Local MediaPipe pose_landmarker_lite.task (5.7MB)
│   │   └── wasm/                # Local MediaPipe WASM runtime assets
│   ├── src/
│   │   ├── api/client.ts        # Typed fetch client with demo identity headers
│   │   ├── components/          # Navbar, Footer, PoseCard, SkeletonOverlay, AccuracyGauge, AlarmModal
│   │   ├── context/             # AuthContext, LanguageContext
│   │   ├── i18n/                # en, hi, hinglish localization dictionaries
│   │   ├── lib/                 # angles.ts, poseRules.ts, speech.ts, identity.ts
│   │   └── pages/               # Landing, Login, Doctor, Assign, Report, Assigned, Home, Session, Progress
│   ├── package.json
│   ├── tailwind.config.js       # Calming health palette: Teal, Sand, Coral
│   └── vite.config.ts
├── docs/
│   ├── AI_USAGE.md              # Transparent AI disclosure (Antigravity & Gemma 4)
│   └── DEMO_SCRIPT.md           # 2-minute judge presentation script
├── Makefile                     # Cross-platform build & test commands
└── run_dev.ps1                  # Single-command Windows development script
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (3.11+)

### 1. Environment Setup
```bash
# In backend directory
cp backend/.env.example backend/.env
```
*(Optional)* Add your Gemini API key in `backend/.env`. If omitted, `DEMO_MODE=true` activates automatically so the demo never fails on stage.

### 2. Backend Setup & Tests
```bash
cd backend
python -m venv .venv

# Windows Powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest -v

# Start FastAPI Server
uvicorn app.main:app --reload --port 8000
```
Backend runs at: [http://127.0.0.1:8000](http://127.0.0.1:8000) (Health check: `/api/health`).

### 3. Frontend Setup
In a second terminal:
```bash
cd frontend
npm install
npm run build
npm run dev
```
Frontend runs at: [http://localhost:5173](http://localhost:5173).

---

## 🔑 Pre-Seeded Demo Accounts

The login page includes a **"Try Demo Accounts"** quick launcher:

| Role | Name | Identifier | Pre-Seeded History |
|---|---|---|---|
| **Doctor** | Dr. Aarav Mehta (PT) | `demo@yogsetu.test` | Assigned Priya & Rajesh; 14-day telemetry |
| **Patient (Email)** | Priya Sharma | `priya.sharma@example.com` | 82% adherence, improving Tadasana angle, 1 pain flag |
| **Patient (Phone)** | Rajesh Patel | `9876543210` | 85% adherence, Vrikshasana tree pose compliance |
| **Normal User** | Ananya Verma | `ananya@example.com` | No doctor; private self-care plan |

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status and `DEMO_MODE` flag |
| `GET` | `/api/poses` | Full 10-pose therapeutic library |
| `POST` | `/api/auth/login` | Demo identity normalization & role selection |
| `POST` | `/api/plan/self` | Generate personal routine from text goal/concern |
| `POST` | `/api/plan/from-note` | Multipart upload for prescription note OCR & routine drafting |
| `POST` | `/api/doctor/plan-draft` | Clinical routine drafting for physicians |
| `POST` | `/api/assign` | Doctor assigns routine to patient identifier |
| `GET` | `/api/assignments` | Active doctor prescriptions for a patient |
| `GET` | `/api/doctor/patients` | Patient roster with 14-day adherence & pain flags |
| `POST` | `/api/session` | Log completed, skipped, or pain-stopped session |
| `GET` | `/api/report/{id}` | 14-day clinical report (strictly doctor-source sessions) |
| `POST` | `/api/summary` | Gemma 4 synthesized factual telemetry summary |
| `POST` | `/api/seed/reset` | Restore pristine 14-day pre-seeded demo telemetry |

---

## 🔒 Safety, Privacy & Limitations

1. **Non-Negotiable Medical Disclaimer**:
   *YogSetu is a posture telemetry bridge, not a substitute for clinical medical evaluation.* Every screen displays the mandatory prompt: **"Yeh doctor ki salah nahi hai. Dard ho to rukein."**
2. **Emergency Red-Flag Filter (`safety.py`)**:
   Input text is evaluated across Hindi, English, and Hinglish for symptoms like severe/sudden chest pain, breathlessness, fresh surgery, or fainting. Any detection sets `needs_doctor=true` and blocks routine generation.
3. **Demo Authentication Model**:
   To ensure frictionless judge evaluation, login is passwordless and identity is passed via `X-Demo-Identity` and `X-Demo-Role` headers. A production version would integrate OAuth2, SMS OTP, and explicit patient consent protocols.
