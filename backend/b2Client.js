import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const B2_KEY_ID = process.env.B2_APPLICATION_KEY_ID
const B2_KEY = process.env.B2_APPLICATION_KEY
const B2_BUCKET_ID = process.env.B2_BUCKET_ID
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME

// Cache for B2 authorization
let b2AuthToken = null
let b2ApiUrl = null
let b2DownloadUrl = null
let b2AuthTime = 0
const AUTH_CACHE_DURATION = 23 * 60 * 60 * 1000 // 23 hours

/**
 * Authorize with Backblaze B2 and cache the token
 */
export const authorizeB2 = async () => {
    const now = Date.now()
    if (b2AuthToken && b2ApiUrl && b2DownloadUrl && (now - b2AuthTime < AUTH_CACHE_DURATION)) {
        return { authToken: b2AuthToken, apiUrl: b2ApiUrl, downloadUrl: b2DownloadUrl }
    }

    try {
        const credentials = Buffer.from(`${B2_KEY_ID}:${B2_KEY}`).toString('base64')
        const response = await axios.get('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
            headers: { 'Authorization': `Basic ${credentials}` }
        })

        b2AuthToken = response.data.authorizationToken
        b2ApiUrl = response.data.apiUrl
        b2DownloadUrl = response.data.downloadUrl
        b2AuthTime = now

        return { authToken: b2AuthToken, apiUrl: b2ApiUrl, downloadUrl: b2DownloadUrl }
    } catch (error) {
        console.error('B2 Authorization failed:', error.message)
        throw new Error('Failed to authorize with Backblaze B2')
    }
}

/**
 * List all files in the B2 bucket
 */
export const listFiles = async () => {
    const { authToken, apiUrl } = await authorizeB2()

    try {
        const response = await axios.post(`${apiUrl}/b2api/v2/b2_list_file_names`, {
            bucketId: B2_BUCKET_ID,
            maxFileCount: 10000
        }, {
            headers: { 'Authorization': authToken }
        })

        return response.data.files.filter(file =>
            file.fileName.toLowerCase().endsWith('.mp3')
        )
    } catch (error) {
        console.error('Failed to list files:', error.message)
        throw new Error('Failed to list files from B2')
    }
}

/**
 * Get upload URL for B2
 */
export const getUploadUrl = async () => {
    const { authToken, apiUrl } = await authorizeB2()

    try {
        const response = await axios.post(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
            bucketId: B2_BUCKET_ID
        }, {
            headers: { 'Authorization': authToken }
        })

        return {
            uploadUrl: response.data.uploadUrl,
            authToken: response.data.authorizationToken
        }
    } catch (error) {
        console.error('Failed to get upload URL:', error.message)
        throw new Error('Failed to get upload URL from B2')
    }
}

/**
 * Upload file to B2
 */
export const uploadFile = async (fileBuffer, fileName, contentType = 'audio/mpeg') => {
    const { uploadUrl, authToken } = await getUploadUrl()

    try {
        const response = await axios.post(uploadUrl, fileBuffer, {
            headers: {
                'Authorization': authToken,
                'X-Bz-File-Name': encodeURIComponent(fileName),
                'Content-Type': contentType,
                'X-Bz-Content-Sha1': 'do_not_verify'
            }
        })

        return response.data
    } catch (error) {
        console.error('Failed to upload file:', error.message)
        throw new Error('Failed to upload file to B2')
    }
}

/**
 * Delete file from B2
 */
export const deleteFile = async (fileName, fileId) => {
    const { authToken, apiUrl } = await authorizeB2()

    try {
        await axios.post(`${apiUrl}/b2api/v2/b2_delete_file_version`, {
            fileName: fileName,
            fileId: fileId
        }, {
            headers: { 'Authorization': authToken }
        })

        return true
    } catch (error) {
        console.error('Failed to delete file:', error.message)
        throw new Error('Failed to delete file from B2')
    }
}

/**
 * Get download URL for a file
 */
export const getDownloadUrl = (fileName) => {
    if (!b2DownloadUrl) {
        throw new Error('B2 not authorized. Call authorizeB2() first.')
    }
    return `${b2DownloadUrl}/file/${B2_BUCKET_NAME}/${encodeURIComponent(fileName)}`
}

export { B2_BUCKET_NAME }
