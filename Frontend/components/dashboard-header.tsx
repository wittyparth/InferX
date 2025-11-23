"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export function DashboardHeader() {
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const name = localStorage.getItem("user_name") || localStorage.getItem("user_email") || "User"
    setUserName(name)
  }, [])

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {userName}</h1>
          <p className="text-muted-foreground">Here's what's happening with your models today</p>
        </div>
        <Card className="glass-effect border border-border/50 px-6 py-3">
          <div className="text-sm text-muted-foreground">Last updated</div>
          <div className="text-lg font-semibold text-foreground">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
