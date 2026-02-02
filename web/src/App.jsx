import { useState, useEffect, useRef } from 'react'
import { api } from './services/api'
import './App.css'

function App() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [selectedAlbum, setSelectedAlbum] = useState('Uncategorized')
  const audioRef = useRef(null)

  // Fetch songs on mount
  useEffect(() => {
    loadSongs()
  }, [])

  const loadSongs = async () => {
    try {
      setLoading(true)
      const data = await api.getSongs()
      setSongs(data.songs)
    } catch (error) {
      console.error('Failed to load songs:', error)
      alert('Failed to load songs')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploadProgress('Uploading...')
      await api.uploadSong(file, selectedAlbum)
      setUploadProgress('Upload successful!')
      setTimeout(() => setUploadProgress(null), 2000)
      loadSongs()
      e.target.value = ''
    } catch (error) {
      console.error('Upload failed:', error)
      setUploadProgress('Upload failed')
      setTimeout(() => setUploadProgress(null), 2000)
    }
  }

  const handleDelete = async (song) => {
    if (!confirm(`Delete "${song.name}"?`)) return

    try {
      await api.deleteSong(song.fileName, song.id)
      loadSongs()
      if (currentSong?.id === song.id) {
        setCurrentSong(null)
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete song')
    }
  }

  const playSong = (song) => {
    setCurrentSong(song)
    setIsPlaying(true)
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause()
    } else {
      audioRef.current?.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Group songs by album
  const songsByAlbum = songs.reduce((acc, song) => {
    if (!acc[song.album]) acc[song.album] = []
    acc[song.album].push(song)
    return acc
  }, {})

  const albums = Object.keys(songsByAlbum).sort()

  return (
    <div className="app">
      <header className="header">
        <h1>🎵 Simple MP3 Player</h1>
        <p>Personal Cloud Music Library</p>
      </header>

      <div className="upload-section">
        <div className="upload-controls">
          <input
            type="text"
            placeholder="Album name"
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="album-input"
          />
          <label className="upload-button">
            📤 Upload MP3
            <input
              type="file"
              accept="audio/mpeg,.mp3"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        {uploadProgress && <p className="upload-status">{uploadProgress}</p>}
      </div>

      <div className="library">
        {loading ? (
          <p>Loading songs...</p>
        ) : songs.length === 0 ? (
          <p>No songs yet. Upload your first MP3!</p>
        ) : (
          albums.map(album => (
            <div key={album} className="album-section">
              <h2 className="album-title">📁 {album}</h2>
              <div className="song-list">
                {songsByAlbum[album].map(song => (
                  <div
                    key={song.id}
                    className={`song-item ${currentSong?.id === song.id ? 'active' : ''}`}
                  >
                    <button
                      className="play-button"
                      onClick={() => playSong(song)}
                    >
                      {currentSong?.id === song.id && isPlaying ? '⏸' : '▶️'}
                    </button>
                    <div className="song-info">
                      <div className="song-name">{song.name}</div>
                      <div className="song-meta">
                        {(song.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(song)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {currentSong && (
        <div className="player">
          <div className="player-info">
            <span className="now-playing">Now Playing:</span>
            <span className="song-title">{currentSong.name}</span>
            <span className="album-name">({currentSong.album})</span>
          </div>
          <button className="player-button" onClick={togglePlayPause}>
            {isPlaying ? '⏸ Pause' : '▶️ Play'}
          </button>
          <audio
            ref={audioRef}
            src={api.getStreamUrl(currentSong.fileName)}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls
          />
        </div>
      )}
    </div>
  )
}

export default App
