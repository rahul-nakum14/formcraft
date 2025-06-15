import { Router } from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { authenticateToken } from "../middleware/auth"

const router = Router()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    cb(null, file.fieldname + "-" + uniqueSuffix + extension)
  },
})

// File filter for validation
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = req.body.allowedTypes ? req.body.allowedTypes.split(",") : []
  const maxSize = req.body.maxSize ? Number.parseInt(req.body.maxSize) : 5 // MB

  if (allowedTypes.length > 0) {
    const fileExtension = path.extname(file.originalname).toLowerCase()
    const mimeType = file.mimetype.toLowerCase()

    const isAllowed = allowedTypes.some((type: string) => {
      const cleanType = type.trim().toLowerCase()
      if (cleanType.startsWith(".")) {
        return fileExtension === cleanType
      } else if (cleanType.includes("/")) {
        if (cleanType.endsWith("/*")) {
          return mimeType.startsWith(cleanType.replace("/*", "/"))
        }
        return mimeType === cleanType
      } else {
        return mimeType.includes(cleanType) || fileExtension.includes(cleanType)
      }
    })

    if (!isAllowed) {
      return cb(new Error(`File type not allowed. Accepted types: ${allowedTypes.join(", ")}`))
    }
  }

  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
})

// Upload file endpoint
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/api/files/download/${req.file.filename}`,
    }

    res.json({
      message: "File uploaded successfully",
      file: fileInfo,
    })
  } catch (error) {
    console.error("File upload error:", error)
    res.status(500).json({ message: "File upload failed" })
  }
})

// Download file endpoint
router.get("/download/:filename", (req, res) => {
  try {
    const filename = req.params.filename
    const filePath = path.join(uploadsDir, filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" })
    }

    // Get file stats
    const stats = fs.statSync(filePath)

    // Set headers for download
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.setHeader("Content-Length", stats.size)

    // Stream the file
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
  } catch (error) {
    console.error("File download error:", error)
    res.status(500).json({ message: "File download failed" })
  }
})

// List files endpoint (for debugging)
router.get("/list", authenticateToken, (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir)
    res.json({ files })
  } catch (error) {
    console.error("File list error:", error)
    res.status(500).json({ message: "Failed to list files" })
  }
})

export default router
