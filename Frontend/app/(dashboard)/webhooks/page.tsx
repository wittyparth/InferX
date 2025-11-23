"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Plus,
    Webhook,
    Trash2,
    TestTube,
    Loader2,
    Check,
    X,
    Edit,
    ExternalLink
} from "lucide-react"
import { api } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface WebhookData {
    id: string
    url: string
    events: string[]
    model_id?: string
    model_name?: string
    description?: string
    is_active: boolean
    secret: string
    created_at: string
    last_triggered_at?: string
}

export default function WebhooksPage() {
    const { toast } = useToast()
    const [webhooks, setWebhooks] = useState<WebhookData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [testingWebhook, setTestingWebhook] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        url: "",
        events: [] as string[],
        model_id: "",
        description: "",
    })

    useEffect(() => {
        fetchWebhooks()
    }, [])

    const fetchWebhooks = async () => {
        try {
            setIsLoading(true)
            const response: any = await api.webhooks.list()
            if (response.success) {
                setWebhooks(response.data)
            }
        } catch (error: any) {
            console.error("Failed to fetch webhooks:", error)
            toast({
                title: "Error",
                description: "Failed to load webhooks",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!formData.url || formData.events.length === 0) {
            toast({
                title: "Validation Error",
                description: "URL and at least one event are required",
                variant: "destructive",
            })
            return
        }

        try {
            const response: any = await api.webhooks.create(formData)
            if (response.success) {
                toast({
                    title: "Webhook created",
                    description: "Your webhook has been created successfully",
                })
                setShowCreateForm(false)
                setFormData({ url: "", events: [], model_id: "", description: "" })
                fetchWebhooks()
            }
        } catch (error: any) {
            toast({
                title: "Failed to create webhook",
                description: error.message || "An error occurred",
                variant: "destructive",
            })
        }
    }

    const handleDelete = async (id: string, url: string) => {
        if (!confirm(`Delete webhook for ${url}?`)) return

        try {
            await api.webhooks.delete(id)
            toast({
                title: "Webhook deleted",
                description: "The webhook has been removed",
            })
            fetchWebhooks()
        } catch (error: any) {
            toast({
                title: "Failed to delete webhook",
                description: error.message || "An error occurred",
                variant: "destructive",
            })
        }
    }

    const handleTest = async (id: string) => {
        try {
            setTestingWebhook(id)
            const response: any = await api.webhooks.test(id)
            if (response.success) {
                toast({
                    title: "Test successful",
                    description: "Webhook test event sent successfully",
                })
            }
        } catch (error: any) {
            toast({
                title: "Test failed",
                description: error.message || "Failed to send test event",
                variant: "destructive",
            })
        } finally {
            setTestingWebhook(null)
        }
    }

    const toggleEvent = (event: string) => {
        setFormData(prev => ({
            ...prev,
            events: prev.events.includes(event)
                ? prev.events.filter(e => e !== event)
                : [...prev.events, event]
        }))
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 },
        },
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-4xl font-semibold text-foreground">Webhooks</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage webhook notifications for prediction events
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Webhook
                </Button>
            </motion.div>

            {/* Create Form */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Create New Webhook</h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="url">Webhook URL</Label>
                                    <Input
                                        id="url"
                                        type="url"
                                        placeholder="https://your-domain.com/webhook"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label>Events to Subscribe</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {["prediction", "error", "model_update"].map((event) => (
                                            <Button
                                                key={event}
                                                type="button"
                                                variant={formData.events.includes(event) ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => toggleEvent(event)}
                                            >
                                                {formData.events.includes(event) && <Check className="w-3 h-3 mr-1" />}
                                                {event.replace("_", " ").charAt(0).toUpperCase() + event.slice(1).replace("_", " ")}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="What is this webhook for?"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="mt-2"
                                        rows={2}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleCreate}>Create Webhook</Button>
                                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Webhooks List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : webhooks.length === 0 ? (
                <Card className="p-12 text-center">
                    <Webhook className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No webhooks configured</h3>
                    <p className="text-muted-foreground mb-4">
                        Create your first webhook to receive event notifications
                    </p>
                    <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Webhook
                    </Button>
                </Card>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-4"
                >
                    <AnimatePresence>
                        {webhooks.map((webhook, index) => (
                            <motion.div
                                key={webhook.id}
                                variants={itemVariants}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card className="p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Webhook className="w-5 h-5 text-primary" />
                                                <a
                                                    href={webhook.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-lg font-semibold text-foreground hover:text-primary flex items-center gap-1"
                                                >
                                                    {webhook.url}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                                <Badge variant={webhook.is_active ? "default" : "secondary"}>
                                                    {webhook.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>

                                            {webhook.description && (
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {webhook.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {webhook.events.map((event) => (
                                                    <Badge key={event} variant="outline" className="text-xs">
                                                        {event.replace("_", " ")}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>Created: {formatDate(webhook.created_at)}</span>
                                                {webhook.last_triggered_at && (
                                                    <span>Last triggered: {formatDate(webhook.last_triggered_at)}</span>
                                                )}
                                            </div>

                                            {webhook.model_name && (
                                                <div className="mt-2">
                                                    <Badge variant="secondary">
                                                        Model: {webhook.model_name}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleTest(webhook.id)}
                                                disabled={testingWebhook === webhook.id}
                                                className="gap-2"
                                            >
                                                {testingWebhook === webhook.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <TestTube className="w-4 h-4" />
                                                )}
                                                Test
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDelete(webhook.id, webhook.url)}
                                                className="hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    )
}
