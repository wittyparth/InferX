"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Zap, TrendingUp, Settings, LogOut, X, ChevronLeft, User, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { api } from "@/lib/api-client"
import { Skeleton } from "@/components/ui/skeleton"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UserData {
  id: string
  email: string
  full_name?: string
  profile_picture?: string
  created_at: string
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [apiKeyCount, setApiKeyCount] = useState(0)

  useEffect(() => {
    fetchUserData()
    fetchApiKeys()
  }, [])

  const fetchUserData = async () => {
    try {
      setIsLoadingUser(true)
      const response: any = await api.users.me()
      if (response.success) {
        setUserData(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    } finally {
      setIsLoadingUser(false)
    }
  }

  const fetchApiKeys = async () => {
    try {
      const response: any = await api.apiKeys.list()
      if (response.success) {
        const activeKeys = response.data.filter((k: { is_active: boolean }) => k.is_active)
        setApiKeyCount(activeKeys.length)
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error)
    }
  }

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

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const getUserInitials = () => {
    if (userData?.full_name) {
      return userData.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (userData?.email) {
      return userData.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: open ? 0 : "-100%",
          width: isCollapsed ? "5rem" : "16rem",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed md:relative h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 md:z-0"
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between min-h-[4rem]">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 overflow-hidden"
              >
                <motion.div
                  className="w-10 h-10 bg-linear-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-primary/30"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="text-primary-foreground font-bold text-lg">X</span>
                </motion.div>
                <div>
                  <h1 className="font-semibold text-sidebar-foreground whitespace-nowrap text-lg">InferX</h1>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">ML Platform</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-1 shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCollapse}
              className="hidden md:flex items-center justify-center text-sidebar-foreground hover:text-primary hover:bg-sidebar-accent/50 transition-all duration-200 p-2 rounded-md"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onOpenChange(false)}
              className="md:hidden flex items-center justify-center text-sidebar-foreground hover:text-primary hover:bg-sidebar-accent/50 transition-all duration-200 p-2 rounded-md"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: isCollapsed ? 0 : 4, scale: isCollapsed ? 1.05 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-primary"
                    }`}
                  title={isCollapsed ? item.label : ""}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-3">
          {/* User Profile */}
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="user-profile"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="px-3 py-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border overflow-hidden"
              >
                {isLoadingUser ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-2 w-2/3" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-primary/20">
                      <AvatarImage src={userData?.profile_picture} alt={userData?.email} />
                      <AvatarFallback className="bg-linear-to-br from-primary to-accent text-primary-foreground font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-sidebar-foreground truncate">
                        {userData?.full_name || userData?.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {userData?.email}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* API Keys Count */}
          <AnimatePresence mode="wait">
            {!isCollapsed && apiKeyCount > 0 && (
              <motion.div
                key="api-keys"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">{apiKeyCount} Active API Key{apiKeyCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className={`w-full border-sidebar-border hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30 dark:hover:text-red-400 text-sidebar-foreground transition-all duration-200 bg-transparent ${isCollapsed ? "px-0 justify-center" : ""
              }`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  key="logout-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-2 whitespace-nowrap overflow-hidden"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </motion.aside>
    </>
  )
}
