

const BASE_URL = "http://localhost:8000/api";

function getHeaders(isMultipart = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("career_mentor_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

export const api = {
  
  async register(name: string, email: string, password: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    const data = await handleResponse<any>(res);
    if (data.access_token) {
      localStorage.setItem("career_mentor_token", data.access_token);
      localStorage.setItem("career_mentor_user", JSON.stringify(data.user));
    }
    return data;
  },

  async login(email: string, password: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse<any>(res);
    if (data.access_token) {
      localStorage.setItem("career_mentor_token", data.access_token);
      localStorage.setItem("career_mentor_user", JSON.stringify(data.user));
    }
    return data;
  },

  logout(): void {
    localStorage.removeItem("career_mentor_token");
    localStorage.removeItem("career_mentor_user");
  },

  getUser(): any {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("career_mentor_user");
      return u ? JSON.parse(u) : null;
    }
    return null;
  },

  
  async uploadResume(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await fetch(`${BASE_URL}/resume/upload`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse<any>(res);
  },

  async analyzeResume(resumeId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/resume/analyze/${resumeId}`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async getResumeHistory(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/resume/history`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  
  async sendChatMessage(message: string, sessionId?: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/chat/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ message, session_id: sessionId }),
    });
    return handleResponse<any>(res);
  },

  async getChatHistory(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/chat/history`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  
  async ingestDocument(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/rag/ingest`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse<any>(res);
  },

  async queryRAG(question: string, k = 5): Promise<any> {
    const res = await fetch(`${BASE_URL}/rag/query`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ question, k }),
    });
    return handleResponse<any>(res);
  },

  async listDocuments(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/rag/documents`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  
  async startInterview(interviewType: string, role?: string, skills?: string[]): Promise<any> {
    const res = await fetch(`${BASE_URL}/interview/start`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ interview_type: interviewType, role, skills }),
    });
    return handleResponse<any>(res);
  },

  async evaluateAnswers(interviewId: string, answers: string[], videoStream = false, audioStream = false): Promise<any> {
    const res = await fetch(`${BASE_URL}/interview/evaluate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        interview_id: interviewId,
        answers,
        video_stream_present: videoStream,
        audio_stream_present: audioStream
      }),
    });
    return handleResponse<any>(res);
  },

  async getInterviewHistory(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/interview/history`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  
  async generateRoadmap(goal: string, skills?: string[], durationWeeks = 8): Promise<any> {
    const res = await fetch(`${BASE_URL}/agents/roadmap`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ goal, skills, duration_weeks: durationWeeks }),
    });
    return handleResponse<any>(res);
  },

  async getRoadmap(roadmapId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/agents/roadmap/${roadmapId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  }
};
