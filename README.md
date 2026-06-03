# DEBRISNET


## The Problem

There are 27,000+ tracked objects in Earth orbit, with that number growing by thousands annually from new launches and fragmentation events. A single conjunction — like the 2009 Iridium-Cosmos collision — can generate over 1,800 new debris fragments, each capable of triggering further cascades (Kessler syndrome). SpaceX alone files hundreds of conjunction alerts per week for the Starlink constellation. Yet the tools for analyzing these risks remain proprietary, expensive, and inaccessible to researchers, engineers, and the broader space community. DebrisNet changes that.

---

## How It Works

1. **TLE Ingestion** — Fetches live Two-Line Element sets from the CelesTrak public catalog, covering 27,000+ active satellites, rocket bodies, and debris objects. Auto-refreshes every 6 hours; no authentication required.
2. **SGP4 Propagation** — Uses the SGP4/SDP4 model — the same algorithm used by NORAD and space agencies worldwide — to propagate each object's position forward at 1-minute timesteps across a 72-hour window.
3. **Conjunction Detection** — Performs pairwise close approach analysis between a primary satellite and the full debris catalog using NumPy-vectorized distance computation, flagging all events below a configurable miss distance threshold.
4. **Risk Scoring** — Computes a 0-100 composite risk score for each conjunction event, weighting miss distance, relative velocity, and estimated object cross-section into a single actionable metric.
5. **LLM Narrative** — Sends structured conjunction data to Gemini 1.5 Flash, which returns a mission-controller-grade risk briefing: severity level, recommended action, key facts, and a confidence statement.
6. **3D Visualization** — Renders all propagated orbital tracks and conjunction warning points on an interactive Three.js Earth globe, with pulsing red spheres at close approach locations scaled by risk score.

---

## Features

| Feature | Description |
|---|---|
| **Live TLE Ingestion** | Auto-refreshes every 6 hours from CelesTrak. Covers active satellites, rocket bodies, and debris — 27,000+ objects in a single catalog. |
| **SGP4 Orbital Propagation** | NORAD-grade orbit propagation at 1-minute resolution across a 72-hour window. Outputs ECI positions converted to geodetic lat/lon/alt for visualization. |
| **Conjunction Detection** | NumPy-vectorized pairwise distance engine. Analyzes a primary satellite against hundreds of debris objects in under 3 seconds. |
| **Risk Scoring (0-100)** | Composite risk score derived from miss distance, relative velocity, and object size. Instantly interpretable without domain expertise. |
| **LLM Risk Narratives** | Gemini 1.5 Flash generates structured briefings with severity classification (LOW / MEDIUM / HIGH / CRITICAL), recommended action, and confidence rating. |
| **3D Orbital Globe** | Interactive Three.js Earth with NASA Blue Marble texture. Real orbital tracks rendered as glowing lines; conjunction points as pulsing warning spheres. |
| **Featured Satellites Panel** | Homepage auto-loads live risk cards for ISS (NORAD 25544), Hubble (20580), an active Starlink, and Tiangong — no search required. |

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Python 3.11, FastAPI, uvicorn | Async REST API, background TLE refresh tasks, CORS |
| **Orbital Engine** | python-sgp4 | SGP4/SDP4 propagation — identical to NORAD's operational model |
| **Coordinate Math** | pymap3d, NumPy | ECI → ECEF → geodetic conversion; vectorized pairwise distance |
| **Data Source** | CelesTrak | Free public TLE catalog. No API key. Live data. |
| **AI / LLM** | Gemini 1.5 Flash, google-generativeai | Structured risk narrative generation |
| **Frontend** | React 18, Vite | Component architecture, fast dev/build pipeline |
| **3D Globe** | Three.js | WebGL Earth, orbital track rendering, conjunction sphere animation |
| **Charts** | Recharts | Risk score gauges, conjunction timeline charts |
| **Styling** | Tailwind CSS | Utility-first responsive layout |
| **Backend Deploy** | Railway.app | Free-tier Python hosting, GitHub auto-deploy |
| **Frontend Deploy** | Vercel | Edge CDN, GitHub integration, instant previews |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/SRIVASTAVASRIHARSHA/debrisnet.git
cd debrisnet

# 2. Backend setup
cd backend
pip install -r requirements.txt

# 3. Set your Gemini API key
# Get a free key at: https://aistudio.google.com/app/apikey
export GEMINI_API_KEY="your_key_here"      # macOS/Linux
# $env:GEMINI_API_KEY="your_key_here"      # Windows PowerShell

# 4. Start the backend
uvicorn main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started reloader process
INFO:     TLE catalog: fetching from CelesTrak...
INFO:     Loaded 27,413 objects. Next refresh in 6h.
```

FastAPI interactive docs available at: `http://127.0.0.1:8000/docs`

```bash
# 5. Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in 312ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## API Reference

| Method | Endpoint | Description | Example Response |
|---|---|---|---|
| `GET` | `/api/satellites` | Paginated catalog of all tracked objects | `{"total": 27413, "page": 1, "items": [...]}` |
| `GET` | `/api/search?q={query}` | Search by satellite name or NORAD ID | `[{"norad_id": 25544, "name": "ISS (ZARYA)", "type": "PAYLOAD"}]` |
| `GET` | `/api/orbit/{norad_id}` | 72-hour propagated positions as lat/lon/alt array | `{"norad_id": 25544, "points": [{"lat": 51.6, "lon": -10.2, "alt": 420.1, "t": "..."}]}` |
| `GET` | `/api/conjunctions/{norad_id}` | All close approach events within 72 hours | `{"events": [{"secondary": "COSMOS 1408 DEB", "miss_km": 0.83, "t_closest": "..."}]}` |
| `GET` | `/api/risk-report/{norad_id}` | Full LLM risk report with score, severity, narrative | `{"risk_score": 74, "severity": "HIGH", "summary": "...", "recommended_action": "..."}` |
| `GET` | `/api/featured` | Live risk cards for ISS, Hubble, Starlink, Tiangong | `[{"norad_id": 25544, "name": "ISS", "risk_score": 31, ...}]` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA PIPELINE                            │
│                                                                 │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐  │
│  │  CelesTrak  │────▶│ tle_fetcher  │────▶│  propagator.py  │  │
│  │  TLE Catalog│     │  (6hr cache) │     │  (SGP4 engine)  │  │
│  └─────────────┘     └──────────────┘     └────────┬────────┘  │
│                                                     │           │
│                                           ECI positions array   │
│                                                     │           │
│                                           ┌─────────▼────────┐  │
│                                           │  conjunction.py  │  │
│                                           │ (NumPy pairwise) │  │
│                                           └─────────┬────────┘  │
│                                                     │           │
│                                           close approach events  │
│                                                     │           │
│                              ┌──────────────────────┤           │
│                              │                      │           │
│                   ┌──────────▼──────┐    ┌──────────▼────────┐ │
│                   │  risk_scorer.py │    │  llm_narrator.py  │ │
│                   │  (0-100 score)  │    │  (Gemini 1.5 Flash│ │
│                   └──────────┬──────┘    └──────────┬────────┘ │
│                              │                      │           │
│                              └──────────┬───────────┘           │
│                                         │                       │
│                                  ┌──────▼──────┐                │
│                                  │   main.py   │                │
│                                  │  (FastAPI)  │                │
│                                  └──────┬──────┘                │
└─────────────────────────────────────────┼───────────────────────┘
                                          │ REST API (JSON)
                    ┌─────────────────────┼──────────────────────┐
                    │         REACT FRONTEND                      │
                    │                     │                       │
                    │  ┌──────────────────▼───────────────────┐  │
                    │  │            App.jsx                    │  │
                    │  └──┬──────────┬──────────┬─────────┬───┘  │
                    │     │          │          │         │       │
                    │  Search  RiskReport  Conjunction  Orbital   │
                    │  Bar.jsx  .jsx       Table.jsx   Globe.jsx  │
                    │                                (Three.js)   │
                    └─────────────────────────────────────────────┘
```

---

## What Makes This Different

- **Production-grade orbital mechanics.** SGP4 is not an approximation or a toy physics engine — it is the internationally standardized model used by NORAD, ESA, and every major space agency to track objects in the debris catalog. DebrisNet uses it directly, without simplification.
- **Live data, not fixtures.** Every risk report is generated from TLE sets pulled within the last 6 hours. When you query ISS, you are seeing its actual current orbital state, propagated forward in real time.
- **LLM as a reasoning layer, not a chatbot.** Gemini receives structured conjunction data — miss distances, velocities, object metadata — and returns a graded, actionable briefing. This is chain-of-thought reasoning applied to a real aerospace safety problem.
- **The open-source gap it fills.** Conjunction analysis tools exist (STK, CARA), but none are open-source, none have a natural-language interface, and none are accessible to the research community without institutional licenses. DebrisNet is the first open platform to combine SGP4 propagation with LLM interpretation.

---

## Roadmap

- [x] Live TLE ingestion from CelesTrak with 6-hour auto-refresh
- [x] SGP4 propagation engine with ECI → geodetic conversion
- [x] Pairwise conjunction detection (NumPy vectorized)
- [x] 0-100 risk scoring with configurable thresholds
- [x] Gemini LLM risk narrative generation
- [x] Three.js 3D orbital globe with warning spheres
- [x] FastAPI backend with full OpenAPI documentation
- [x] Vercel + Railway deployment pipeline
- [ ] **v1.1** — Maneuver recommendation engine: given a HIGH/CRITICAL event, compute optimal avoidance burn ΔV using Lambert's problem
- [ ] **v1.2** — Multi-satellite fleet dashboard: monitor an entire constellation (e.g., all active Starlink) on a single risk heat map
- [ ] **v1.3** — Historical conjunction timeline: replay past close approach events using archived TLE snapshots
- [ ] **Future** — Space-Track.org integration for access to the full classified debris catalog (requires registration)
- [ ] **Future** — Real-time WebSocket push notifications when a monitored satellite crosses a risk threshold

---

## Contributing

DebrisNet is open to contributions — orbital mechanics improvements, LLM prompt engineering, frontend polish, and documentation are all welcome. Open an issue to discuss a feature or bug before submitting a PR. Pull requests against the `dev` branch with a clear description of the change will be reviewed within 48 hours.

- [Open an Issue](https://github.com/SRIVASTAVASRIHARSHA/debrisnet/issues)
- [Submit a Pull Request](https://github.com/SRIVASTAVASRIHARSHA/debrisnet/pulls)

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

---

## Author

**SRI VASTAVA SRI HARSHA** — Undergrad , Computer Science Engineer.

<p>
  <a href="https://github.com/SRIVASTAVASRIHARSHA">
    <img src="https://img.shields.io/badge/GitHub-SRIVASTAVASRIHARSHA-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"/>
  </a>
  &nbsp;
  <a href="https://www.linkedin.com/in/sri-vastava-sri-harsha-gampa-830b64382/">
    <img src="https://img.shields.io/badge/LinkedIn-Sri%20Harsha-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"/>
  </a>
</p>

---

*There are 27,000 objects hurtling around Earth at 28,000 km/h. Most people don't know their names. DebrisNet does.*