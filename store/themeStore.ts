import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
}

export const useTheme = create<ThemeState>(
  persist(
    (set: any) => ({
      isDark: false,
      toggleTheme: () =>
        set((state: ThemeState) => {
          const newIsDark = !state.isDark
          if (newIsDark) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return { isDark: newIsDark }
        }),
      setTheme: (isDark: any) =>
        set({
          isDark,
        }),
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state: ThemeState | undefined) => {
        if (state?.isDark) {
          document.documentElement.classList.add('dark')
        }
      },
    }
  ) as any
)
