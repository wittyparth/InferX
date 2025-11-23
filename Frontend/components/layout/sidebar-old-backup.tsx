"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Zap, TrendingUp, Settings, LogOut, X, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

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

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 },
  }

  const collapsedVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "5rem" },
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={open ? "open" : "closed"}
        transition={{ duration: 0.3 }}
        className="fixed md:relative w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 md:z-0"
      >
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <motion.div
            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
              <span className="text-primary-foreground font-bold text-lg">X</span>
            </div>
            <div>
              <h1 className="font-semibold text-sidebar-foreground whitespace-nowrap">InferX</h1>
              <p className="text-xs text-muted-foreground whitespace-nowrap">ML Platform</p>
            </div>
          </motion.div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex text-sidebar-foreground hover:text-sidebar-foreground/70 transition-colors duration-200 p-1"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
            </motion.button>
            <button
              onClick={() => onOpenChange(false)}
              className="md:hidden text-sidebar-foreground hover:text-sidebar-foreground/70 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 cursor-pointer ${isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  title={isCollapsed ? item.label : ""}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <motion.span
                    animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
                    transition={{ duration: 0.2 }}
                    className="font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <motion.div
            animate={{ opacity: isCollapsed ? 0 : 1, height: isCollapsed ? 0 : "auto" }}
            transition={{ duration: 0.2 }}
            className="px-4 py-3 rounded-md bg-sidebar-accent border border-sidebar-border overflow-hidden"
          >
            <p className="text-xs text-sidebar-foreground font-semibold mb-1">API Key</p>
            <p className="text-xs text-muted-foreground font-mono">sk_...abc123</p>
          </motion.div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-sidebar-border hover:bg-sidebar-accent text-sidebar-foreground transition-all duration-200 bg-transparent"
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </motion.aside>
    </>
  )
}
