import io
import json
from fastapi import FastAPI, Form, Request, Response
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
import requests
from analyzer import analyze_content
from pdf_generator import generate_pdf_bytes
from database import init_db, SessionLocal, Analysis

app = FastAPI()
templates = Jinja2Templates(directory="templates")


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


# Base context — always includes history=None so Jinja2 never hits UndefinedError
def base_ctx(request, **kwargs):
    return {"request": request, "history": None, **kwargs}


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", base_ctx(request))


@app.get("/history", response_class=HTMLResponse)
async def history_page(request: Request):
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
    except Exception as e:
        history_data = []
        print(f"DB fetch error: {e}")

    return templates.TemplateResponse("index.html", base_ctx(request, history=history_data))


@app.post("/analyze")
async def analyze(
    request: Request,
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
                return templates.TemplateResponse(
                    "index.html",
                    base_ctx(request, error="Failed to fetch URL. The site may be blocking requests.")
                )

        elif raw_content:
            html = raw_content

        else:
            return templates.TemplateResponse(
                "index.html",
                base_ctx(request, error="Please provide a URL or paste Raw HTML.")
            )

        report = analyze_content(html, keyword)
        save_analysis(url1=url or "Raw HTML", keyword=keyword, report_data=report)

        return templates.TemplateResponse(
            "index.html",
            base_ctx(request,
                report=report,
                keyword=keyword,
                raw_content=raw_content,
                url=url
            )
        )

    # ---------------- COMPARE MODE ----------------
    elif mode == "compare":

        html1 = fetch_html(url1)
        html2 = fetch_html(url2)

        if not html1:
            return templates.TemplateResponse(
                "index.html",
                base_ctx(request, error=f"Failed to fetch URL 1: {url1}")
            )

        if not html2:
            return templates.TemplateResponse(
                "index.html",
                base_ctx(request, error=f"Failed to fetch URL 2: {url2}")
            )

        report1 = analyze_content(html1, keyword)
        report2 = analyze_content(html2, keyword)

        save_analysis(url1=url1, url2=url2, keyword=keyword, report_data={"URL 1": report1, "URL 2": report2})

        return templates.TemplateResponse(
            "index.html",
            base_ctx(request,
                report1=report1,
                report2=report2,
                url1=url1,
                url2=url2,
                keyword=keyword
            )
        )


@app.post("/download_html_pdf")
async def download_html_pdf(
    raw_content: str = Form(...),
    keyword: str = Form(...)
):
    report = analyze_content(raw_content, keyword)
    pdf_bytes = generate_pdf_bytes("HTML SEO Report", report)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=html_report.pdf"}
    )


@app.post("/download_pdf")
async def download_pdf(
    url: str = Form(...),
    keyword: str = Form(...)
):
    html = fetch_html(url)
    if not html:
        return Response("Unable to fetch URL", status_code=400)

    report = analyze_content(html, keyword)
    pdf_bytes = generate_pdf_bytes("SEO Report", report)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=seo_report.pdf"}
    )


@app.post("/download_compare_pdf")
async def download_compare_pdf(
    url1: str = Form(...),
    url2: str = Form(...),
    keyword: str = Form(...)
):
    html1 = fetch_html(url1)
    html2 = fetch_html(url2)

    if not html1 or not html2:
        return Response("Error fetching one or both URLs", status_code=400)

    report1 = analyze_content(html1, keyword)
    report2 = analyze_content(html2, keyword)

    combined = {"URL 1": report1, "URL 2": report2}
    pdf_bytes = generate_pdf_bytes("Compare SEO Report", combined)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=compare_report.pdf"}
    )