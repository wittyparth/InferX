"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Github, Mail, ArrowRight, Eye, EyeOff, Sparkles, Zap } from "lucide-react"
import Link from "next/link"
import { RippleButton } from "@/components/ripple-button"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        // Store token in localStorage
        localStorage.setItem("access_token", data.access_token)
        // Also store in cookie for middleware
        document.cookie = `access_token=${data.access_token}; path=/; max-age=86400; SameSite=Strict`
        toast({ title: "Success", description: "Logged in successfully" })
        router.push("/dashboard")
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Invalid credentials",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({ title: "Error", description: "Login failed", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    }),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        <Card className="border border-border/50 bg-card/80 backdrop-blur-xl p-8 shadow-2xl shadow-primary/5">
          {/* Header */}
          <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible" className="mb-8 text-center">
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-primary via-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/30"
                  animate={{
                    boxShadow: [
                      "0 10px 25px -5px rgba(var(--primary), 0.3)",
                      "0 20px 40px -5px rgba(var(--primary), 0.4)",
                      "0 10px 25px -5px rgba(var(--primary), 0.3)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  InferX
                </h1>
                <p className="text-xs text-primary font-medium">ML Platform</p>
              </div>
            </motion.div>
            <motion.h2
              custom={0.5}
              variants={itemVariants}
              className="text-2xl font-semibold text-foreground mb-2"
            >
              Welcome back
            </motion.h2>
            <motion.p
              custom={0.7}
              variants={itemVariants}
              className="text-muted-foreground text-sm"
            >
              Sign in to continue to your dashboard
            </motion.p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible">
              <div className="relative group">
                <Label
                  htmlFor="email"
                  className="text-foreground text-sm font-medium block mb-2 transition-colors group-focus-within:text-primary"
                >
                  Email Address
                </Label>
                <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-base h-11 transition-all duration-200 focus:shadow-lg focus:shadow-primary/10"
                    required
                    suppressHydrationWarning
                  />
                </motion.div>
              </div>
            </motion.div>

            <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password" className="text-foreground text-sm font-medium">
                  Password
                </Label>
                <motion.a
                  href="#"
                  className="text-xs text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Forgot password?
                </motion.a>
              </div>
              <div className="relative group">
                <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-base h-11 pr-11 transition-all duration-200 focus:shadow-lg focus:shadow-primary/10"
                    required
                  />
                </motion.div>
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={showPassword ? "hide" : "show"}
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>

            <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible">
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <RippleButton
                  type="submit"
                  disabled={isLoading}
                  rippleColor="rgba(255, 255, 255, 0.5)"
                  className="w-full h-11 font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Signing in...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="submit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2"
                      >
                        Sign In
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </RippleButton>
              </motion.div>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            custom={4}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="my-8 flex items-center gap-4"
          >
            <motion.div
              className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            />
            <span className="text-xs text-muted-foreground font-medium px-2">OR CONTINUE WITH</span>
            <motion.div
              className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            />
          </motion.div>

          {/* Social Login */}
          <motion.div custom={5} variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/oauth/google`}
                disabled={isLoading}
                className="w-full button-outline bg-card/50 border-border/50 hover:bg-muted/50 hover:border-primary/30 h-11 transition-all duration-200 group"
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/oauth/github`}
                disabled={isLoading}
                className="w-full button-outline bg-card/50 border-border/50 hover:bg-muted/50 hover:border-primary/30 h-11 transition-all duration-200 group"
              >
                <Github className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div
            custom={6}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:text-primary/80 transition-colors duration-200 font-semibold inline-flex items-center gap-1 group"
              >
                <span>Create one</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-3 h-3" />
                </motion.span>
              </Link>
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  )
}
