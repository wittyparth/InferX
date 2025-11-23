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
import { Github, Mail, ArrowRight, Check, Eye, EyeOff, Sparkles, Zap, Shield } from "lucide-react"
import Link from "next/link"
import { RippleButton } from "@/components/ripple-button"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordStrength = {
    hasLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }

  const isPasswordValid = Object.values(passwordStrength).every(Boolean) && password === confirmPassword

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid) {
      toast({ title: "Error", description: "Password requirements not met", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        toast({ title: "Success", description: "Account created successfully" })
        router.push("/login")
      } else {
        toast({ title: "Error", description: "Registration failed", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Registration failed", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border border-border/50 bg-card/80 backdrop-blur-xl p-8 shadow-2xl shadow-primary/5">
          {/* Header */}
          <div className="mb-8 text-center">
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
                      "0 10px 25px -5px rgba(79, 70, 229, 0.3)",
                      "0 20px 40px -5px rgba(79, 70, 229, 0.4)",
                      "0 10px 25px -5px rgba(79, 70, 229, 0.3)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Shield className="w-6 h-6 text-primary-foreground" />
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
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Create your account
            </h2>
            <p className="text-muted-foreground text-sm">
              Join thousands of ML engineers today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
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
                />
              </motion.div>
            </div>

            <div className="relative group">
              <Label htmlFor="password" className="text-foreground text-sm font-medium block mb-2">
                Password
              </Label>
              <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-base h-11 pr-11 transition-all duration-200 focus:shadow-lg focus:shadow-primary/10"
                    required
                  />
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
            </div>

            {/* Password strength indicator */}
            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50"
              >
                <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Password strength
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "8+ characters", met: passwordStrength.hasLength },
                    { label: "Uppercase", met: passwordStrength.hasUpper },
                    { label: "Lowercase", met: passwordStrength.hasLower },
                    { label: "Number", met: passwordStrength.hasNumber },
                  ].map((req) => (
                    <div key={req.label} className="flex items-center gap-2 text-xs">
                      <motion.div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${req.met ? "bg-green-500/20 border-green-500/50" : "border-border"
                          }`}
                        animate={req.met ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {req.met && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          >
                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                          </motion.div>
                        )}
                      </motion.div>
                      <span className={req.met ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="relative group">
              <Label htmlFor="confirmPassword" className="text-foreground text-sm font-medium block mb-2">
                Confirm Password
              </Label>
              <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`input-base h-11 pr-11 transition-all duration-200 focus:shadow-lg focus:shadow-primary/10 ${confirmPassword && password !== confirmPassword ? "border-red-500/50 focus:ring-red-500/20" : ""
                      }`}
                    required
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={showConfirmPassword ? "hide" : "show"}
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>
                </div>
              </motion.div>
              {confirmPassword && password !== confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 mt-1"
                >
                  Passwords do not match
                </motion.p>
              )}
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <RippleButton
                type="submit"
                disabled={isLoading || !isPasswordValid}
                rippleColor="rgba(255, 255, 255, 0.5)"
                className="w-full h-11 font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Creating account...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="submit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      Create Account
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
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
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
          </div>

          {/* Social signup */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                variant="outline"
                className="w-full button-outline bg-card/50 border-border/50 hover:bg-muted/50 hover:border-primary/30 h-11 transition-all duration-200 group"
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                variant="outline"
                className="w-full button-outline bg-card/50 border-border/50 hover:bg-muted/50 hover:border-primary/30 h-11 transition-all duration-200 group"
              >
                <Github className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              </Button>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 transition-colors duration-200 font-semibold inline-flex items-center gap-1 group"
              >
                <span>Sign in</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-3 h-3" />
                </motion.span>
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
