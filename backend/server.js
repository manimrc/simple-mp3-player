import express from 'express'
import cors from 'cors'
import multer from 'multer'
import axios from 'axios'
import dotenv from 'dotenv'
import { authorizeB2, listFiles, uploadFile, deleteFile, getDownloadUrl, B2_BUCKET_NAME } from './b2Client.js'
import { validateApiKey } from './middleware/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'audio/mpeg' || file.originalname.endsWith('.mp3')) {
            cb(null, true)
        } else {
            cb(new Error('Only MP3 files are allowed'))
        }
    }
})

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'simple-mp3-player-backend' })
})

/**
 * GET /api/songs
 * List all MP3 files from B2 bucket
 */
app.get('/api/songs', validateApiKey, async (req, res) => {
    try {
        console.log('[List] Fetching songs from B2...')
        const files = await listFiles()

        // Transform files into a more friendly format
        const songs = files.map(file => {
            // Extract folder/album from path (e.g., "Rock/song.mp3" -> album: "Rock")
            const parts = file.fileName.split('/')
            const album = parts.length > 1 ? parts[0] : 'Unknown'
            const name = parts[parts.length - 1].replace('.mp3', '')

            return {
                id: file.fileId,
                fileName: file.fileName,
                name: name,
                album: album,
                size: file.contentLength,
                uploadedAt: file.uploadTimestamp
            }
        })

        console.log(`[List] Found ${songs.length} songs`)
        res.json({ songs })
    } catch (error) {
        console.error('[List] Error:', error.message)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /api/upload
 * Upload an MP3 file to B2
 * Body: multipart/form-data with 'file' field
 * Optional: 'album' field to organize into folders
 */
app.post('/api/upload', validateApiKey, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' })
        }

        const album = req.body.album || 'Uncategorized'
        const fileName = `${album}/${req.file.originalname}`

        console.log(`[Upload] Uploading ${fileName}...`)

        const result = await uploadFile(req.file.buffer, fileName, req.file.mimetype)

        console.log(`[Upload] Success: ${fileName}`)
        res.json({
            success: true,
            fileName: result.fileName,
            fileId: result.fileId,
            message: 'File uploaded successfully'
        })
    } catch (error) {
        console.error('[Upload] Error:', error.message)
        res.status(500).json({ error: error.message })
    }
})

/**
 * DELETE /api/songs/:fileName
 * Delete an MP3 file from B2
 * Params: fileName (URL encoded)
 * Query: fileId (required)
 */
app.delete('/api/songs/:fileName(*)', validateApiKey, async (req, res) => {
    try {
        const fileName = decodeURIComponent(req.params.fileName)
        const fileId = req.query.fileId

        if (!fileId) {
            return res.status(400).json({ error: 'fileId query parameter required' })
        }

        console.log(`[Delete] Deleting ${fileName}...`)

        await deleteFile(fileName, fileId)

        console.log(`[Delete] Success: ${fileName}`)
        res.json({
            success: true,
            message: 'File deleted successfully'
        })
    } catch (error) {
        console.error('[Delete] Error:', error.message)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /api/stream/:fileName
 * Stream an MP3 file from B2 with Range support
 * Params: fileName (URL encoded)
 */
app.get('/api/stream/:fileName(*)', validateApiKey, async (req, res) => {
    try {
        const fileName = decodeURIComponent(req.params.fileName)
        const range = req.headers.range

        console.log(`[Stream] Request for: ${fileName}`)

        // Authorize and get download URL
        await authorizeB2()
        const { authToken } = await authorizeB2()
        const fileUrl = getDownloadUrl(fileName)

        console.log(`[Stream] Proxying from: ${fileUrl}`)

        // Prepare headers for B2 request
        const headers = { 'Authorization': authToken }
        if (range) {
            headers['Range'] = range
            console.log(`[Stream] Range request: ${range}`)
        }

        // Request file from B2
        const b2Response = await axios({
            method: 'get',
            url: fileUrl,
            headers: headers,
            responseType: 'stream',
            validateStatus: (status) => status >= 200 && status < 300
        })

        console.log(`[Stream] B2 Response: ${b2Response.status}`)

        // Forward status and headers
        res.status(b2Response.status)

        const headersToForward = ['content-length', 'content-type', 'content-range', 'accept-ranges']
        headersToForward.forEach(header => {
            if (b2Response.headers[header]) {
                res.setHeader(header, b2Response.headers[header])
            }
        })

        // Ensure Content-Type
        if (!b2Response.headers['content-type']) {
            res.setHeader('Content-Type', 'audio/mpeg')
        }

        // Pipe the stream
        b2Response.data.pipe(res)

        b2Response.data.on('error', (err) => {
            console.error('[Stream] Stream error:', err)
            if (!res.headersSent) {
                res.status(500).json({ error: 'Streaming failed' })
            }
        })

    } catch (error) {
        console.error('[Stream] Error:', error.message)
        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'File not found in B2' })
        }
        if (!res.headersSent) {
            res.status(500).json({ error: error.message })
        }
    }
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err)
    res.status(500).json({ error: err.message || 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
    console.log(`🎵 Simple MP3 Player Backend running on http://localhost:${PORT}`)
    console.log(`📁 Bucket: ${B2_BUCKET_NAME}`)
})
