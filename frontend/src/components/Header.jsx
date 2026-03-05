export default function Header({ page, setPage, setResult, setError }) {
  const nav = (p) => {
    setPage(p)
    setResult(null)
    setError(null)
  }

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-sm">S</div>
          <span className="font-bold text-lg tracking-tight text-white">SEO<span className="text-emerald-400">Analyzer</span></span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Pro</span>
        </div>
        <nav className="flex gap-1">
          <button
            onClick={() => nav("analyzer")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              page === "analyzer"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            🔍 Analyzer
          </button>
          <button
            onClick={() => nav("history")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              page === "history"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            📋 History
          </button>
        </nav>
      </div>
    </header>
  )
}