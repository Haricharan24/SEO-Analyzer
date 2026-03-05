import { useState } from "react"

const METRICS = [
  { key: "title_present", label: "Title Tag", type: "bool", rec: (r) => r.title_present ? `Good length: ${r.title_length} chars` : "Add a <title> tag to your page" },
  { key: "title_length", label: "Title Length", type: "range", min: 50, max: 60, unit: "chars", rec: (r) => r.title_length >= 50 && r.title_length <= 60 ? "✓ Ideal length (50–60 chars)" : `Currently ${r.title_length} chars. Aim for 50–60.` },
  { key: "meta_present", label: "Meta Description", type: "bool", rec: (r) => r.meta_present ? `Good length: ${r.meta_length} chars` : "Add a meta description tag" },
  { key: "meta_length", label: "Meta Length", type: "range", min: 150, max: 160, unit: "chars", rec: (r) => r.meta_length >= 150 && r.meta_length <= 160 ? "✓ Ideal length (150–160 chars)" : `Currently ${r.meta_length} chars. Aim for 150–160.` },
  { key: "word_count", label: "Word Count", type: "min", min: 300, unit: "words", rec: (r) => r.word_count >= 300 ? "✓ Sufficient content" : "Add more content — aim for 300+ words" },
  { key: "h1_present", label: "H1 Tag", type: "bool", rec: (r) => r.h1_present ? "✓ H1 found" : "Add exactly one H1 tag as your main heading" },
  { key: "hierarchy_ok", label: "Heading Hierarchy", type: "bool", rec: (r) => r.hierarchy_ok ? "✓ Logical heading order" : "Avoid skipping levels (e.g. H1 → H3)" },
  { key: "keyword_density", label: "Keyword Density", type: "range", min: 1, max: 2.5, unit: "%", rec: (r) => r.keyword_density >= 1 && r.keyword_density <= 2.5 ? "✓ Ideal range (1–2.5%)" : r.keyword_density < 1 ? "Too low — use keyword more naturally" : "Too high — may look like keyword stuffing" },
  { key: "keyword_in_title", label: "Keyword in Title", type: "bool", rec: (r) => r.keyword_in_title ? "✓ Found in title" : "Include your keyword in the page title" },
  { key: "keyword_in_headings", label: "Keyword in Headings", type: "bool", rec: (r) => r.keyword_in_headings ? "✓ Found in headings" : "Include keyword in at least one heading" },
  { key: "keyword_in_first_paragraph", label: "Keyword in Intro", type: "bool", rec: (r) => r.keyword_in_first_paragraph ? "✓ Found in first paragraph" : "Mention keyword naturally in the first paragraph" },
  { key: "internal_links", label: "Internal Links", type: "min", min: 1, unit: "links", rec: (r) => r.internal_links > 0 ? `✓ ${r.internal_links} internal link(s)` : "Add internal links to improve crawlability" },
  { key: "external_links", label: "External Links", type: "info", rec: (r) => r.external_links === 0 ? "Consider linking to authoritative sources" : `✓ ${r.external_links} external link(s)` },
  { key: "images_without_alt", label: "Images Missing ALT", type: "zero", rec: (r) => r.images_without_alt === 0 ? "✓ All images have alt text" : `Fix alt text on ${r.images_without_alt} image(s)` },
  { key: "readability_score", label: "Readability (Flesch)", type: "min", min: 60, unit: "", rec: (r) => r.readability_score >= 60 ? "✓ Easy to read" : r.readability_score >= 30 ? "Moderately difficult — simplify sentences" : "Very difficult — significantly simplify writing" },
]

function getStatus(metric, report) {
  const v = report[metric.key]
  if (metric.type === "bool") return v ? "pass" : "fail"
  if (metric.type === "range") return v >= metric.min && v <= metric.max ? "pass" : v > metric.max ? "warn" : "fail"
  if (metric.type === "min") return v >= metric.min ? "pass" : "fail"
  if (metric.type === "zero") return v === 0 ? "pass" : "fail"
  return "info"
}

const statusStyle = {
  pass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  fail: "text-red-400 bg-red-500/10 border-red-500/20",
  warn: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  info: "text-slate-400 bg-slate-700/30 border-slate-700",
}

const statusIcon = { pass: "✓", fail: "✗", warn: "!", info: "i" }

function ScoreBadge({ score }) {
  const color = score >= 70 ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
    : score >= 40 ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
    : "text-red-400 border-red-500/30 bg-red-500/10"
  return (
    <div className={`inline-flex flex-col items-center px-6 py-4 rounded-2xl border ${color}`}>
      <span className="text-5xl font-black">{score}</span>
      <span className="text-xs font-semibold tracking-widest uppercase opacity-70">/ 100</span>
    </div>
  )
}

export default function SingleReport({ data, API }) {
  const { report, keyword, url } = data
  const [aiSuggestions, setAiSuggestions] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  const getAISuggestions = async () => {
    setAiLoading(true)
    try {
      const res = await fetch(`${API}/ai-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report, keyword, url: url || "" }),
      })
      const data = await res.json()
      setAiSuggestions(data.suggestions)
    } catch (e) {
      setAiSuggestions("Failed to get AI suggestions. Please try again.")
    } finally {
      setAiLoading(false)
    }
  }

  const pass = METRICS.filter(m => getStatus(m, report) === "pass").length
  const fail = METRICS.filter(m => getStatus(m, report) === "fail").length
  const warn = METRICS.filter(m => getStatus(m, report) === "warn").length

  return (
    <div className="mt-8 space-y-6">
      {/* Score Header */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">SEO Report</h2>
            {url && <p className="text-slate-500 text-sm truncate max-w-md">{url}</p>}
            <p className="text-slate-500 text-sm">Keyword: <span className="text-emerald-400 font-medium">"{keyword}"</span></p>
            <div className="flex gap-4 mt-4 text-sm">
              <span className="text-emerald-400 font-semibold">{pass} passed</span>
              <span className="text-red-400 font-semibold">{fail} failed</span>
              {warn > 0 && <span className="text-amber-400 font-semibold">{warn} warnings</span>}
            </div>
          </div>
          <ScoreBadge score={report.score} />
        </div>
      </div>

      {/* Metrics Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="font-bold text-white text-sm uppercase tracking-widest">Detailed Checks</h3>
        </div>
        <div className="divide-y divide-slate-800">
          {METRICS.map((metric) => {
            const status = getStatus(metric, report)
            const value = report[metric.key]
            return (
              <div key={metric.key} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${statusStyle[status]}`}>
                  {statusIcon[status]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">{metric.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{metric.rec(report)}</p>
                </div>
                <span className="text-sm font-mono text-slate-300 flex-shrink-0">
                  {typeof value === "boolean" ? (value ? "Yes" : "No") : `${value}${metric.unit || ""}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white">✨ AI-Powered Suggestions</h3>
            <p className="text-slate-500 text-xs mt-1">Get rewrite suggestions for weak SEO elements</p>
          </div>
          <button
            onClick={getAISuggestions}
            disabled={aiLoading}
            className="px-4 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 text-sm font-semibold transition-all disabled:opacity-50"
          >
            {aiLoading ? "Generating..." : "Generate Suggestions"}
          </button>
        </div>
        {aiLoading && (
          <div className="flex items-center gap-3 text-slate-400 text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-slate-600 border-t-violet-400 animate-spin" />
            Analyzing with AI...
          </div>
        )}
        {aiSuggestions && (
          <div className="mt-2 p-4 rounded-xl bg-slate-800 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
            {aiSuggestions}
          </div>
        )}
      </div>

      {/* Download */}
      <div className="flex gap-3">
        {url && (
          <form method="post" action={`${API}/download_pdf`}>
            <input type="hidden" name="url" value={url} />
            <input type="hidden" name="keyword" value={keyword} />
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold border border-slate-700 transition-all">
              ⬇ Download PDF
            </button>
          </form>
        )}
      </div>
    </div>
  )
}