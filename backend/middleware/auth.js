import dotenv from 'dotenv'

dotenv.config()

const API_KEY = process.env.API_KEY

/**
 * Middleware to validate API key
 * Accepts API key from header (X-API-Key) or query parameter (apiKey)
 */
export const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey

    if (!apiKey) {
        return res.status(401).json({ error: 'API key required. Provide X-API-Key header or apiKey query parameter.' })
    }

    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: 'Invalid API key' })
    }

    next()
}

