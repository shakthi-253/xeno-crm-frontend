import { create } from 'zustand'
import type { CopilotResponse } from '../types'

interface AppState {
  currentCopilotResponse: CopilotResponse | null
  isCopilotLoading: boolean
  setCopilotResponse: (response: CopilotResponse) => void
  setCopilotLoading: (loading: boolean) => void
  clearCopilotResponse: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentCopilotResponse: null,
  isCopilotLoading: false,

  setCopilotResponse: (response) => {
    set({ currentCopilotResponse: response })
  },

  setCopilotLoading: (loading) => {
    set({ isCopilotLoading: loading })
  },

  clearCopilotResponse: () => {
    set({ currentCopilotResponse: null })
  },
}))