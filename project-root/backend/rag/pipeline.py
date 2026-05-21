"""
RAG (Retrieval Augmented Generation) pipeline.

Handles PDF ingestion, chunking, embedding via OpenAI,
storage in ChromaDB, and context-aware question answering.
"""

import os
import uuid
from typing import List, Dict, Optional

from config import settings


class RAGPipeline:
    """Document ingestion and retrieval-augmented generation pipeline."""

    def __init__(self):
        self._collection_name = "career_mentor_docs"
        self._client = None
        self._collection = None
        self._embeddings = None

    def _ensure_initialized(self):
        """Lazy-initialize ChromaDB and embeddings."""
        if self._client is None:
            try:
                import chromadb
                persist_dir = settings.CHROMA_PERSIST_DIR
                os.makedirs(persist_dir, exist_ok=True)
                self._client = chromadb.PersistentClient(path=persist_dir)
                self._collection = self._client.get_or_create_collection(
                    name=self._collection_name,
                    metadata={"hnsw:space": "cosine"},
                )
            except Exception as e:
                raise RuntimeError(f"Failed to initialize ChromaDB: {e}")

    def _get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using OpenAI."""
        try:
            import openai
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input=texts,
            )
            return [item.embedding for item in response.data]
        except Exception:
            # Fallback: return simple hash-based mock embeddings for development
            import hashlib
            embeddings = []
            for text in texts:
                h = hashlib.sha256(text.encode()).hexdigest()
                vec = [int(h[i:i+2], 16) / 255.0 for i in range(0, min(len(h), 128), 2)]
                vec.extend([0.0] * (64 - len(vec)))  # Pad to 64 dims
                embeddings.append(vec[:64])
            return embeddings

    def ingest_pdf(self, file_path: str, doc_name: str = "") -> Dict:
        """Load a PDF, split into chunks, embed, and store in ChromaDB."""
        self._ensure_initialized()

        # Extract text
        try:
            import fitz
            doc = fitz.open(file_path)
            full_text = ""
            for page in doc:
                full_text += page.get_text() + "\n"
            doc.close()
        except Exception as e:
            raise RuntimeError(f"Failed to read PDF: {e}")

        # Split into chunks
        chunks = self._split_text(full_text, chunk_size=500, overlap=50)
        if not chunks:
            return {"status": "error", "message": "No text extracted from PDF"}

        # Generate embeddings
        embeddings = self._get_embeddings(chunks)

        # Store in ChromaDB
        doc_id = str(uuid.uuid4())
        ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
        metadatas = [
            {"doc_id": doc_id, "doc_name": doc_name or os.path.basename(file_path), "chunk_index": i}
            for i in range(len(chunks))
        ]

        self._collection.add(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        return {
            "status": "success",
            "doc_id": doc_id,
            "doc_name": doc_name or os.path.basename(file_path),
            "chunks_count": len(chunks),
        }

    def query(self, question: str, k: int = 5) -> Dict:
        """Retrieve relevant chunks and generate an answer."""
        self._ensure_initialized()

        # Get question embedding
        q_embedding = self._get_embeddings([question])[0]

        # Query ChromaDB
        results = self._collection.query(
            query_embeddings=[q_embedding],
            n_results=k,
        )

        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]

        if not documents:
            return {
                "answer": "No relevant documents found. Please upload some PDFs first.",
                "sources": [],
            }

        # Build context
        context = "\n\n---\n\n".join(documents)

        # Generate answer with LLM
        answer = self._generate_answer(question, context)

        sources = [
            {"doc_name": m.get("doc_name", "Unknown"), "chunk_index": m.get("chunk_index", 0)}
            for m in metadatas
        ]

        return {"answer": answer, "sources": sources}

    def _generate_answer(self, question: str, context: str) -> str:
        """Use OpenAI to answer the question based on retrieved context."""
        prompt = f"""Based on the following context, answer the question accurately.
If the context doesn't contain relevant information, say so.

Context:
{context}

Question: {question}

Answer:"""

        try:
            import openai
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful knowledge assistant. Answer based on the provided context."},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=800,
                temperature=0.3,
            )
            return response.choices[0].message.content
        except Exception:
            return (
                f"Based on the retrieved documents, here's a summary:\n\n"
                f"{context[:500]}...\n\n"
                f"(Full AI-generated answer unavailable — API key may not be configured)"
            )

    def list_documents(self) -> List[Dict]:
        """List all ingested documents."""
        self._ensure_initialized()
        try:
            all_data = self._collection.get()
            docs = {}
            for meta in (all_data.get("metadatas") or []):
                doc_id = meta.get("doc_id", "unknown")
                if doc_id not in docs:
                    docs[doc_id] = {
                        "doc_id": doc_id,
                        "doc_name": meta.get("doc_name", "Unknown"),
                        "chunks": 0,
                    }
                docs[doc_id]["chunks"] += 1
            return list(docs.values())
        except Exception:
            return []

    @staticmethod
    def _split_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Split text into overlapping chunks."""
        words = text.split()
        chunks = []
        start = 0
        while start < len(words):
            end = start + chunk_size
            chunk = " ".join(words[start:end])
            if chunk.strip():
                chunks.append(chunk.strip())
            start = end - overlap
        return chunks
