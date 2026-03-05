import { useState, useEffect } from "react"

export default function History({ API }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    fetch(`${API}/history`)
      .then((r) => r.json())
      .then((d) => { setHistory(d.history || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const toggle = (id) => setExpanded(expanded === id ? null : id)

  const ScoreBadge = ({ score }) => {
    const color = score >= 70 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : score >= 40 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
      : "text-red-400 bg-red-500/10 border-red-500/20"
    return <span className={`px-2 py-0.5 rounded-lg border text-xs font-bold ${color}`}>{score}/100</span>
  }

  if (loading) return (
    <div className="flex justify-center items-center py-20 text-slate-400">
      <div className="w-8 h-8 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin mr-3" />
      Loading history...
    </div>
  )

  if (!history.length) return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center">
      <p className="text-4xl mb-4">📭</p>
      <p className="text-slate-400">No analyses yet. Run your first analysis to see history here.</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
        <h2 className="text-xl font-bold text-white">Analysis History</h2>
        <p className="text-slate-500 text-sm mt-1">Last 20 analyses — click any row to expand</p>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="divide-y divide-slate-800">
          {history.map((item) => {
            const isCompare = !!item.url2
            const report = item.report
            const score = isCompare ? report?.["URL 1"]?.score : report?.score
            const isOpen = expanded === item.id

            return (
              <div key={item.id}>
                <div
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                  onClick={() => toggle(item.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {item.url1 || "Raw HTML"}{item.url2 ? ` vs ${item.url2}` : ""}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.timestamp} · Keyword: <span className="text-slate-400">{item.keyword}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isCompare
                      ? <span className="px-2 py-0.5 rounded-lg border text-xs font-bold text-violet-400 bg-violet-500/10 border-violet-500/20">Compare</span>
                      : score !== undefined && <ScoreBadge score={score} />
                    }
                    <span className="text-slate-500 text-xs">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-6 pb-6 bg-slate-800/20">
                    {!isCompare && report && (
                      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden mt-2">
                        <table className="w-full text-sm">
                          <thead><tr className="border-b border-slate-800"><th className="text-left px-4 py-3 text-slate-400 text-xs uppercase tracking-widest">Check</th><th className="text-left px-4 py-3 text-slate-400 text-xs uppercase tracking-widest">Result</th></tr></thead>
                          <tbody className="divide-y divide-slate-800">
                            {Object.entries(report).map(([k, v]) => (
                              <tr key={k} className="hover:bg-slate-800/30">
                                <td className="px-4 py-2.5 text-slate-400 capitalize">{k.replace(/_/g, " ")}</td>
                                <td className="px-4 py-2.5 text-slate-200 font-medium">{typeof v === "boolean" ? (v ? "✓ Yes" : "✗ No") : String(v)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {isCompare && report?.["URL 1"] && (
                      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden mt-2">
                        <table className="w-full text-sm">
                          <thead><tr className="border-b border-slate-800"><th className="text-left px-4 py-3 text-slate-400 text-xs">Metric</th><th className="text-left px-4 py-3 text-slate-400 text-xs">URL 1</th><th className="text-left px-4 py-3 text-slate-400 text-xs">URL 2</th></tr></thead>
                          <tbody className="divide-y divide-slate-800">
                            {Object.keys(report["URL 1"]).map((k) => (
                              <tr key={k}>
                                <td className="px-4 py-2.5 text-slate-400 capitalize">{k.replace(/_/g, " ")}</td>
                                <td className="px-4 py-2.5 text-slate-200">{String(report["URL 1"][k])}</td>
                                <td className="px-4 py-2.5 text-slate-200">{String(report["URL 2"][k])}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}