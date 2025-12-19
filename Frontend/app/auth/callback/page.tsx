"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, CheckCircle, XCircle, Zap, Sparkles, ArrowRight } from "lucide-react"

// Confetti pieces for success celebration
const Confetti = () => {
    const colors = ["bg-primary", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300 - 100,
        rotation: Math.random() * 720,
        delay: Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
    }))

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className={`absolute w-2 h-2 rounded-sm ${p.color}`}
                    initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0 }}
                    animate={{
                        opacity: [0, 1, 1, 0],
                        x: p.x,
                        y: p.y,
                        rotate: p.rotation,
                        scale: [0, 1, 1, 0.5],
                    }}
                    transition={{
                        delay: p.delay,
                        duration: 1.5,
                        ease: "easeOut",
                    }}
                />
            ))}
        </div>
    )
}

// Animated ring pulse effect
const PulseRing = ({ delay }: { delay: number }) => (
    <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/30"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{
            delay,
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
        }}
    />
)

// Loading fallback component
function LoadingFallback() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="relative w-full max-w-md">
                <div className="relative bg-card/80 backdrop-blur-2xl border border-border/50 rounded-3xl p-10 shadow-2xl shadow-black/10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                            <Zap className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-xl text-foreground">InferX</span>
                    </div>
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        </div>
    )
}

// Main callback content component
function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("Verifying your credentials...")
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Animate progress bar
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval)
                    return 100
                }
                return prev + 10
            })
        }, 100)

        const handleCallback = async () => {
            try {
                const accessToken = searchParams.get("access_token")
                const refreshToken = searchParams.get("refresh_token")
                const error = searchParams.get("error")

                // Simulate minimum loading time for smooth UX
                await new Promise((resolve) => setTimeout(resolve, 1200))

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

                setProgress(100)
                setStatus("success")
                setMessage("Welcome to InferX!")

                // Redirect to dashboard
                setTimeout(() => router.push("/dashboard"), 2000)
            } catch (error) {
                console.error("Callback error:", error)
                setStatus("error")
                setMessage("Failed to process authentication")
                setTimeout(() => router.push("/login"), 3000)
            }
        }

        handleCallback()

        return () => clearInterval(progressInterval)
    }, [searchParams, router])

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
            {/* Background gradient orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-md z-10"
            >
                {/* Success confetti */}
                <AnimatePresence>
                    {status === "success" && <Confetti />}
                </AnimatePresence>

                <div className="relative bg-card/80 backdrop-blur-2xl border border-border/50 rounded-3xl p-10 shadow-2xl shadow-black/10">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center justify-center gap-2 mb-8"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                            <Zap className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-xl text-foreground">InferX</span>
                    </motion.div>

                    {/* Status Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                {status === "loading" && (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        className="relative"
                                    >
                                        {/* Pulse rings */}
                                        <PulseRing delay={0} />
                                        <PulseRing delay={0.5} />
                                        <PulseRing delay={1} />

                                        <motion.div
                                            className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Loader2 className="w-10 h-10 text-primary" />
                                        </motion.div>
                                    </motion.div>
                                )}

                                {status === "success" && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        className="relative"
                                    >
                                        {/* Success glow */}
                                        <motion.div
                                            className="absolute inset-0 rounded-full bg-green-500/20 blur-xl"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 2 }}
                                            transition={{ duration: 0.5 }}
                                        />

                                        <motion.div
                                            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                                        >
                                            <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                                        </motion.div>

                                        {/* Sparkles */}
                                        <motion.div
                                            className="absolute -top-2 -right-2"
                                            initial={{ scale: 0, rotate: -30 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.3, type: "spring" }}
                                        >
                                            <Sparkles className="w-6 h-6 text-yellow-500" />
                                        </motion.div>
                                    </motion.div>
                                )}

                                {status === "error" && (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        className="relative"
                                    >
                                        <motion.div
                                            className="absolute inset-0 rounded-full bg-red-500/20 blur-xl"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 2 }}
                                            transition={{ duration: 0.5 }}
                                        />

                                        <motion.div
                                            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30"
                                            animate={{ x: [0, -5, 5, -5, 5, 0] }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                        >
                                            <XCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Progress bar (loading only) */}
                    <AnimatePresence>
                        {status === "loading" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6"
                            >
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-primary via-primary to-primary/80 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Title */}
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-foreground text-center mb-3"
                    >
                        {status === "loading" && "Signing you in..."}
                        {status === "success" && "You're all set!"}
                        {status === "error" && "Something went wrong"}
                    </motion.h2>

                    {/* Message */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`text-center mb-6 ${status === "error" ? "text-red-500" : "text-muted-foreground"
                            }`}
                    >
                        {message}
                    </motion.p>

                    {/* Action hint */}
                    <AnimatePresence>
                        {status === "success" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                            >
                                <span>Redirecting to dashboard</span>
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </motion.div>
                            </motion.div>
                        )}

                        {status === "error" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.5 }}
                                className="text-center text-sm text-muted-foreground"
                            >
                                Redirecting to login in 3 seconds...
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center text-xs text-muted-foreground/60 mt-6"
                >
                    Secured by InferX Authentication
                </motion.p>
            </motion.div>
        </div>
    )
}

// Main page component with Suspense boundary
export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <AuthCallbackContent />
        </Suspense>
    )
}
