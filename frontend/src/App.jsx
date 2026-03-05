import { useState } from "react"
import Header from "./components/Header"
import AnalyzerForm from "./components/AnalyzerForm"
import SingleReport from "./components/SingleReport"
import CompareReport from "./components/CompareReport"
import History from "./components/History"

export default function App() {
  const [page, setPage] = useState("analyzer")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

  const handleAnalyze = async (formData) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API}/analyze`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Analysis failed")
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header page={page} setPage={setPage} setResult={setResult} setError={setError} />
      <main className="max-w-5xl mx-auto px-4 py-10">
        {page === "analyzer" && (
          <>
            <AnalyzerForm onAnalyze={handleAnalyze} loading={loading} />
            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium">
                ⚠️ {error}
              </div>
            )}
            {loading && (
              <div className="mt-10 flex flex-col items-center gap-4 text-slate-400">
                <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin" />
                <p className="text-sm tracking-widest uppercase">Analyzing page...</p>
              </div>
            )}
            {result && !loading && (
              result.mode === "compare"
                ? <CompareReport data={result} API={API} />
                : <SingleReport data={result} API={API} />
            )}
          </>
        )}
        {page === "history" && <History API={API} />}
      </main>
    </div>
  )
}