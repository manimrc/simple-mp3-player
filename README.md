# ikTarfa Music - Personal Cloud Music Library

A minimalist personal cloud MP3 player with no database required. Store your music in a private Backblaze B2 bucket and stream it securely through a backend proxy.

## 🎯 Features

- **No Database**: Files stored directly in B2, no Supabase or PostgreSQL needed
- **Private Storage**: Your B2 bucket stays private, backend handles all authentication
- **Simple API**: 4 REST endpoints (list, upload, delete, stream)
- **Album Organization**: Folder-based albums (folder name = album name)
- **Range Support**: Seeking/scrubbing works perfectly
- **Cross-Platform**: Web app (React) + Mobile app (React Native - coming soon)
- **API Key Auth**: Simple, secure authentication

---

## 📁 Project Structure

```
simple-mp3-player/
├── backend/          # Node.js + Express API
│   ├── server.js     # Main server with 4 endpoints
│   ├── b2Client.js   # Backblaze B2 wrapper
│   └── middleware/   # API key authentication
└── web/              # React web frontend
```

---

## 🚀 Quick Start

### Prerequisites

1. **Backblaze B2 Account** (free tier: 10GB)
2. **Node.js** (v18 or higher)
3. **B2 Application Key** with read/write access

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Create `.env` file:
   ```env
   PORT=3002
   
   # Your B2 credentials
   B2_APPLICATION_KEY_ID=your_key_id
   B2_APPLICATION_KEY=your_application_key
   B2_BUCKET_ID=your_bucket_id
   B2_BUCKET_NAME=your_bucket_name
   
   # Generate a random API key
   API_KEY=your_secure_random_key_here
   ```

4. **Start backend:**
   ```bash
   npm run dev
   ```
   
   Backend runs on `http://localhost:3002`

### Web Frontend Setup

1. **Navigate to web:**
   ```bash
   cd web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Create `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:3002
   VITE_API_KEY=your_secure_random_key_here
   ```
   
   ⚠️ **Important**: Use the same API key as backend

4. **Start frontend:**
   ```bash
   npm run dev
   ```
   
   Frontend runs on `http://localhost:5173` (or 5174 if 5173 is busy)

---

## 📡 API Endpoints

All endpoints require `X-API-Key` header.

### 1. List Songs
```http
GET /api/songs
X-API-Key: your_api_key

Response:
{
  "songs": [
    {
      "id": "file_id",
      "fileName": "Rock/song.mp3",
      "name": "song",
      "album": "Rock",
      "size": 5242880,
      "uploadedAt": 1234567890
    }
  ]
}
```

### 2. Upload Song
```http
POST /api/upload
X-API-Key: your_api_key
Content-Type: multipart/form-data

Body:
- file: (MP3 file)
- album: "Rock" (optional, defaults to "Uncategorized")

Response:
{
  "success": true,
  "fileName": "Rock/song.mp3",
  "fileId": "..."
}
```

### 3. Delete Song
```http
DELETE /api/songs/:fileName?fileId=xxx
X-API-Key: your_api_key

Response:
{
  "success": true,
  "message": "File deleted successfully"
}
```

### 4. Stream Song
```http
GET /api/stream/:fileName
X-API-Key: your_api_key
Range: bytes=0-1023 (optional)

Response: Audio stream with Range support
```

---

## 🎵 How to Use

1. **Open the web app** at `http://localhost:5173`
2. **Upload MP3s:**
   - Enter an album name (or leave as "Uncategorized")
   - Click "📤 Upload MP3"
   - Select your MP3 file
3. **Play music:**
   - Songs are grouped by album
   - Click ▶️ to play any song
   - Use the built-in audio controls to seek/adjust volume
4. **Delete songs:**
   - Click 🗑️ next to any song to delete it

---

## 🔒 Security

- **API Key**: Simple but effective for single-user apps
- **Private Bucket**: B2 bucket must be private
- **Backend Proxy**: Frontend never sees B2 credentials
- **CORS**: Configure for your domain in production

### Production Deployment

**Backend:**
- Deploy to Railway, Render, or Fly.io
- Set environment variables
- Enable HTTPS

**Frontend:**
- Deploy to Vercel or Netlify
- Update `VITE_API_BASE_URL` to your backend URL
- **Never commit `.env` files**

---

## 🆚 Differences from V1 (Spotify Clone)

| Feature | V1 (Spotify Clone) | V2 (Simple Player) |
|---------|-------------------|-------------------|
| Database | ✅ Supabase | ❌ None |
| Auth | ✅ Full user system | ✅ API key only |
| Playlists | ✅ Yes | ❌ No (use folders) |
| Multi-user | ✅ Yes | ❌ Single user |
| Complexity | High | Low |
| Setup Time | 30 min | 5 min |

---

## 🐛 Troubleshooting

**Q: "Failed to fetch songs"**
- Check backend is running on port 3002
- Verify API key matches in both `.env` files
- Check browser console for CORS errors

**Q: "Upload failed"**
- Verify B2 credentials are correct
- Check B2 application key has write permissions
- Ensure file is under 50MB

**Q: "Song won't play"**
- Check browser console for streaming errors
- Verify file exists in B2 bucket
- Test streaming endpoint directly: `curl -H "X-API-Key: xxx" http://localhost:3002/api/stream/yourfile.mp3`

---

## 📱 Mobile App (Coming Soon)

React Native + Expo mobile app with:
- Same features as web
- Offline caching with AsyncStorage
- Background audio playback
- iOS + Android support

---

## 📝 License

MIT - Use freely for personal projects

---

## 🙏 Credits

Built as a simplified alternative to the full Spotify clone (V1). Perfect for personal use without the complexity of databases and multi-user systems.
