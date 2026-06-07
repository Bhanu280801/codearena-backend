import { useMutation, useQueryClient } from "@tanstack/react-query"
import { submissionsApi } from "../api/submissions"
import type { SubmitPayload } from "../api/submissions"
import { useSubmissionStore } from "../store/submission.store"
import { toast } from "sonner"

const POLL_INTERVAL = 1500
const MAX_POLLS = 30

export const useSubmission = () => {
  const queryClient = useQueryClient()
  const { setStatus, setResult, reset } = useSubmissionStore()

  const pollStatus = async (submissionId: string) => {
    let polls = 0

    const poll = async (): Promise<void> => {
      if (polls >= MAX_POLLS) {
        setStatus("time_limit_exceeded")
        toast.error("Execution timed out. Please try again.")
        return
      }

      polls += 1
      const result = await submissionsApi.getStatus(submissionId)

      const terminalStatuses = [
        "accepted",
        "wrong_answer",
        "runtime_error",
        "time_limit_exceeded",
        "compilation_error",
        "system_error",
      ]

      if (terminalStatuses.includes(result.status)) {
        setResult(result)

        if (result.status === "accepted") {
          toast.success("All test cases passed!")
        } else if (result.status === "wrong_answer") {
          toast.error("Wrong Answer - check your logic.")
        } else if (result.status === "compilation_error") {
          toast.error("Compilation Error - check your syntax.")
        } else {
          toast.error(result.status.replace(/_/g, " "))
        }

        await queryClient.invalidateQueries({ queryKey: ["submissions", "problem"] })
        return
      }

      setStatus(result.status)
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
      return poll()
    }

    return poll()
  }

  const mutation = useMutation({
    mutationFn: (payload: SubmitPayload) => submissionsApi.submit(payload),
    onMutate: () => {
      reset()
      setStatus("queued")
    },
    onSuccess: async ({ submissionId }) => {
      setStatus("processing")
      await pollStatus(submissionId)
    },
    onError: (error: Error) => {
      setStatus("idle")
      toast.error(error.message || "Failed to submit code.")
    },
  })

  const liveStatus = useSubmissionStore((state) => state.status)

  return {
    submit: mutation.mutate,
    isSubmitting: mutation.isPending || ["queued", "processing"].includes(liveStatus),
  }
}
