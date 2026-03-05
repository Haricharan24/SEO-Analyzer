const METRIC_LABELS = {
  score: "Overall Score", title_present: "Title Present", title_length: "Title Length",
  meta_present: "Meta Present", meta_length: "Meta Length", word_count: "Word Count",
  h1_present: "H1 Present", hierarchy_ok: "Heading Hierarchy", keyword_density: "Keyword Density (%)",
  keyword_in_title: "Keyword in Title", keyword_in_headings: "Keyword in Headings",
  keyword_in_first_paragraph: "Keyword in Intro", internal_links: "Internal Links",
  external_links: "External Links", images_without_alt: "Images Missing ALT",
  readability_score: "Readability Score",
}

const HIGHER_IS_BETTER = ["score", "title_present", "meta_present", "word_count", "h1_present",
  "hierarchy_ok", "keyword_in_title", "keyword_in_headings", "keyword_in_first_paragraph",
  "internal_links", "external_links", "readability_score"]

const LOWER_IS_BETTER = ["images_without_alt"]

function getCellStyle(key, v1, v2) {
  if (typeof v1 !== "number" && typeof v1 !== "boolean") return ""
  const n1 = typeof v1 === "boolean" ? (v1 ? 1 : 0) : v1
  const n2 = typeof v2 === "boolean" ? (v2 ? 1 : 0) : v2
  if (n1 === n2) return ""
  const firstWins = HIGHER_IS_BETTER.includes(key) ? n1 > n2 : LOWER_IS_BETTER.includes(key) ? n1 < n2 : false
  return firstWins ? "win" : "lose"
}

export default function CompareReport({ data, API }) {
  const { report1, report2, url1, url2, keyword } = data

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
        <h2 className="text-xl font-bold text-white mb-1">Compare Results</h2>
        <p className="text-slate-500 text-sm">Keyword: <span className="text-emerald-400 font-medium">"{keyword}"</span></p>
        <div className="flex gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/40 inline-block" /> Better</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/40 inline-block" /> Worse</span>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-4 text-slate-400 font-semibold uppercase tracking-widest text-xs w-1/3">Metric</th>
              <th className="text-left px-6 py-4 text-slate-300 font-semibold text-xs truncate max-w-[180px]">{url1}</th>
              <th className="text-left px-6 py-4 text-slate-300 font-semibold text-xs truncate max-w-[180px]">{url2}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {Object.keys(report1).map((key) => {
              const v1 = report1[key]
              const v2 = report2[key]
              const s1 = getCellStyle(key, v1, v2)
              const s2 = getCellStyle(key, v2, v1)
              const fmt = (v) => typeof v === "boolean" ? (v ? "✓ Yes" : "✗ No") : String(v)
              return (
                <tr key={key} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3.5 text-slate-400 font-medium">{METRIC_LABELS[key] || key}</td>
                  <td className={`px-6 py-3.5 font-semibold rounded-l ${
                    s1 === "win" ? "text-emerald-400 bg-emerald-500/5"
                    : s1 === "lose" ? "text-red-400 bg-red-500/5"
                    : "text-slate-300"
                  }`}>{fmt(v1)}</td>
                  <td className={`px-6 py-3.5 font-semibold ${
                    s2 === "win" ? "text-emerald-400 bg-emerald-500/5"
                    : s2 === "lose" ? "text-red-400 bg-red-500/5"
                    : "text-slate-300"
                  }`}>{fmt(v2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <form method="post" action={`${API}/download_compare_pdf`}>
        <input type="hidden" name="url1" value={url1} />
        <input type="hidden" name="url2" value={url2} />
        <input type="hidden" name="keyword" value={keyword} />
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold border border-slate-700 transition-all">
          ⬇ Download Compare PDF
        </button>
      </form>
    </div>
  )
}