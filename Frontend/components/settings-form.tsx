"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Lock, Eye } from "lucide-react"

export function SettingsForm() {
  const [settings, setSettings] = useState({
    email: "user@example.com",
    fullName: "John Doe",
    apiKey: "sk_live_••••••••••••••••",
    notifications: {
      emailAlerts: true,
      predictionUpdates: true,
      weeklyReport: true,
    },
    privacy: {
      dataCollection: true,
      analyticsTracking: false,
    },
  })

  const [showApiKey, setShowApiKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleToggle = (section: string, key: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key],
      },
    }))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Account Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-effect border border-border/50 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" />
            Account Settings
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input
                value={settings.fullName}
                onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                className="bg-input border-border/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="bg-input border-border/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">API Key</label>
              <div className="flex gap-2">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={settings.apiKey}
                  readOnly
                  className="bg-input border-border/50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="border-border/50 hover:bg-primary/10 bg-transparent"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-effect border border-border/50 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent" />
            Notifications
          </h3>

          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                  <p className="text-sm text-muted-foreground">
                    {key === "emailAlerts" && "Get notified about important events"}
                    {key === "predictionUpdates" && "Receive updates on model predictions"}
                    {key === "weeklyReport" && "Get a weekly summary report"}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("notifications", key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Privacy Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="glass-effect border border-border/50 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Privacy & Data</h3>

          <div className="space-y-4">
            {Object.entries(settings.privacy).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                  <p className="text-sm text-muted-foreground">
                    {key === "dataCollection" && "Allow us to collect usage data"}
                    {key === "analyticsTracking" && "Enable analytics tracking"}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("privacy", key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex gap-3">
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            {saved ? "Saved!" : "Save Changes"}
          </Button>
          <Button variant="outline" className="border-border/50 bg-transparent">
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
