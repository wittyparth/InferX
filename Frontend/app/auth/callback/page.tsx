"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function AuthCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("Processing authentication...")

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const accessToken = searchParams.get("access_token")
                const refreshToken = searchParams.get("refresh_token")
                const error = searchParams.get("error")

                if (error) {
                    setStatus("error")
                    setMessage(`Authentication failed: ${error}`)
                    setTimeout(() => router.push("/login"), 3000)
                    return
                }

                if (!accessToken) {
                    setStatus("error")
                    setMessage("No access token received")
                    setTimeout(() => router.push("/login"), 3000)
                    return
                }

                // Store tokens
                localStorage.setItem("access_token", accessToken)
                if (refreshToken) {
                    localStorage.setItem("refresh_token", refreshToken)
                }

                // Set cookie for middleware
                document.cookie = `access_token=${accessToken}; path=/; max-age=86400; SameSite=Strict`

                setStatus("success")
                setMessage("Authentication successful! Redirecting...")

                // Redirect to dashboard
                setTimeout(() => router.push("/dashboard"), 1500)
            } catch (error) {
                console.error("Callback error:", error)
                setStatus("error")
                setMessage("Failed to process authentication")
                setTimeout(() => router.push("/login"), 3000)
            }
        }

        handleCallback()
    }, [searchParams, router])

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl shadow-primary/5 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                        className="mb-6 flex justify-center"
                    >
                        {status === "loading" && (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                <Loader2 className="w-16 h-16 text-primary" />
                            </motion.div>
                        )}
                        {status === "success" && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            >
                                <CheckCircle className="w-16 h-16 text-green-500" />
                            </motion.div>
                        )}
                        {status === "error" && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            >
                                <XCircle className="w-16 h-16 text-red-500" />
                            </motion.div>
                        )}
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-semibold text-foreground mb-2"
                    >
                        {status === "loading" && "Authenticating"}
                        {status === "success" && "Success!"}
                        {status === "error" && "Error"}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-muted-foreground"
                    >
                        {message}
                    </motion.p>
                </div>
            </motion.div>
        </div>
    )
}
