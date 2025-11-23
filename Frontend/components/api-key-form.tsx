"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { AlertCircle, X } from "lucide-react"

interface ApiKeyFormProps {
  onClose: () => void
  onGenerate: (keyName: string) => void
}

export function ApiKeyForm({ onClose, onGenerate }: ApiKeyFormProps) {
  const [keyName, setKeyName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!keyName.trim()) {
      setError("Key name is required")
      return
    }

    if (keyName.length < 3) {
      setError("Key name must be at least 3 characters")
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsLoading(false)

    onGenerate(keyName)
    setKeyName("")
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div onClick={(e) => e.stopPropagation()}>
        <Card className="card-base p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Generate API Key</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="keyName" className="text-foreground text-sm font-medium">
                Key Name
              </Label>
              <Input
                id="keyName"
                placeholder="e.g., Production API Key"
                value={keyName}
                onChange={(e) => {
                  setKeyName(e.target.value)
                  setError("")
                }}
                className="mt-2 input-base"
                disabled={isLoading}
              />
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                API keys are sensitive. Store them securely and never share them publicly.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="button-outline bg-transparent flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button type="submit" className="button-primary w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    "Generate Key"
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  )
}
