const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002'
const API_KEY = import.meta.env.VITE_API_KEY

const headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
}

export const api = {
    async getSongs() {
        const response = await fetch(`${API_BASE_URL}/api/songs`, { headers })
        if (!response.ok) throw new Error('Failed to fetch songs')
        return response.json()
    },

    async uploadSong(file, album = 'Uncategorized') {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('album', album)

        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            headers: { 'X-API-Key': API_KEY },
            body: formData
        })

        if (!response.ok) throw new Error('Failed to upload song')
        return response.json()
    },

    async deleteSong(fileName, fileId) {
        const response = await fetch(
            `${API_BASE_URL}/api/songs/${encodeURIComponent(fileName)}?fileId=${fileId}`,
            {
                method: 'DELETE',
                headers
            }
        )

        if (!response.ok) throw new Error('Failed to delete song')
        return response.json()
    },

    getStreamUrl(fileName) {
        return `${API_BASE_URL}/api/stream/${encodeURIComponent(fileName)}?apiKey=${encodeURIComponent(API_KEY)}`
    },

    getStreamHeaders() {
        return { 'X-API-Key': API_KEY }
    }
}
