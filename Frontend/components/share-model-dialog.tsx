"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Loader2, UserPlus, Trash2 } from "lucide-react"
import { api } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface ShareUser {
    id: string
    shared_with_email: string
    shared_with_name: string
    permission: string
    created_at: string
}

interface ShareModelDialogProps {
    modelId: string
    modelName: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ShareModelDialog({ modelId, modelName, open, onOpenChange }: ShareModelDialogProps) {
    const { toast } = useToast()
    const [email, setEmail] = useState("")
    const [permission, setPermission] = useState("view")
    const [isSharing, setIsSharing] = useState(false)
    const [isLoadingShares, setIsLoadingShares] = useState(false)
    const [shares, setShares] = useState<ShareUser[]>([])

    const fetchShares = async () => {
        try {
            setIsLoadingShares(true)
            const response: any = await api.modelShares.list(modelId)
            if (response.success) {
                setShares(response.data)
            }
        } catch (error: any) {
            console.error("Failed to fetch shares:", error)
        } finally {
            setIsLoadingShares(false)
        }
    }

    const handleShare = async () => {
        if (!email.trim()) {
            toast({
                title: "Email required",
                description: "Please enter an email address",
                variant: "destructive",
            })
            return
        }

        try {
            setIsSharing(true)
            const response: any = await api.modelShares.create(modelId, email, permission)

            if (response.success) {
                toast({
                    title: "Model shared",
                    description: response.message || `Model shared with ${email}`,
                })
                setEmail("")
                fetchShares()
            }
        } catch (error: any) {
            toast({
                title: "Failed to share model",
                description: error.message || "An error occurred",
                variant: "destructive",
            })
        } finally {
            setIsSharing(false)
        }
    }

    const handleRevoke = async (shareId: string, email: string) => {
        if (!confirm(`Revoke access for ${email}?`)) return

        try {
            await api.modelShares.delete(modelId, shareId)
            toast({
                title: "Access revoked",
                description: `Removed sharing with ${email}`,
            })
            fetchShares()
        } catch (error: any) {
            toast({
                title: "Failed to revoke access",
                description: error.message || "An error occurred",
                variant: "destructive",
            })
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            fetchShares()
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Share Model</DialogTitle>
                    <DialogDescription>
                        Share "{modelName}" with other users
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Share Form */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email">User Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="permission">Permission Level</Label>
                            <select
                                id="permission"
                                value={permission}
                                onChange={(e) => setPermission(e.target.value)}
                                className="w-full mt-2 px-4 py-2 bg-input border border-border rounded-lg"
                            >
                                <option value="view">View - Can see model details</option>
                                <option value="use">Use - Can make predictions</option>
                                <option value="edit">Edit - Can modify model</option>
                            </select>
                        </div>

                        <Button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="w-full gap-2"
                        >
                            {isSharing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <UserPlus className="w-4 h-4" />
                            )}
                            Share Model
                        </Button>
                    </div>

                    {/* Shared With List */}
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold mb-3">Shared With</h4>

                        {isLoadingShares ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            </div>
                        ) : shares.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Not shared with anyone yet
                            </p>
                        ) : (
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {shares.map((share) => (
                                        <motion.div
                                            key={share.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    {share.shared_with_name || share.shared_with_email}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{share.shared_with_email}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="capitalize">
                                                    {share.permission}
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleRevoke(share.id, share.shared_with_email)}
                                                    className="hover:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
