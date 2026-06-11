# DebrisNet

![Banner](https://via.placeholder.com/1200x300?text=DebrisNet+Banner)

---

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=ffdd54)](https://www.python.org/)
[![Three.js](https://img.shields.io/badge/Three.js-2022-202020?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![SGP4](https://img.shields.io/badge/SGP4-0.2.0-4B8BBE?style=for-the-badge&logo=space&logoColor=white)](https://pypi.org/project/sgp4/)
[![AI Assisted Analysis](https://img.shields.io/badge/AI%20Assisted%20Analysis-💡-FFCC00?style=for-the-badge)](https://ai.google/)

---

## 🌍 Introduction

**The problem**: Earth’s orbital environment is becoming increasingly congested. Thousands of satellites and debris fragments orbit at velocities exceeding 28,000 km/h, dramatically raising the risk of collisions. Each conjunction can generate a cascade of debris, threatening the sustainability of space activities.

**DebrisNet** offers a professional, open‑source solution for space situational awareness. It continuously ingests live TLE data, propagates orbits with the industry‑standard SGP4 model, identifies close‑approach events, and provides AI‑driven risk narratives—all visualized on an interactive 3‑D Earth.

---

## ✨ Key Features

- **Real‑Time Satellite Catalog** – Live feed of >27 000 orbital objects from CelesTrak.
- **SGP4 Orbit Propagation** – Accurate, NORAD‑grade predictions for 72‑hour windows.
- **3‑D Earth Tracking** – Interactive orbital visualization using Three.js.
- **Conjunction Intelligence** – Automated closest‑approach calculations with risk classification.
- **Collision Avoidance Advisor** – Maneuver recommendations and delta‑v assessments.
- **Mission Reports** – Exportable aerospace‑style PDF briefing documents.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Frontend[Frontend]
        FE[React + Three.js]
    end
    subgraph Backend[Backend]
        BE[FastAPI (Python)]
    end
    subgraph Engine[Orbital Engine]
        OG[SGP4 & TLE Data]
    end
    User((User)) --> FE
    FE --> BE
    BE --> OG
    OG --> BE
    BE --> FE
    style Frontend fill:#e3f2fd,stroke:#0d6efd,stroke-width:2px
    style Backend fill:#e2f0d9,stroke:#198754,stroke-width:2px
    style Engine fill:#f8e5e5,stroke:#dc3545,stroke-width:2px
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Three.js, Vite, Tailwind CSS |
| **Backend** | FastAPI, Python 3.11, Uvicorn |
| **Orbital Engine** | SGP4 (python‑sgp4), TLE data feeds |
| **AI** | Gemini 1.5 Flash (LLM) |

---

## 📸 Screenshots (Placeholders)

![Mission Dashboard](https://via.placeholder.com/800x400?text=Mission+Dashboard)
![Orbital Tracking Center](https://via.placeholder.com/800x400?text=Orbital+Tracking+Center)
![Conjunction Intelligence](https://via.placeholder.com/800x400?text=Conjunction+Intelligence)
![Mission Report](https://via.placeholder.com/800x400?text=Mission+Report)

---

## 🚀 Setup Guide

```bash
# Clone the repository
git clone https://github.com/SRIVASTAVASRIHARSHA/debrisnet.git
cd debrisnet
```

### Backend

```bash
cd backend
pip install -r requirements.txt
# Run the API
python -m uvicorn main:app --reload
```

### Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The backend will be available at `http://127.0.0.1:8000` and the frontend at `http://localhost:5173`.

---

## ⚠️ Disclaimer

DebrisNet is a **research and educational platform**. It is **not intended** for operational spacecraft navigation or any mission‑critical decision making.

---

## 📖 License

MIT License – see the [LICENSE](LICENSE) file for details.