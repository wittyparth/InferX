"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Zap,
  LogOut,
  Menu,
  X,
  Box,
  Activity,
  Settings,
  Webhook,
  ChevronDown,
  HelpCircle,
  ExternalLink
} from "lucide-react"
import { useState, useEffect } from "react"
import { ThemeToggle } from "./theme-toggle"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview & stats"
  },
  {
    name: "Models",
    href: "/models",
    icon: Box,
    description: "Manage ML models"
  },
  {
    name: "Predictions",
    href: "/predictions",
    icon: Activity,
    description: "View predictions"
  },
  {
    name: "Webhooks",
    href: "/webhooks",
    icon: Webhook,
    description: "Event notifications"
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Account & API keys"
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  useEffect(() => {
    const email = localStorage.getItem("user_email") || "user@example.com"
    setUserEmail(email)
  }, [])

  const handleLogout = () => {
    // Clear all auth tokens
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_email")
    localStorage.removeItem("user_name")

    // Clear cookie
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    // Close dropdown and redirect
    setIsUserMenuOpen(false)
    router.push("/login")
  }

  const getInitials = (email: string) => {
    const name = email.split("@")[0]
    return name.slice(0, 2).toUpperCase()
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 px-4 flex items-center border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <motion.div
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </motion.div>
          <div>
            <span className="font-bold text-sidebar-foreground">InferX</span>
            <span className="ml-1.5 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              BETA
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto scrollbar-thin">
        {navigation.map((item) => {
          const active = isActive(item.href)
          return (
            <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
              <motion.div
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  transition-colors duration-150 group
                  ${active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  }
                `}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "" : "group-hover:text-sidebar-foreground"
                  }`} strokeWidth={active ? 2 : 1.5} />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${active ? "" : ""}`}>{item.name}</div>
                </div>
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-foreground rounded-r-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {/* Help Link */}
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
          <span>Help & Support</span>
          <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
        </a>

        {/* Theme Toggle Row */}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>

        {/* User Section */}
        <div className="relative">
          <motion.button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
              {getInitials(userEmail)}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium text-sidebar-foreground truncate">
                {userEmail.split("@")[0]}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {userEmail}
              </div>
            </div>
            <motion.div
              animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </motion.button>

          {/* User Dropdown */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-2 py-1 bg-popover border border-border rounded-lg shadow-lg"
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center shadow-sm"
        aria-label="Toggle menu"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isOpen ? "close" : "open"}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.div>
        </AnimatePresence>
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 h-screen bg-sidebar border-r border-sidebar-border fixed left-0 top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="md:hidden fixed inset-y-0 left-0 z-40 w-60 bg-sidebar border-r border-sidebar-border shadow-xl"
            >
              <SidebarContent />
            </motion.aside>

            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
            />
          </>
        )}
      </AnimatePresence>
    </>
  )
}
