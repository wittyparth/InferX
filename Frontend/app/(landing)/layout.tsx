import type React from "react"
import { Toaster } from "@/components/ui/sonner"

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
            <Toaster />
        </>
    )
}
