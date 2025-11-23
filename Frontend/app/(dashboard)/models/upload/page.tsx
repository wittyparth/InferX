"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client"

export default function UploadModelPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    model_type: "sklearn",
  })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 100MB",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    const allowedExtensions = [".pkl", ".joblib", ".h5", ".pt", ".pth"]
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf("."))
    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
      toast({
        title: "Invalid file type",
        description: `Supported formats: ${allowedExtensions.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Missing information",
        description: "Model name is required",
        variant: "destructive",
      })
      return
    }

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a model file to upload",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const result = await api.models.upload(file, formData.name, formData.description, formData.model_type)

      clearInterval(progressInterval)
      setUploadProgress(100)

      toast({
        title: "Success!",
        description: `Model "${formData.name}" uploaded successfully`,
      })

      // Redirect to models page after short delay
      setTimeout(() => {
        router.push("/models")
      }, 1500)
    } catch (error: any) {
      setUploadProgress(0)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload model. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          href="/models"
          className="flex items-center gap-2 text-primary hover:text-accent transition-all duration-300 ease-out mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Models
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Upload Model</h1>
        <p className="text-muted-foreground">Add a new ML model to your platform</p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-2xl">
        <Card className="glass-effect border-border/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Model Name */}
            <div>
              <Label htmlFor="name" className="text-foreground">
                Model Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., ResNet-50"
                className="mt-2 bg-input border-border/50"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isUploading}
                required
              />
            </div>

            {/* Model Type (Framework) */}
            <div>
              <Label htmlFor="model_type" className="text-foreground">
                Framework <span className="text-red-500">*</span>
              </Label>
              <select
                id="model_type"
                className="w-full mt-2 px-4 py-2 bg-input border border-border/50 rounded-lg text-foreground"
                value={formData.model_type}
                onChange={(e) => setFormData({ ...formData, model_type: e.target.value })}
                disabled={isUploading}
                required
              >
                <option value="sklearn">Scikit-learn</option>
                <option value="tensorflow">TensorFlow</option>
                <option value="pytorch">PyTorch</option>
                <option value="xgboost">XGBoost</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">Select the ML framework used to train this model</p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your model, its purpose, training data, features, etc..."
                className="mt-2 bg-input border-border/50"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isUploading}
              />
            </div>

            {/* File Upload */}
            <div>
              <Label className="text-foreground mb-2 block">
                Model File <span className="text-red-500">*</span>
              </Label>
              <input
                type="file"
                id="file-input"
                className="hidden"
                accept=".pkl,.joblib,.h5,.pt,.pth"
                onChange={handleFileInputChange}
                disabled={isUploading}
              />
              <motion.label
                htmlFor="file-input"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`block border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ease-out cursor-pointer ${isDragging
                    ? "border-primary bg-primary/10"
                    : file
                      ? "border-green-500 bg-green-500/10"
                      : "border-border/50 hover:border-primary/50"
                  } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {file ? (
                  <>
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-foreground font-semibold">{file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    {!isUploading && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setFile(null)
                        }}
                        className="mt-3 text-sm text-primary hover:underline"
                      >
                        Choose different file
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-foreground font-semibold">Drag and drop your model file</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported: .pkl, .joblib (sklearn), .h5 (tensorflow), .pt/.pth (pytorch)
                    </p>
                    <p className="text-xs text-muted-foreground">Maximum file size: 100MB</p>
                  </>
                )}
              </motion.label>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="text-foreground font-semibold">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Model
                  </>
                )}
              </Button>
              <Link href="/models" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border/50 bg-transparent"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
