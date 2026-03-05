import { useState } from "react"

export default function AnalyzerForm({ onAnalyze, loading }) {
  const [mode, setMode] = useState("single")
  const [url, setUrl] = useState("")
  const [rawContent, setRawContent] = useState("")
  const [url1, setUrl1] = useState("")
  const [url2, setUrl2] = useState("")
  const [keyword, setKeyword] = useState("")
  const [inputType, setInputType] = useState("url")

  const handleSubmit = () => {
    const formData = new FormData()
    formData.append("mode", mode)
    formData.append("keyword", keyword)
    if (mode === "single") {
      if (inputType === "url") formData.append("url", url)
      else formData.append("raw_content", rawContent)
    } else {
      formData.append("url1", url1)
      formData.append("url2", url2)
    }
    onAnalyze(formData)
  }

  const inputClass = "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm"
  const labelClass = "block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2"

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
          Analyze Your <span className="text-emerald-400">SEO</span>
        </h1>
        <p className="text-slate-400 text-sm">Get a detailed SEO health report with actionable recommendations</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-8 p-1 bg-slate-800 rounded-xl w-fit">
        {["single", "compare"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              mode === m
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {m === "single" ? "🔍 Single Page" : "⚖️ Compare"}
          </button>
        ))}
      </div>

      {/* Single Mode */}
      {mode === "single" && (
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            {["url", "html"].map((t) => (
              <button
                key={t}
                onClick={() => setInputType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all uppercase tracking-wide ${
                  inputType === t
                    ? "bg-slate-700 text-white border border-slate-600"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {t === "url" ? "🔗 URL" : "</> Raw HTML"}
              </button>
            ))}
          </div>

          {inputType === "url" ? (
            <div>
              <label className={labelClass}>Page URL</label>
              <input
                type="text"
                className={inputClass}
                placeholder="https://example.com/blog-post"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={labelClass}>Raw HTML</label>
              <textarea
                className={inputClass + " resize-none"}
                rows={6}
                placeholder="Paste your full HTML here..."
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* Compare Mode */}
      {mode === "compare" && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className={labelClass}>URL 1</label>
            <input type="text" className={inputClass} placeholder="https://yoursite.com" value={url1} onChange={(e) => setUrl1(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>URL 2</label>
            <input type="text" className={inputClass} placeholder="https://competitor.com" value={url2} onChange={(e) => setUrl2(e.target.value)} />
          </div>
        </div>
      )}

      {/* Keyword */}
      <div className="mb-6">
        <label className={labelClass}>Target Keyword</label>
        <input
          type="text"
          className={inputClass}
          placeholder="e.g. digital marketing strategy"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Analyzing..." : "Analyze Now →"}
      </button>
    </div>
  )
}