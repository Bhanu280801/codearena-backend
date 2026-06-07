import { api } from "../../../lib/axios"

export interface Problem {
  id: number;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  constraints?: string | null;
  inputFormat?: string | null;
  outputFormat?: string | null;
  tags: string[];
  sampleInput?: string | null;
  sampleOutput?: string | null;
  executionMode?: "STDIN" | "FUNCTION";
  functionName?: string | null;
  testCases?: Array<{
    input?: string;
    output?: string;
    isHidden?: boolean;
  }>;
  isPublished?: boolean;
  timeLimitMs?: number;
  memoryLimitMb?: number;
}

export type ProblemPayload = Omit<Problem, "id"> & {
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  testCases: NonNullable<Problem["testCases"]>;
};

export const problemsApi = {
  getAll: async (): Promise<Problem[]> => {
    const response = await api.get("/problems")
    return response.data
  },

  getById: async (id: string): Promise<Problem> => {
    const response = await api.get(`/problems/${id}`)
    return response.data
  },

  create: async (payload: ProblemPayload): Promise<{ message: string; problem: Problem }> => {
    const response = await api.post("/problems", payload)
    return response.data
  },

  update: async (id: number, payload: Partial<ProblemPayload>): Promise<{ message: string; problem: Problem }> => {
    const response = await api.put(`/problems/${id}`, payload)
    return response.data
  },

  remove: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/problems/${id}`)
    return response.data
  }
}
