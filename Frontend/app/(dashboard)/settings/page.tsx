"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Copy, Trash2, Plus, Eye, EyeOff, Check, AlertCircle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { ApiKeyForm } from "@/components/api-key-form"
import { api } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ApiKey {
  id: string
  name: string
  key?: string // Only present when first created
  prefix?: string
  is_active: boolean
  last_used_at?: string
  expires_at?: string
  created_at: string
}

interface UserProfile {
  id: string
  email: string
  full_name?: string
  created_at: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showApiKeyForm, setShowApiKeyForm] = useState(false)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoadingKeys, setIsLoadingKeys] = useState(true)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [username, setUsername] = useState("")
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
    fetchApiKeys()
  }, [])

  const fetchProfile = async () => {
    setIsLoadingProfile(true)
    try {
      const response: any = await api.users.me()
      if (response.success) {
        setProfile(response.data)
        setUsername(response.data.full_name || "")
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message || "Failed to fetch user profile",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const fetchApiKeys = async () => {
    setIsLoadingKeys(true)
    try {
      const response: any = await api.apiKeys.list()
      if (response.success) {
        setApiKeys(response.data)
      }
    } catch (error: any) {
      toast({
        title: "Error loading API keys",
        description: error.message || "Failed to fetch API keys",
        variant: "destructive",
      })
    } finally {
      setIsLoadingKeys(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    })
  }

  const handleSave = async () => {
    try {
      await api.users.update({ full_name: username })
      setSaveSuccess(true)
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
      setTimeout(() => setSaveSuccess(false), 3000)
      fetchProfile()
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  const handleGenerateKey = async (keyName: string, expiresDays?: number) => {
    try {
      const response: any = await api.apiKeys.create(keyName, expiresDays)
      if (response.success) {
        // Store the newly created key to show it once
        setNewlyCreatedKey(response.data.api_key)
        toast({
          title: "API Key created",
          description: "Copy this key now - it won't be shown again!",
        })
        // Refresh the list
        fetchApiKeys()
      }
      setShowApiKeyForm(false)
    } catch (error: any) {
      toast({
        title: "Failed to create key",
        description: error.message || "Failed to generate API key",
        variant: "destructive",
      })
    }
  }

  const handleDeleteKey = async () => {
    if (!deleteKeyId) return

    try {
      await api.apiKeys.delete(deleteKeyId)
      toast({
        title: "API key revoked",
        description: "The API key has been successfully revoked",
      })
      fetchApiKeys()
      setDeleteKeyId(null)
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to revoke API key",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-4xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-4xl">
        {/* Profile Settings */}
        <motion.div variants={itemVariants}>
          <Card className="card-base card-hover p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Profile Settings</h2>
            {isLoadingProfile ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-5">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                  <Label htmlFor="email" className="text-foreground text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="mt-2 input-base opacity-60 cursor-not-allowed"
                  />
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                  <Label htmlFor="username" className="text-foreground text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="username"
                    placeholder="Your full name"
                    className="mt-2 input-base"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <Label className="text-foreground text-sm font-medium">Member Since</Label>
                  <p className="text-muted-foreground mt-2">{profile ? formatDate(profile.created_at) : "-"}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button onClick={handleSave} className="button-primary" disabled={isLoadingProfile}>
                    {saveSuccess ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Saved
                      </span>
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </motion.div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div variants={itemVariants}>
          <Card className="card-base card-hover p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Preferences</h2>
            <div className="space-y-4">
              <motion.div
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all duration-200"
                whileHover={{ x: 2 }}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">Receive updates about your models and predictions</p>
                </div>
                <motion.button
                  className="w-12 h-6 rounded-full bg-primary/30 relative transition-all duration-300"
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-primary absolute top-0.5 left-0.5"
                    animate={{ x: 24 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </motion.div>

              <motion.div
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all duration-200"
                whileHover={{ x: 2 }}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">Dark Mode</p>
                  <p className="text-xs text-muted-foreground mt-1">Switch between light and dark themes</p>
                </div>
                <motion.button
                  className="w-12 h-6 rounded-full bg-muted relative transition-all duration-300"
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-foreground absolute top-0.5 left-0.5"
                    animate={{ x: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* API Keys */}
        <motion.div variants={itemVariants}>
          <Card className="card-base card-hover p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">API Keys</h2>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" className="button-primary gap-2" onClick={() => setShowApiKeyForm(true)}>
                  <Plus className="w-4 h-4" />
                  Generate Key
                </Button>
              </motion.div>
            </div>

            {/* Show newly created key once */}
            {newlyCreatedKey && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-400">New API Key Created</p>
                    <p className="text-xs text-green-700 dark:text-green-500 mt-1">
                      Copy this key now - it won't be shown again!
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="px-3 py-1.5 bg-white dark:bg-gray-900 rounded border border-green-300 dark:border-green-700 text-xs font-mono flex-1">
                        {newlyCreatedKey}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleCopyKey(newlyCreatedKey)
                          setNewlyCreatedKey(null)
                        }}
                        className="shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {isLoadingKeys ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No API keys yet. Generate one to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {apiKeys.map((apiKey, index) => (
                    <motion.div
                      key={apiKey.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 2 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all duration-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{apiKey.name}</p>
                          {!apiKey.is_active && (
                            <Badge className="bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-muted-foreground font-mono">
                            {apiKey.key || `${apiKey.prefix || "mlp_"}••••••••`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>Created: {formatDate(apiKey.created_at)}</span>
                          {apiKey.last_used_at && <span>Last used: {formatDate(apiKey.last_used_at)}</span>}
                          {apiKey.expires_at && (
                            <span className="text-yellow-600 dark:text-yellow-400">
                              Expires: {formatDate(apiKey.expires_at)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {apiKey.key && (
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="button-outline gap-2 bg-transparent"
                              onClick={() => handleCopyKey(apiKey.key!)}
                            >
                              {copiedKey === apiKey.key ? (
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </motion.div>
                        )}
                        <AlertDialog open={deleteKeyId === apiKey.id} onOpenChange={(open) => !open && setDeleteKeyId(null)}>
                          <AlertDialogTrigger asChild>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="button-outline gap-2 bg-transparent hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400"
                                onClick={() => setDeleteKeyId(apiKey.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently revoke the API key "{apiKey.name}". This action cannot be undone and any applications using this key will stop working.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteKey}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                              >
                                Revoke Key
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={itemVariants}>
          <Card className="card-base border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5 p-6 card-hover">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Deleting your account is permanent and cannot be undone. All your models and data will be lost.
                </p>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button className="bg-red-600 hover:bg-red-700 text-white border-0">Delete Account</Button>
            </motion.div>
          </Card>
        </motion.div>
      </motion.div>

      {/* API Key Form Modal */}
      <AnimatePresence>
        {showApiKeyForm && <ApiKeyForm onClose={() => setShowApiKeyForm(false)} onGenerate={handleGenerateKey} />}
      </AnimatePresence>
    </div>
  )
}
