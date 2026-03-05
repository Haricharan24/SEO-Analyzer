import io
import json
import httpx
from fastapi import FastAPI, Form, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from analyzer import analyze_content
from pdf_generator import generate_pdf_bytes
from database import init_db, SessionLocal, Analysis
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SEO Analyzer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


def fetch_html(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        r = requests.get(url, headers=headers, timeout=10)
        r.raise_for_status()
        return r.text
    except:
        return None


def save_analysis(url1=None, url2=None, keyword=None, report_data=None):
    try:
        db = SessionLocal()
        record = Analysis(
            url1=url1,
            url2=url2,
            keyword=keyword,
            report_json=json.dumps(report_data)
        )
        db.add(record)
        db.commit()
        db.close()
    except Exception as e:
        print(f"DB save error: {e}")


@app.get("/")
async def home():
    return {"message": "SEO Analyzer API is running", "docs": "/docs"}


@app.post("/analyze")
async def analyze(
    mode: str = Form(...),
    url: str = Form(None),
    raw_content: str = Form(None),
    url1: str = Form(None),
    url2: str = Form(None),
    keyword: str = Form(...)
):
    # ---------------- SINGLE MODE ----------------
    if mode == "single":
        if url:
            html = fetch_html(url)
            if not html:
                return JSONResponse(status_code=400, content={"detail": "Failed to fetch URL. The site may be blocking requests."})
        elif raw_content:
            html = raw_content
        else:
            return JSONResponse(status_code=400, content={"detail": "Please provide a URL or paste Raw HTML."})

        report = analyze_content(html, keyword)
        save_analysis(url1=url or "Raw HTML", keyword=keyword, report_data=report)

        return {"mode": "single", "report": report, "keyword": keyword, "url": url, "raw_content": raw_content}

    # ---------------- COMPARE MODE ----------------
    elif mode == "compare":
        html1 = fetch_html(url1)
        if not html1:
            return JSONResponse(status_code=400, content={"detail": f"Failed to fetch URL 1: {url1}"})

        html2 = fetch_html(url2)
        if not html2:
            return JSONResponse(status_code=400, content={"detail": f"Failed to fetch URL 2: {url2}"})

        report1 = analyze_content(html1, keyword)
        report2 = analyze_content(html2, keyword)

        save_analysis(url1=url1, url2=url2, keyword=keyword, report_data={"URL 1": report1, "URL 2": report2})

        return {"mode": "compare", "report1": report1, "report2": report2, "url1": url1, "url2": url2, "keyword": keyword}

    return JSONResponse(status_code=400, content={"detail": "Invalid mode"})


# ---------------- AI SUGGESTIONS ----------------
class SuggestionRequest(BaseModel):
    report: dict
    keyword: str
    url: str = ""


@app.post("/ai-suggestions")
async def ai_suggestions(body: SuggestionRequest):
    report = body.report
    keyword = body.keyword

    issues = []
    if not report.get("title_present"):
        issues.append("- Title tag is missing")
    elif not (50 <= report.get("title_length", 0) <= 60):
        issues.append(f"- Title length is {report.get('title_length')} chars (ideal: 50-60)")
    if not report.get("meta_present"):
        issues.append("- Meta description is missing")
    elif not (150 <= report.get("meta_length", 0) <= 160):
        issues.append(f"- Meta description length is {report.get('meta_length')} chars (ideal: 150-160)")
    if not report.get("keyword_in_title"):
        issues.append(f"- Target keyword '{keyword}' is not in the title")
    if not report.get("keyword_in_headings"):
        issues.append(f"- Target keyword '{keyword}' is not in any heading")
    density = report.get("keyword_density", 0)
    if density < 1:
        issues.append(f"- Keyword density is too low ({density}%)")
    elif density > 2.5:
        issues.append(f"- Keyword density is too high ({density}%)")

    if not issues:
        return {"suggestions": "✅ Great job! No major SEO issues found. Your page is well-optimized for the target keyword."}

    prompt = f"""You are an expert SEO consultant. A user has analyzed their webpage for the target keyword "{keyword}" and found these SEO issues:

{chr(10).join(issues)}

Please provide:
1. A suggested rewrite for the title tag (if it has issues) - keep it 50-60 characters
2. A suggested rewrite for the meta description (if it has issues) - keep it 150-160 characters  
3. 2-3 specific, actionable tips to improve the other issues

Be concise, practical, and specific. Format your response clearly with headers."""

    groq_key = os.environ.get("GROQ_API_KEY")
    if not groq_key:
        return {"suggestions": "AI suggestions require a GROQ_API_KEY environment variable to be set."}

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 500,
                },
                timeout=20,
            )
            data = res.json()
            if "choices" not in data:
                error_msg = data.get("error", {}).get("message", str(data))
                return {"suggestions": f"Groq API error: {error_msg}"}
            suggestion_text = data["choices"][0]["message"]["content"]
            return {"suggestions": suggestion_text}
    except Exception as e:
        return {"suggestions": f"AI suggestion error: {str(e)}"}


# ---------------- HISTORY ----------------
@app.get("/history")
async def history_page():
    try:
        db = SessionLocal()
        records = db.query(Analysis).order_by(Analysis.timestamp.desc()).limit(20).all()
        db.close()

        history_data = []
        for r in records:
            history_data.append({
                "id": r.id,
                "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M") if r.timestamp else "N/A",
                "url1": r.url1,
                "url2": r.url2,
                "keyword": r.keyword,
                "report": json.loads(r.report_json) if r.report_json else {}
            })
        return {"history": history_data}
    except Exception as e:
        return {"history": [], "error": str(e)}


# ---------------- PDF DOWNLOADS ----------------
@app.post("/download_html_pdf")
async def download_html_pdf(raw_content: str = Form(...), keyword: str = Form(...)):
    report = analyze_content(raw_content, keyword)
    pdf_bytes = generate_pdf_bytes("HTML SEO Report", report)
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=html_report.pdf"})


@app.post("/download_pdf")
async def download_pdf(url: str = Form(...), keyword: str = Form(...)):
    html = fetch_html(url)
    if not html:
        return Response("Unable to fetch URL", status_code=400)
    report = analyze_content(html, keyword)
    pdf_bytes = generate_pdf_bytes("SEO Report", report)
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=seo_report.pdf"})


@app.post("/download_compare_pdf")
async def download_compare_pdf(url1: str = Form(...), url2: str = Form(...), keyword: str = Form(...)):
    html1 = fetch_html(url1)
    html2 = fetch_html(url2)
    if not html1 or not html2:
        return Response("Error fetching one or both URLs", status_code=400)
    report1 = analyze_content(html1, keyword)
    report2 = analyze_content(html2, keyword)
    combined = {"URL 1": report1, "URL 2": report2}
    pdf_bytes = generate_pdf_bytes("Compare SEO Report", combined)
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=compare_report.pdf"})