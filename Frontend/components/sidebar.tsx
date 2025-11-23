"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Zap, LogOut, Menu, X, BarChart3, Cog, Webhook } from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/models", label: "Models", icon: BarChart3 },
  { href: "/predictions", label: "Predictions", icon: Zap },
  { href: "/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/settings", label: "Settings", icon: Cog },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_email")
    localStorage.removeItem("user_name")
    router.push("/login")
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-accent flex items-center justify-center group-hover:shadow-lg group-hover:shadow-sidebar-primary/30 transition-all duration-300 ease-out">
            <span className="text-lg font-bold text-sidebar-primary-foreground">M</span>
          </div>
          <div>
            <div className="font-bold text-sidebar-foreground">ModelServe</div>
            <div className="text-xs text-sidebar-accent">ML Platform</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-out ${isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/10"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center gap-2 text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent/10 bg-transparent"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="border-sidebar-border bg-sidebar/80 backdrop-blur-sm"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-sidebar border-r border-sidebar-border fixed left-0 top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <motion.aside
          initial={{ x: -256 }}
          animate={{ x: 0 }}
          exit={{ x: -256 }}
          className="md:hidden fixed inset-0 z-40 w-64 h-screen bg-sidebar border-r border-sidebar-border"
        >
          {sidebarContent}
        </motion.aside>
      )}

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-black/50"
        />
      )}
    </>
  )
}
