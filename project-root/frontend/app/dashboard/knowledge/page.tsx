"use client";

import { useState, useEffect } from "react";
import FileUpload from "../../components/FileUpload";
import { api } from "@/lib/api";

const suggestedQuestions = [
  "Explain the central time complexity of QuickSort vs MergeSort.",
  "What are the ACID properties in database management systems?",
  "How does index optimization improve PostgreSQL query performance?",
  "Briefly outline the key difference between OSI model layers.",
];

export default function KnowledgePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  
  const [documents, setDocuments] = useState<any[]>([]);
  
  
  const [queryText, setQueryText] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  useEffect(() => {
    async function loadDocs() {
      try {
        const docs = await api.listDocuments();
        setDocuments(docs);
      } catch (err) {
        console.error("Failed to load ingested documents:", err);
      }
    }
    loadDocs();
  }, [loading]);

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.ingestDocument(file);
      alert(`Successfully ingested: ${res.doc_name} (${res.chunks} chunks stored)`);
      
      
      const docs = await api.listDocuments();
      setDocuments(docs);
    } catch (err: any) {
      setError(err.message || "Failed to upload document. Please ensure PDF content is extractable.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (question: string) => {
    if (!question.trim() || searching) return;
    setQueryText(question);
    setSearching(true);
    setSearchResult(null);
    setError(null);

    try {
      const res = await api.queryRAG(question);
      setSearchResult(res);
    } catch (err: any) {
      setError(err.message || "RAG search failed. Please verify if you have ingested documents.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          PDF Knowledge <span className="gradient-text">RAG Assistant</span>
        </h1>
        <p className="text-sm text-muted mt-1.5">
          Upload placement syllabus PDFs, textbook guides, or cheatsheets and search them instantly with context-aware RAG pipelines.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger font-medium animate-pulse">
          ⚠️ {error}
        </div>
      )}

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-2xl p-6 border-white/5 space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Ingest PDF Document
            </h2>
            <FileUpload
              onFileSelect={handleFileSelect}
              label="Ingest placement cheatsheet (.pdf)"
            />
            {loading && (
              <div className="flex items-center gap-2.5 justify-center py-2 text-xs text-primary font-medium animate-pulse">
                <span className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                Parsing & chunking vector data...
              </div>
            )}
          </div>

          {}
          <div className="glass rounded-2xl p-6 border-white/5 space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Active Knowledge Base ({documents.length})
            </h2>
            {documents.length === 0 ? (
              <p className="text-xs text-muted">No documents uploaded yet. Try uploading a PDF to search.</p>
            ) : (
              <div className="space-y-2.5 max-h-[250px] overflow-y-auto">
                {documents.map((d) => (
                  <div key={d.doc_id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-white truncate max-w-[150px]">{d.doc_name}</span>
                    <span className="text-[10px] text-muted">{d.chunks} chunks</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-6 sm:p-8 border-white/5 space-y-6">
            <h2 className="text-lg font-bold text-white">Ask Ingested Documents</h2>
            
            {}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(queryText)}
                placeholder="Ask a technical or syllabus concept from your files..."
                className="flex-1 px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-premium text-sm"
              />
              <button
                onClick={() => handleSearch(queryText)}
                disabled={searching || !queryText.trim()}
                className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-dark disabled:bg-primary/40 text-white font-bold text-sm shadow-lg transition-premium hover:scale-[1.01] active:scale-[0.99]"
              >
                {searching ? "Searching..." : "Search 🔍"}
              </button>
            </div>

            {}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">Suggested Queries</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(q)}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] text-[10px] font-semibold text-muted hover:text-white transition-premium text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {}
            {searchResult && (
              <div className="border-t border-white/5 pt-6 space-y-6 animate-fade-in-up">
                
                {}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-semibold text-accent uppercase tracking-wider">Answer Context</h3>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-sm leading-relaxed text-muted prose prose-invert max-w-none">
                    {searchResult.answer}
                  </div>
                </div>

                {}
                {searchResult.sources?.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] font-semibold text-white uppercase tracking-wider">Citations ({searchResult.sources.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {searchResult.sources.map((src: any, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded bg-[#0a0a0f] border border-white/5 text-[10px] font-semibold text-muted">
                          📂 {src.doc_name} (chunk {src.chunk_index})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
