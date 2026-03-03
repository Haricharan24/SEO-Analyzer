# SEO Analyzer Pro

A full-stack web application that analyzes web pages and HTML content for SEO readiness. Built as part of a Data Science Intern take-home assignment.

---

## Live Demo

> Add your deployed URL here after deployment

---

## Features

### Core
- **URL Analysis** — Paste any public URL and the app fetches and analyzes the page automatically
- **Raw HTML Analysis** — Paste raw HTML directly for instant analysis
- **Keyword Targeting** — Enter a target keyword to check density, placement, and usage across the page
- **SEO Report Dashboard** — Clean, color-coded pass/fail results for every check with actionable recommendations
- **Overall SEO Score** — Aggregate score out of 100 with green / amber / red indicator

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
- **Compare Mode** — Analyze two URLs side by side with highlighted winner/loser per metric
- **PDF Export** — Download any report (single or compare) as a formatted PDF
- **History** — Every analysis is saved to a local SQLite database; view past results on the History page with expandable full-report rows

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Templating | Jinja2 |
| HTML Parsing | BeautifulSoup4 |
| Readability | textstat |
| PDF Generation | ReportLab |
| Database | SQLite via SQLAlchemy |
| Frontend | Vanilla HTML/CSS/JS |

---

## Project Structure

```
seo-analyzer/
├── main.py              # FastAPI app, all routes
├── analyzer.py          # Core SEO analysis logic
├── pdf_generator.py     # PDF export using ReportLab
├── database.py          # SQLAlchemy models and DB init
├── requirements.txt     # Python dependencies
├── templates/
│   └── index.html       # Single-page Jinja2 template
└── analysis_history.db  # Auto-created SQLite database (gitignored)
```

---

## Installation & Setup

### Prerequisites
- Python 3.9 or higher
- pip

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/your-username/seo-analyzer.git
cd seo-analyzer
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
pip install -r requirements.txt
```

**4. Create the templates folder and move the HTML file**
```bash
mkdir templates
mv index.html templates/
```

**5. Run the app**
```bash
uvicorn main:app --reload
```

**6. Open in browser**
```
http://localhost:8000
```

The SQLite database (`analysis_history.db`) is created automatically on first startup — no setup needed.

---

## Usage

### Single Page Analysis
1. Go to the home page
2. Enter a URL **or** paste raw HTML into the text area
3. Enter your target keyword
4. Click **Analyze**
5. View the full report with pass/fail indicators and recommendations
6. Click **Download PDF Report** to export

### Compare Mode
1. Click **Compare Two URLs**
2. Enter URL 1 and URL 2
3. Enter your target keyword
4. Click **Analyze**
5. View a side-by-side comparison table (green = better, red = worse)
6. Click **Download Compare PDF** to export

### History
1. Click **History** in the nav bar
2. View all past analyses with date, URL, keyword, and score
3. Click any row to expand and see the full report inline

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Home page |
| POST | `/analyze` | Run single or compare analysis |
| GET | `/history` | View analysis history |
| POST | `/download_pdf` | Download single URL report as PDF |
| POST | `/download_html_pdf` | Download raw HTML report as PDF |
| POST | `/download_compare_pdf` | Download compare report as PDF |

---

## AI Tools Used

This project was built with assistance from **Claude (Anthropic)**. AI was used for:
- Generating boilerplate FastAPI route structure
- Writing and debugging the Jinja2 template logic
- Fixing edge cases in the heading hierarchy checker
- PDF table styling with ReportLab
- Debugging SQLAlchemy integration and Jinja2 `UndefinedError` issues

All code was reviewed, understood, and debugged manually. AI was used as a productivity tool, not a replacement for understanding the codebase.

---

## Trade-offs & Decisions

- **Single template file** — All UI lives in `index.html` using Jinja2 conditionals. Keeps the project simple and easy to deploy without a frontend build step.
- **SQLite over PostgreSQL** — Sufficient for a local/demo app. Easy to swap to PostgreSQL by changing `DATABASE_URL` in `database.py`.
- **No authentication** — Out of scope for this assignment. Would be a priority before any real deployment.
- **ReportLab over WeasyPrint** — ReportLab has no system dependencies, making it easier to install cross-platform.

---

## Known Limitations

- Some websites block automated requests even with a User-Agent header (returns fetch error)
- Keyword density is calculated on all page text including navigation/footer — may slightly inflate counts on pages with heavy boilerplate
- Readability score can be skewed on pages with very little text content
- History is stored locally — clears if the server is redeployed without persisting the `.db` file

---

## What I Would Add With More Time

- AI-powered rewrite suggestions for weak titles and meta descriptions using an LLM API
- User authentication so each user has their own history
- Keyword suggestion feature based on page content
- Competitor analysis mode comparing your page vs a competitor
- Cloud database (PostgreSQL) for persistent history across deployments
- Better mobile responsiveness

---

## Deployment

The app can be deployed to any platform that supports Python. Recommended options:

**Render (easiest)**
1. Push to GitHub
2. Create a new Web Service on [render.com](https://render.com)
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Railway / Fly.io** — Similar process, also free tier available.

---

## License

MIT
