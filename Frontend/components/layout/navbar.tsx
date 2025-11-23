"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Menu, Search, X, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter()
  const [showSearch, setShowSearch] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setUserEmail(localStorage.getItem("user_email") || "user@example.com")
  }, [])

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_email")
    localStorage.removeItem("user_name")
    // Clear cookie
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"
    router.push("/login")
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm"
    >
      <div className="flex items-center gap-3 flex-1">
        <motion.button
          onClick={onMenuClick}
          className="md:hidden text-foreground hover:text-primary transition-colors duration-200 p-2 rounded-lg hover:bg-muted/50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-5 h-5" />
        </motion.button>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center gap-2 bg-muted/30 border border-border/50 rounded-xl px-4 py-2 w-full max-w-md transition-all duration-200 focus-within:bg-background focus-within:border-primary/30 focus-within:shadow-lg focus-within:shadow-primary/5">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models, predictions..."
            className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
          />
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchQuery("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Mobile Search Button */}
        <motion.button
          onClick={() => setShowSearch(!showSearch)}
          className="md:hidden text-foreground hover:text-primary transition-colors duration-200 p-2 rounded-lg hover:bg-muted/50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Search className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <ThemeToggle />

        {/* Notification feature not yet implemented - keeping button hidden for now */}
        {/* Uncomment when notification system is ready
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative text-foreground hover:text-primary transition-colors duration-200 p-2 rounded-lg hover:bg-muted/50"
        >
          <Bell className="w-5 h-5" />
          <motion.span
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
        */}

        {/* Profile Dropdown */}
        <div className="relative">
          <motion.button
            onClick={() => setShowProfile(!showProfile)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center font-semibold shadow-lg shadow-primary/20 border-2 border-background"
          >
            {userEmail.charAt(0).toUpperCase()}
          </motion.button>

          <AnimatePresence>
            {showProfile && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfile(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-border bg-gradient-to-br from-muted/30 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center font-bold text-lg">
                        {userEmail.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{userEmail}</p>
                        <p className="text-xs text-muted-foreground">Developer</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={() => router.push("/settings")}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 text-foreground transition-colors duration-200 text-sm"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors duration-200 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 md:hidden"
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <motion.button
                  onClick={() => setShowSearch(false)}
                  className="text-foreground p-2"
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
                <h2 className="text-lg font-semibold text-foreground">Search</h2>
              </div>
              <div className="flex items-center gap-3 bg-muted/30 border border-border rounded-xl px-4 py-3">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search models, predictions..."
                  className="bg-transparent outline-none text-foreground placeholder:text-muted-foreground w-full"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
