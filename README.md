# SEO Analyzer Pro

A full-stack SEO analysis tool where marketing teams can analyze blog posts and web pages for SEO readiness. Built as a take-home assignment for a Data Science Intern (Full-Stack) role.

---

## Live Demo

**Frontend:** https://seo-analyzer-frontend-5xnk.onrender.com  
**Backend API:** https://seo-analyzer-z9z0.onrender.com  
**API Docs (Swagger):** https://seo-analyzer-z9z0.onrender.com/docs

---

## Features

### Core
- **URL Analysis** — Paste any public URL and the app fetches and analyzes the page automatically
- **Raw HTML Analysis** — Paste raw HTML directly for instant analysis
- **Keyword Targeting** — Enter a target keyword to check density, placement, and usage
- **SEO Report Dashboard** — Color-coded pass/fail results with actionable recommendations per check
- **Overall SEO Score** — Aggregate score out of 100

### What Gets Analyzed
| Check | Details |
|---|---|
| Title Tag | Present? Length within 50–60 chars? |
| Meta Description | Present? Length within 150–160 chars? |
| Word Count | Total words, 300+ recommended |
| Heading Structure | H1 present? Hierarchy logical (H1 > H2 > H3)? |
| Keyword Density | Frequency %, ideal 1–2.5% |
| Keyword Placement | In title, headings, and first paragraph? |
| Link Analysis | Count of internal and external links |
| Image ALT Text | How many images are missing alt attributes? |
| Readability | Flesch Reading Ease score (60+ = easy) |

### Stretch Goals Completed
- **Compare Mode** — Analyze two URLs side by side with green/red highlighting per metric
- **PDF Export** — Download any report (single or compare) as a formatted PDF
- **History** — Every analysis saved to SQLite; view past results with expandable full-report rows
- **AI-Powered Suggestions** — Groq LLM generates specific rewrite suggestions for weak titles, meta descriptions, and other SEO issues (available on both single and compare mode)

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend | FastAPI (Python) | Fast, async, auto-generates Swagger docs |
| HTML Parsing | BeautifulSoup4 | Reliable and lightweight |
| Readability | textstat | Simple Flesch score with no heavy dependencies |
| PDF Generation | ReportLab | No system dependencies, cross-platform |
| Database | SQLite via SQLAlchemy | Zero setup, sufficient for demo scale |
| AI Suggestions | Groq API (llama-3.3-70b-versatile) | Free tier, fast inference |
| Frontend | React + Vite + Tailwind CSS | Modern SPA, clean component architecture |
| Deployment | Render (backend + frontend) | Simple GitHub integration, free tier |

---

## Project Structure

```
SEO-Analyzer/
├── backend/
│   ├── main.py              # FastAPI app, all JSON endpoints
│   ├── analyzer.py          # Core SEO analysis logic
│   ├── pdf_generator.py     # PDF export using ReportLab
│   ├── database.py          # SQLAlchemy models and DB init
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── src/
    │   ├── App.jsx           # Root component, routing
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── AnalyzerForm.jsx
    │   │   ├── SingleReport.jsx
    │   │   ├── CompareReport.jsx
    │   │   └── History.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Backend Setup

**1. Clone the repository**
```bash
git clone https://github.com/Haricharan24/SEO-Analyzer.git
cd SEO-Analyzer
```

**2. Create and activate a virtual environment**
```bash
# Mac/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

**3. Install dependencies**
```bash
cd backend
pip install -r requirements.txt
```

**4. Create a .env file inside backend/**
```
GROQ_API_KEY=your_groq_api_key_here
```

**5. Run the backend**
```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`

### Frontend Setup

**1. Install dependencies**
```bash
cd frontend
npm install
```

**2. Create a .env file inside frontend/**
```
VITE_API_URL=http://localhost:8000
```

**3. Run the frontend**
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/analyze` | Run single or compare analysis, returns JSON |
| GET | `/history` | Fetch last 20 analyses |
| POST | `/ai-suggestions` | Get AI-powered rewrite suggestions via Groq |
| POST | `/download_pdf` | Download single URL report as PDF |
| POST | `/download_html_pdf` | Download raw HTML report as PDF |
| POST | `/download_compare_pdf` | Download compare report as PDF |

Full interactive documentation available at `/docs` (Swagger UI).

---

## AI Tools Used

This project was built with significant assistance from **Claude (Anthropic)**. Here is an honest account of how AI was used, where it helped, and where it fell short.

### What AI helped with
- Generating the initial FastAPI route structure and Jinja2 template logic
- Writing BeautifulSoup parsing logic for heading hierarchy checking
- Building the React component structure and Tailwind styling
- Debugging the SQLAlchemy `declarative_base` deprecation error
- Fixing Jinja2 `UndefinedError` issues when variables weren't passed in template context

### Where AI got things wrong
- **Heading hierarchy logic** — The first version Claude generated used `last_level = 0` and reset incorrectly between sections, causing false positives (e.g. flagging valid H2 → H3 jumps as errors). I had to trace through the logic manually to find the bug and fix the condition to only flag jumps greater than 1 level.
- **Groq model name** — Claude suggested `llama3-8b-8192` which had already been decommissioned. Then suggested `llama3-70b-8192` which was also deprecated. I had to check the Groq deprecation docs myself and find the correct current model (`llama-3.3-70b-versatile`).
- **Jinja2 tags inside script blocks** — Claude initially put `{% if url1 %}` directly inside a `<script>` tag which caused JavaScript syntax errors in the browser. I identified this was a JS parser issue (not a Jinja2 issue) and pushed back, which led to the correct fix of rendering the value into a JS variable instead.
- **`.env` in git history** — Claude's initial `.gitignore` setup didn't prevent the `.env` file from being committed in an earlier push. GitHub's secret scanning blocked the push. I had to use `git filter-branch` to purge the file from history and regenerate the API key.

### How I decided what to accept vs modify
I treated AI suggestions as a first draft, not a final answer. I accepted suggestions when I could read the code, understand what it was doing, and verify it matched the requirement. I modified or rejected suggestions when the logic didn't hold up under manual tracing — like the heading hierarchy bug — or when the output didn't match real-world conditions like the deprecated model names. The AI was most useful for boilerplate and structure; the actual debugging and correctness checking was done manually.

---

## Trade-offs & Decisions

- **Single template → React SPA** — Started with Jinja2 server-rendered templates for speed, then migrated to a proper React SPA to separate concerns and make the architecture extensible
- **SQLite over PostgreSQL** — Sufficient for demo scale, zero setup. Easy to swap by changing `DATABASE_URL` in `database.py`
- **Groq over OpenAI** — Free tier with fast inference, no credit card required
- **Render for both frontend and backend** — Keeps deployment on one platform, simpler to manage

---

## Known Limitations

- Some websites block automated requests even with a User-Agent header
- Keyword density counts all page text including navigation/footer — may slightly inflate counts
- SQLite history is local — clears on Render redeploy unless a persistent disk is attached
- Render free tier spins down after inactivity — first load may take 30–60 seconds to wake up

---

## What I Would Add With More Time

- Persistent database (PostgreSQL) so history survives redeployments
- User authentication so each user sees their own history
- Keyword suggestion feature based on page content analysis
- Competitor analysis mode with deeper comparison metrics
- Export history as CSV

---

## Deployment

Both services are deployed on Render:

**Backend (Web Service)**
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment Variable: `GROQ_API_KEY`

**Frontend (Static Site)**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_URL=https://seo-analyzer-z9z0.onrender.com`

---

## License

MIT