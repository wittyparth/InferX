"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, useInView } from "framer-motion"
import {
    Zap, ArrowRight, Check, Shield, Gauge,
    GitBranch, BarChart3, Key, Share2, Webhook,
    Terminal, Play, Github, Clock, TrendingUp,
    Layers, ArrowUpRight, Cpu, Star, Code2,
    Activity, Lock, Globe, Sparkles
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

// Animated counter
const Counter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    useEffect(() => {
        if (isInView) {
            const duration = 1500
            const steps = 60
            const increment = value / steps
            let current = 0
            const timer = setInterval(() => {
                current += increment
                if (current >= value) {
                    setCount(value)
                    clearInterval(timer)
                } else {
                    setCount(Math.floor(current))
                }
            }, duration / steps)
            return () => clearInterval(timer)
        }
    }, [isInView, value])

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// Bento Grid Item Component
const BentoCard = ({
    children,
    className = "",
    delay = 0,
    hoverEffect = true,
}: {
    children: React.ReactNode
    className?: string
    delay?: number
    hoverEffect?: boolean
}) => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-50px" })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
            whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2 } } : {}}
            className={`relative group rounded-2xl border border-border bg-card p-6 overflow-hidden ${className}`}
        >
            {/* Subtle hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">{children}</div>
        </motion.div>
    )
}

// Animated Icon Box
const IconBox = ({
    icon: Icon,
    gradient = "from-primary to-primary"
}: {
    icon: any
    gradient?: string
}) => (
    <motion.div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
        <Icon className="w-6 h-6 text-white" />
    </motion.div>
)

// Code preview with typing animation
const CodePreview = () => {
    const lines = [
        { content: "import inferx", color: "text-primary" },
        { content: "", color: "" },
        { content: "# Upload your model", color: "text-muted-foreground" },
        { content: 'model = inferx.upload("model.pkl")', color: "text-foreground" },
        { content: "", color: "" },
        { content: "# Get predictions in ~2ms", color: "text-muted-foreground" },
        { content: "result = model.predict(data)", color: "text-foreground" },
    ]

    return (
        <div className="rounded-xl bg-[#0f0f10] border border-border/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-muted-foreground ml-2 font-mono">predict.py</span>
            </div>
            <div className="p-4 font-mono text-sm space-y-1">
                {lines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={line.color}
                    >
                        {line.content || "\u00A0"}
                    </motion.div>
                ))}
                <motion.span
                    className="inline-block w-2 h-5 bg-primary ml-1"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                />
            </div>
        </div>
    )
}

// Performance Chart Animation
const PerformanceChart = () => (
    <div className="space-y-3">
        {[
            { label: "Cached Prediction", value: 95, color: "bg-green-500" },
            { label: "First Load", value: 60, color: "bg-primary" },
            { label: "Cold Start", value: 40, color: "bg-muted-foreground" },
        ].map((item, i) => (
            <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground font-medium">{item.value === 95 ? "~2ms" : item.value === 60 ? "~50ms" : "~600ms"}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${item.color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.2, ease: "easeOut" }}
                    />
                </div>
            </div>
        ))}
    </div>
)

// Live Activity Indicator
const LiveIndicator = () => (
    <div className="flex items-center gap-2">
        <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-xs text-muted-foreground">Live</span>
    </div>
)

export default function LandingPage() {
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("access_token")
        setIsLoggedIn(!!token)
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Zap className="w-5 h-5 text-primary-foreground" />
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <motion.div
                            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Zap className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
                        </motion.div>
                        <span className="font-bold text-lg text-foreground">InferX</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Features
                        </Link>
                        <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            How it Works
                        </Link>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                        >
                            <Github className="w-4 h-4" />
                            GitHub
                        </a>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        {isLoggedIn ? (
                            <Button onClick={() => router.push("/dashboard")} size="sm">
                                Dashboard
                                <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
                                    Sign in
                                </Button>
                                <Button size="sm" onClick={() => router.push("/register")}>
                                    Get Started
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
                {/* Background grid pattern */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                </div>

                <div className="max-w-6xl mx-auto px-6">
                    <div className="max-w-3xl">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            <span className="text-sm font-medium text-primary">Public Beta</span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6"
                        >
                            Deploy ML models{" "}
                            <span className="text-primary">in seconds</span>,{" "}
                            not weeks
                        </motion.h1>

                        {/* Subheadline */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed"
                        >
                            Production-ready MLOps platform that transforms your models
                            into high-performance APIs with real-time monitoring.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-3 mb-12"
                        >
                            <Button
                                size="lg"
                                onClick={() => router.push(isLoggedIn ? "/dashboard" : "/register")}
                                className="group"
                            >
                                Start Building Free
                                <motion.div
                                    className="ml-2"
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </motion.div>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                <Play className="w-4 h-4 mr-2" />
                                See How It Works
                            </Button>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-wrap gap-8 md:gap-12"
                        >
                            {[
                                { value: 2, suffix: "ms", label: "Avg. Inference" },
                                { value: 99, suffix: "%", label: "Uptime SLA" },
                                { value: 30, suffix: "+", label: "API Endpoints" },
                            ].map((stat, i) => (
                                <div key={stat.label}>
                                    <div className="text-2xl md:text-3xl font-bold text-foreground">
                                        <Counter value={stat.value} suffix={stat.suffix} />
                                    </div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section id="features" className="py-20 md:py-28">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Everything you need for{" "}
                            <span className="text-primary">production ML</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Enterprise-grade features without the enterprise complexity
                        </p>
                    </motion.div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Large Card - Model Management */}
                        <BentoCard className="lg:col-span-2 lg:row-span-2" delay={0.1}>
                            <div className="h-full flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <IconBox icon={Layers} gradient="from-blue-500 to-cyan-500" />
                                    <LiveIndicator />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">Model Management</h3>
                                <p className="text-muted-foreground mb-4">
                                    Upload, version, and deploy your ML models with automatic versioning
                                    and zero-downtime updates.
                                </p>

                                {/* Mini Dashboard Preview */}
                                <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-medium text-muted-foreground">Model Versions</span>
                                        <span className="text-xs text-primary">View All</span>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { version: "v2.1.0", status: "active", date: "Now" },
                                            { version: "v2.0.0", status: "deprecated", date: "2d ago" },
                                            { version: "v1.9.5", status: "archived", date: "5d ago" },
                                        ].map((item, i) => (
                                            <motion.div
                                                key={item.version}
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${item.status === "active" ? "bg-green-500" :
                                                            item.status === "deprecated" ? "bg-yellow-500" : "bg-muted-foreground"
                                                        }`} />
                                                    <span className="text-sm font-mono text-foreground">{item.version}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{item.date}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-auto">
                                    {[
                                        { icon: GitBranch, label: "Version Control" },
                                        { icon: Zap, label: "Hot Reload" },
                                        { icon: Clock, label: "Instant Deploy" },
                                        { icon: Lock, label: "Secure Storage" },
                                    ].map((item) => (
                                        <motion.div
                                            key={item.label}
                                            whileHover={{ x: 4 }}
                                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-default"
                                        >
                                            <item.icon className="w-4 h-4 text-primary" />
                                            {item.label}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </BentoCard>

                        {/* Performance Card */}
                        <BentoCard delay={0.2}>
                            <IconBox icon={Gauge} gradient="from-green-500 to-emerald-500" />
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Blazing Fast</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                LRU cache with Redis delivers sub-2ms predictions.
                            </p>
                            <PerformanceChart />
                        </BentoCard>

                        {/* Security Card */}
                        <BentoCard delay={0.3}>
                            <IconBox icon={Shield} gradient="from-purple-500 to-pink-500" />
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Enterprise Security</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                JWT auth, API keys with SHA-256, rate limiting.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {["HTTPS", "JWT", "OAuth"].map((tag) => (
                                    <span key={tag} className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </BentoCard>

                        {/* Code Preview Card */}
                        <BentoCard className="lg:col-span-2" delay={0.4}>
                            <div className="flex items-center gap-3 mb-4">
                                <IconBox icon={Code2} gradient="from-orange-500 to-red-500" />
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Simple API</h3>
                                    <p className="text-sm text-muted-foreground">3 lines of code to get started</p>
                                </div>
                            </div>
                            <CodePreview />
                        </BentoCard>

                        {/* Analytics Card */}
                        <BentoCard delay={0.5}>
                            <IconBox icon={BarChart3} gradient="from-amber-500 to-orange-500" />
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Real-time Analytics</h3>
                            <p className="text-sm text-muted-foreground">
                                Monitor predictions, latency, and error rates with beautiful dashboards.
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-muted-foreground">Live monitoring</span>
                            </div>
                        </BentoCard>

                        {/* API Keys Card */}
                        <BentoCard delay={0.6}>
                            <IconBox icon={Key} gradient="from-indigo-500 to-purple-500" />
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">API Key Management</h3>
                            <p className="text-sm text-muted-foreground">
                                Create, rotate, and revoke keys with granular permissions.
                            </p>
                        </BentoCard>

                        {/* Sharing Card */}
                        <BentoCard delay={0.7}>
                            <IconBox icon={Share2} gradient="from-teal-500 to-cyan-500" />
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Team Collaboration</h3>
                            <p className="text-sm text-muted-foreground">
                                Share models with view, use, or edit permissions.
                            </p>
                        </BentoCard>

                        {/* Webhooks Card */}
                        <BentoCard delay={0.8}>
                            <IconBox icon={Webhook} gradient="from-rose-500 to-pink-500" />
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Webhooks</h3>
                            <p className="text-sm text-muted-foreground">
                                Get notified on predictions, errors, and model updates.
                            </p>
                        </BentoCard>

                        {/* Tech Stack Card */}
                        <BentoCard className="lg:col-span-2" delay={0.9}>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Built with Modern Stack</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { emoji: "⚡", name: "FastAPI", desc: "Backend" },
                                    { emoji: "⚛️", name: "React 19", desc: "Frontend" },
                                    { emoji: "🐘", name: "PostgreSQL", desc: "Database" },
                                    { emoji: "🔴", name: "Redis", desc: "Cache" },
                                ].map((tech, i) => (
                                    <motion.div
                                        key={tech.name}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -2 }}
                                        className="text-center p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-default"
                                    >
                                        <div className="text-2xl mb-1">{tech.emoji}</div>
                                        <div className="text-sm font-medium text-foreground">{tech.name}</div>
                                        <div className="text-xs text-muted-foreground">{tech.desc}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </BentoCard>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-20 md:py-28 bg-secondary/30">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Get started in <span className="text-primary">3 simple steps</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            From model upload to production API in minutes
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                icon: Terminal,
                                title: "Upload Your Model",
                                description: "Upload your trained Scikit-learn model via dashboard or API. We support .pkl and .joblib formats.",
                                gradient: "from-blue-500 to-cyan-500"
                            },
                            {
                                step: "02",
                                icon: Cpu,
                                title: "Configure & Deploy",
                                description: "Set up input schemas, rate limits, and access controls. Deploy with zero downtime.",
                                gradient: "from-purple-500 to-pink-500"
                            },
                            {
                                step: "03",
                                icon: TrendingUp,
                                title: "Get Predictions",
                                description: "Call your model via REST API. Monitor performance in real-time through the dashboard.",
                                gradient: "from-green-500 to-emerald-500"
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                whileHover={{ y: -4 }}
                                className="relative bg-card border border-border rounded-2xl p-8"
                            >
                                <div className="text-6xl font-bold text-border/50 mb-4">{item.step}</div>
                                <IconBox icon={item.icon} gradient={item.gradient} />
                                <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">{item.title}</h3>
                                <p className="text-muted-foreground">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-28">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-card border border-border rounded-3xl p-12 md:p-16"
                    >
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <Sparkles className="w-10 h-10 text-primary mx-auto mb-6" />
                        </motion.div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Ready to deploy your first model?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Join developers shipping ML-powered features faster. No credit card required.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
                            <Button
                                size="lg"
                                onClick={() => router.push(isLoggedIn ? "/dashboard" : "/register")}
                            >
                                Get Started Free
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button size="lg" variant="outline">
                                Contact Sales
                                <ArrowUpRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>

                        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                            {["Free tier", "No credit card", "Setup in minutes"].map((item) => (
                                <div key={item} className="flex items-center gap-1.5">
                                    <Check className="w-4 h-4 text-primary" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
                            </div>
                            <span className="font-semibold text-foreground">InferX</span>
                        </Link>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
                            <Link href="#" className="hover:text-foreground transition-colors">Docs</Link>
                            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
                            <a href="#" className="hover:text-foreground transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} InferX. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}
