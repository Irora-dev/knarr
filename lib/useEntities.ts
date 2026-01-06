'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './auth'
import { EntityOperations, settingsOps } from './entities'

export function useEntities<T extends Record<string, unknown>>(
  operations: EntityOperations<T>
) {
  const { user } = useAuth()
  const [data, setData] = useState<(T & { id: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Use a fallback user ID for localStorage mode
  const userId = user?.id || 'local-user'

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const items = await operations.getAll(userId)
      setData(items)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [operations, userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(async (item: T) => {
    try {
      const created = await operations.create(userId, item)
      setData(prev => [created, ...prev])
      return created
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'))
      throw e
    }
  }, [operations, userId])

  const update = useCallback(async (id: string, updates: Partial<T>) => {
    try {
      const updated = await operations.update(id, updates)
      setData(prev => prev.map(item => item.id === id ? updated : item))
      return updated
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'))
      throw e
    }
  }, [operations])

  const remove = useCallback(async (id: string) => {
    try {
      await operations.delete(id)
      setData(prev => prev.filter(item => item.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'))
      throw e
    }
  }, [operations])

  const query = useCallback(async (filter: (item: T & { id: string }) => boolean) => {
    try {
      return await operations.query(userId, filter)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'))
      throw e
    }
  }, [operations, userId])

  return {
    data,
    isLoading,
    error,
    refresh,
    create,
    update,
    remove,
    query,
  }
}

// Hook for settings
export function useSetting<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    settingsOps.get(key, defaultValue).then(v => {
      setValue(v)
      setIsLoading(false)
    })
  }, [key, defaultValue])

  const set = useCallback(async (newValue: T) => {
    await settingsOps.set(key, newValue)
    setValue(newValue)
  }, [key])

  return { value, set, isLoading }
}
