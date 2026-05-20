import { useEffect, useState } from 'react'
import { useTheme } from '@/store/themeStore'

export function useThemeEffect() {
  const { isDark, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Apply theme on mount
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return { isDark, toggleTheme, mounted }
}
