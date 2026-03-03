import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type FocusSessionInput } from "@shared/routes";

// ============================================================================
// DATA FETCHING HOOKS
// These hooks use TanStack Query to communicate with our backend API.
// ============================================================================

/**
 * Hook to fetch all completed focus sessions.
 */
export function useSessions() {
  return useQuery({
    // The queryKey uniquely identifies this data in the cache
    queryKey: [api.sessions.list.path],
    queryFn: async () => {
      const res = await fetch(api.sessions.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch focus sessions");
      
      // We parse the JSON response against the Zod schema defined in our API contract
      const data = await res.json();
      return api.sessions.list.responses[200].parse(data);
    },
  });
}

/**
 * Hook to create a new focus session when the timer completes.
 */
export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (session: FocusSessionInput) => {
      // Validate input before sending to server
      const validatedData = api.sessions.create.input.parse(session);
      
      const res = await fetch(api.sessions.create.path, {
        method: api.sessions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to log focus session");
      }
      
      return api.sessions.create.responses[201].parse(await res.json());
    },
    // When the mutation succeeds, we tell the cache to refetch the list
    // so our stats update immediately!
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sessions.list.path] });
    },
  });
}
