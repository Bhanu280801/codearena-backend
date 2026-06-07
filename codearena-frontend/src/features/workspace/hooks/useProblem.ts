import { useQuery } from "@tanstack/react-query"
import { problemsApi } from "../api/problems"

export const useProblem = (id: string) => {
  return useQuery({
    queryKey: ["problem", id],
    queryFn: () => problemsApi.getById(id),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes to avoid frequent refetches
    retry: 1,
  })
}

export const useAllProblems = () => {
  return useQuery({
    queryKey: ["problems"],
    queryFn: problemsApi.getAll,
    staleTime: 1000 * 60 * 5,
  })
}
