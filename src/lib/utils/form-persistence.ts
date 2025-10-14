/**
 * Form persistence utilities for maintaining form data across page reloads and tab switches
 */

export interface FormPersistenceOptions {
  key: string
  debounceMs?: number
  excludeFields?: string[]
}

export function useFormPersistence<T extends Record<string, unknown>>(
  formData: T,
  setFormData: (data: T) => void,
  options: FormPersistenceOptions
) {
  const { key, excludeFields = [] } = options

  // Save form data to localStorage
  const saveFormData = (data: T) => {
    try {
      const filteredData = Object.keys(data).reduce((acc, field) => {
        if (!excludeFields.includes(field)) {
          (acc as Record<string, unknown>)[field] = data[field]
        }
        return acc
      }, {} as Partial<T>)
      
      localStorage.setItem(key, JSON.stringify(filteredData))
    } catch {
      // Ignore error - localStorage might not be available
    }
  }

  // Load form data from localStorage
  const loadFormData = (): Partial<T> | null => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // Ignore error - localStorage might not be available
    }
    return null
  }

  // Clear saved form data
  const clearSavedData = () => {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore error - localStorage might not be available
    }
  }

  // Check if there's saved data available
  const hasSavedData = (): boolean => {
    try {
      return localStorage.getItem(key) !== null
    } catch {
      return false
    }
  }

  return {
    saveFormData,
    loadFormData,
    clearSavedData,
    hasSavedData
  }
}

// React hook for automatic form persistence
import { useEffect, useRef } from 'react'

export function useAutoFormPersistence<T extends Record<string, unknown>>(
  formData: T,
  setFormData: (data: T) => void,
  options: FormPersistenceOptions
) {
  const { saveFormData, loadFormData, clearSavedData, hasSavedData } = useFormPersistence(formData, setFormData, options)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const hasLoadedRef = useRef(false)

  // Load saved data on mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      const saved = loadFormData()
      if (saved && Object.keys(saved).length > 0) {
        setFormData({ ...formData, ...saved })
      }
      hasLoadedRef.current = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Save data on changes (debounced)
  useEffect(() => {
    if (hasLoadedRef.current && formData) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      
      debounceRef.current = setTimeout(() => {
        saveFormData(formData)
      }, options.debounceMs || 500)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
    }
  }, [formData, options.debounceMs, saveFormData])

  // Save data before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      saveFormData(formData)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
          debounceRef.current = null
        }
        saveFormData(formData)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [formData, saveFormData])

  return {
    clearSavedData,
    hasSavedData,
    loadFormData
  }
}