"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { ToastContainer, ToastProps } from "@/components/custom-toast"

interface ToastContextValue {
    showToast: (toast: Omit<ToastProps, "id" | "onClose">) => void
    success: (title: string, description?: string) => void
    error: (title: string, description?: string) => void
    warning: (title: string, description?: string) => void
    info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastProps[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const showToast = useCallback((toast: Omit<ToastProps, "id" | "onClose">) => {
        const id = Math.random().toString(36).substring(7)
        setToasts((prev) => [...prev, { ...toast, id, onClose: removeToast }])
    }, [removeToast])

    const success = useCallback((title: string, description?: string) => {
        showToast({ type: "success", title, description })
    }, [showToast])

    const error = useCallback((title: string, description?: string) => {
        showToast({ type: "error", title, description })
    }, [showToast])

    const warning = useCallback((title: string, description?: string) => {
        showToast({ type: "warning", title, description })
    }, [showToast])

    const info = useCallback((title: string, description?: string) => {
        showToast({ type: "info", title, description })
    }, [showToast])

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    )
}

export function useCustomToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useCustomToast must be used within a ToastProvider")
    }
    return context
}
