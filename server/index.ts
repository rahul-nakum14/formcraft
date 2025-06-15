import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"
import multer from "multer"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Create uploads directory
const uploadsDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    cb(null, file.fieldname + "-" + uniqueSuffix + extension)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow all files for now, validation will be done in frontend
    cb(null, true)
  },
})

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-domain.vercel.app"]
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir))

// File upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
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
      url: `/uploads/${req.file.filename}`,
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

// File download endpoint
app.get("/api/files/download/:filename", (req, res) => {
  try {
    const filename = req.params.filename
    const filePath = path.join(uploadsDir, filename)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" })
    }

    res.download(filePath, (err) => {
      if (err) {
        console.error("Download error:", err)
        res.status(500).json({ message: "Download failed" })
      }
    })
  } catch (error) {
    console.error("File download error:", error)
    res.status(500).json({ message: "File download failed" })
  }
})

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "../client/dist")
  app.use(express.static(clientDistPath))

  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(clientDistPath, "index.html"))
    }
  })
}

// Register routes
import { registerRoutes } from "./routes.js"
const server = registerRoutes(app)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
