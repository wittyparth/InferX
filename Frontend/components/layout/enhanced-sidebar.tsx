"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Zap, TrendingUp, Settings, LogOut, ChevronLeft, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface SidebarProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [userEmail, setUserEmail] = useState("")

    useEffect(() => {
        setUserEmail(localStorage.getItem("user_email") || "user@example.com")
    }, [])

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/models", label: "Models", icon: Zap },
        { href: "/predictions", label: "Predictions", icon: TrendingUp },
        { href: "/settings", label: "Settings", icon: Settings },
    ]

    const handleLogout = () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("user_email")
        localStorage.removeItem("user_name")
        router.push("/login")
    }

    const sidebarContent = (
        <motion.div
            className="flex flex-col h-full bg-sidebar border-r border-sidebar-border"
            animate={{ width: isCollapsed ? "5rem" : "16rem" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Logo */}
            <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3 overflow-hidden"
                        >
                            <Link href="/dashboard" className="flex items-center gap-3 group">
                                <motion.div
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <span className="text-lg font-bold text-primary-foreground">M</span>
                                </motion.div>
                                <div>
                                    <div className="font-bold text-sidebar-foreground">ModelServe</div>
                                    <div className="text-xs text-primary">ML Platform</div>
                                </div>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex text-sidebar-foreground hover:text-primary transition-colors duration-200 p-1 rounded-lg hover:bg-sidebar-accent"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <motion.div
                        animate={{ rotate: isCollapsed ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </motion.div>
                </motion.button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                whileHover={{ x: 4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden group ${isActive
                                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                                    }`}
                                title={isCollapsed ? item.label : ""}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <Icon className={`w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`} />
                                <AnimatePresence mode="wait">
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: "auto" }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="font-medium whitespace-nowrap overflow-hidden relative z-10"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        className="absolute right-2 w-1.5 h-1.5 bg-primary-foreground rounded-full"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-sidebar-border space-y-3">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-4 py-3 rounded-xl bg-gradient-to-br from-sidebar-accent to-sidebar-accent/50 border border-sidebar-border/50 overflow-hidden"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <motion.div
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm font-semibold"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                    {userEmail.charAt(0).toUpperCase()}
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-sidebar-foreground font-semibold truncate">{userEmail}</p>
                                    <p className="text-xs text-muted-foreground">Developer</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className={`w-full border-sidebar-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-sidebar-foreground transition-all duration-200 bg-transparent ${isCollapsed ? "px-0" : ""
                            }`}
                        title={isCollapsed ? "Logout" : ""}
                    >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        <AnimatePresence mode="wait">
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="ml-2 whitespace-nowrap overflow-hidden"
                                >
                                    Logout
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    )

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                    />
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block relative">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {open && (
                    <motion.aside
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="md:hidden fixed left-0 top-0 z-50 w-64 h-screen"
                    >
                        {sidebarContent}
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    )
}
