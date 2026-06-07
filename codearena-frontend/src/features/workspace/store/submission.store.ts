import { create } from "zustand"
import type { SubmissionState, SubmissionStatus } from "../types/submission"
import type { SubmissionResult } from "../types/submission"

interface SubmissionStore extends SubmissionState {
  setStatus: (status: SubmissionStatus) => void
  setResult: (result: SubmissionResult) => void
  reset: () => void
}

export const useSubmissionStore = create<SubmissionStore>((set) => ({
  status: "idle",
  result: null,
  setStatus: (status) => set({ status }),
  setResult: (result) => set({ result, status: result.status }),
  reset: () => set({ status: "idle", result: null }),
}))
