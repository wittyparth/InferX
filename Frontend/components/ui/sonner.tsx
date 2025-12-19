'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

/**
 * Premium Toast Notification Component
 * 
 * Clean, consistent styling that matches the design system.
 * Subtle animations, proper contrast, minimal but effective.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: 'group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg',
          title: 'group-[.toast]:font-medium group-[.toast]:text-foreground',
          description: 'group-[.toast]:text-muted-foreground group-[.toast]:text-sm',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md group-[.toast]:text-sm group-[.toast]:font-medium',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md group-[.toast]:text-sm',
          success: 'group-[.toaster]:!bg-card group-[.toaster]:!border-success/30',
          error: 'group-[.toaster]:!bg-card group-[.toaster]:!border-destructive/30',
          warning: 'group-[.toaster]:!bg-card group-[.toaster]:!border-warning/30',
          info: 'group-[.toaster]:!bg-card group-[.toaster]:!border-primary/30',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--card)',
          '--normal-text': 'var(--foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--card)',
          '--success-border': 'var(--success)',
          '--success-text': 'var(--foreground)',
          '--error-bg': 'var(--card)',
          '--error-border': 'var(--destructive)',
          '--error-text': 'var(--foreground)',
          '--warning-bg': 'var(--card)',
          '--warning-border': 'var(--warning)',
          '--warning-text': 'var(--foreground)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
