from bs4 import BeautifulSoup
import textstat


def analyze_content(html, keyword):
    soup = BeautifulSoup(html, "html.parser")

    result = {}
    score = 0

    # ---------------- TITLE ----------------
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    title_length = len(title)

    title_present = bool(title)
    title_length_ok = 50 <= title_length <= 60

    if title_present and title_length_ok:
        score += 10

    # ---------------- META ----------------
    meta = soup.find("meta", attrs={"name": "description"})
    meta_content = meta["content"].strip() if meta and meta.get("content") else ""
    meta_length = len(meta_content)

    meta_present = bool(meta_content)
    meta_length_ok = 150 <= meta_length <= 160

    if meta_present and meta_length_ok:
        score += 10

    # ---------------- TEXT ----------------
    text = soup.get_text(separator=" ")
    words = text.split()
    word_count = len(words)

    if word_count >= 300:
        score += 20

    # ---------------- HEADINGS ----------------
    h1 = soup.find("h1")
    h1_present = bool(h1)

    headings = soup.find_all(["h1", "h2", "h3"])
    hierarchy_ok = True
    prev_level = 0

    for tag in headings:
        level = int(tag.name[1])
        # A jump of more than 1 level (e.g. H1 -> H3) is invalid
        if prev_level > 0 and level > prev_level + 1:
            hierarchy_ok = False
            break
        prev_level = level

    if h1_present and hierarchy_ok:
        score += 10

    # ---------------- KEYWORD ----------------
    keyword_lower = keyword.lower()
    text_lower = text.lower()

    keyword_count = text_lower.count(keyword_lower)
    keyword_density = round((keyword_count / word_count) * 100, 2) if word_count else 0

    keyword_in_title = keyword_lower in title.lower()
    keyword_in_headings = any(keyword_lower in h.get_text().lower() for h in headings)

    paragraphs = soup.find_all("p")
    first_paragraph = paragraphs[0].get_text().lower() if paragraphs else ""
    keyword_in_first_paragraph = keyword_lower in first_paragraph

    if 1 <= keyword_density <= 2.5:
        score += 20

    if keyword_in_title:
        score += 5
    if keyword_in_headings:
        score += 5

    # ---------------- LINKS ----------------
    links = soup.find_all("a")
    internal = 0
    external = 0

    for link in links:
        href = link.get("href")
        if href:
            if href.startswith("http"):
                external += 1
            else:
                internal += 1

    # ---------------- IMAGES ----------------
    images = soup.find_all("img")
    images_without_alt = sum(1 for img in images if not img.get("alt"))

    if images_without_alt == 0:
        score += 10

    # ---------------- READABILITY ----------------
    readability_score = round(textstat.flesch_reading_ease(text), 2)
    if readability_score >= 60:
        score += 10

    result = {
        "score": score,
        "title_present": title_present,
        "title_length": title_length,
        "meta_present": meta_present,
        "meta_length": meta_length,
        "word_count": word_count,
        "h1_present": h1_present,
        "hierarchy_ok": hierarchy_ok,
        "keyword_density": keyword_density,
        "keyword_in_title": keyword_in_title,
        "keyword_in_headings": keyword_in_headings,
        "keyword_in_first_paragraph": keyword_in_first_paragraph,
        "internal_links": internal,
        "external_links": external,
        "images_without_alt": images_without_alt,
        "readability_score": readability_score,
    }

    return result