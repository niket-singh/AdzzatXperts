import { useState, useCallback } from 'react'

interface OptimisticMutationOptions<T, R> {
  mutationFn: (data: T) => Promise<R>
  onSuccess?: (result: R) => void
  onError?: (error: Error) => void
  onOptimisticUpdate?: (data: T) => void
  onRevert?: () => void
}

export function useOptimisticMutation<T, R>({
  mutationFn,
  onSuccess,
  onError,
  onOptimisticUpdate,
  onRevert,
}: OptimisticMutationOptions<T, R>) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(
    async (data: T) => {
      setIsLoading(true)
      setError(null)

      // Optimistic update
      if (onOptimisticUpdate) {
        onOptimisticUpdate(data)
      }

      try {
        const result = await mutationFn(data)

        if (onSuccess) {
          onSuccess(result)
        }

        return result
      } catch (err) {
        const error = err as Error
        setError(error)

        // Revert optimistic update on error
        if (onRevert) {
          onRevert()
        }

        if (onError) {
          onError(error)
        }

        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [mutationFn, onSuccess, onError, onOptimisticUpdate, onRevert]
  )

  return { mutate, isLoading, error }
}

// Example usage helpers for common operations
export const useOptimisticDelete = <T extends { id: string }>(
  items: T[],
  setItems: (items: T[]) => void,
  deleteFn: (id: string) => Promise<void>
) => {
  return useOptimisticMutation({
    mutationFn: async (id: string) => {
      await deleteFn(id)
    },
    onOptimisticUpdate: (id: string) => {
      // Immediately remove from UI
      setItems(items.filter((item) => item.id !== id))
    },
    onRevert: () => {
      // Revert on error - could store original state
      // For now, this would require a refetch
    },
  })
}

export const useOptimisticUpdate = <T extends { id: string }>(
  items: T[],
  setItems: (items: T[]) => void,
  updateFn: (id: string, updates: Partial<T>) => Promise<T>
) => {
  let originalItem: T | null = null

  return useOptimisticMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<T> }) => {
      return await updateFn(id, updates)
    },
    onOptimisticUpdate: ({ id, updates }: { id: string; updates: Partial<T> }) => {
      // Store original for revert
      originalItem = items.find((item) => item.id === id) || null

      // Immediately update in UI
      setItems(
        items.map((item) => (item.id === id ? { ...item, ...updates } : item))
      )
    },
    onRevert: () => {
      // Restore original item on error
      if (originalItem) {
        setItems(
          items.map((item) => (item.id === originalItem!.id ? originalItem! : item))
        )
      }
    },
  })
}

export const useOptimisticCreate = <T extends { id?: string }>(
  items: T[],
  setItems: (items: T[]) => void,
  createFn: (data: Omit<T, 'id'>) => Promise<T>
) => {
  return useOptimisticMutation({
    mutationFn: async (data: Omit<T, 'id'>) => {
      return await createFn(data)
    },
    onOptimisticUpdate: (data: Omit<T, 'id'>) => {
      // Add with temporary ID
      const tempItem = { ...data, id: `temp-${Date.now()}` } as T
      setItems([...items, tempItem])
    },
    onSuccess: (result: T) => {
      // Replace temp item with real one
      setItems(
        items.map((item) => (item.id?.startsWith('temp-') ? result : item))
      )
    },
    onRevert: () => {
      // Remove temp item on error
      setItems(items.filter((item) => !item.id?.startsWith('temp-')))
    },
  })
}
