import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { api } from './services/api'
import { MainLayout } from './components/layout/MainLayout'
import { LibraryScreen } from './components/library/LibraryScreen'
import { AlbumDetailScreen } from './components/album/AlbumDetailScreen'
import { PlayerBar } from './components/player/PlayerBar'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { X, Upload } from 'lucide-react'
import './index.css'

function App() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')

  // Navigation State
  const [view, setView] = useState('library') // 'library' or 'album'
  const [selectedAlbum, setSelectedAlbum] = useState(null)

  // Upload State
  const [showUpload, setShowUpload] = useState(false)
  const [uploadAlbum, setUploadAlbum] = useState('Uncategorized')
  const [uploadStatus, setUploadStatus] = useState(null)

  const audioRef = useRef(null)

  useEffect(() => {
    loadSongs()
  }, [])

  // Sync theme with document attribute and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Sync favicon
    const isLight = theme === 'pastel' || theme === 'tokyo-night';
    const favicon = document.getElementById('favicon');
    if (favicon) {
      favicon.href = isLight ? '/logo-light.png' : '/logo-dark.png';
    }
  }, [theme]);

  // Sync state with audio element
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name !== 'AbortError') {
            console.error('Playback failed:', error);
            setIsPlaying(false);
          }
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  // Spacebar toggle effect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentSong]);

  // Update document title with current song
  useEffect(() => {
    if (currentSong && isPlaying) {
      document.title = `▶ ${currentSong.name} - ikTarfa Music`;
    } else if (currentSong) {
      document.title = `${currentSong.name} - ikTarfa Music`;
    } else {
      document.title = 'ikTarfa Music';
    }
  }, [currentSong, isPlaying]);

  const loadSongs = async () => {
    try {
      setLoading(true)
      const data = await api.getSongs()
      setSongs(data.songs)
    } catch (error) {
      console.error('Failed to load songs:', error)
    } finally {
      setTimeout(() => setLoading(false), 800) // Small delay for shimmer feel
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploadStatus('Uploading...')
      await api.uploadSong(file, uploadAlbum)
      setUploadStatus('Upload successful!')
      setTimeout(() => {
        setUploadStatus(null)
        setShowUpload(false)
      }, 1500)
      loadSongs()
    } catch (error) {
      console.error('Upload failed:', error)
      setUploadStatus('Upload failed')
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

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const playSong = (song) => {
    if (currentSong?.id === song.id) {
      togglePlayPause()
    } else {
      setCurrentSong(song)
      setIsPlaying(true)
    }
  }

  const handleNext = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  }

  const handlePrevious = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
  }

  // Group songs by album
  const songsByAlbum = songs.reduce((acc, song) => {
    if (!acc[song.album]) acc[song.album] = []
    acc[song.album].push(song)
    return acc
  }, {})

  const albums = Object.keys(songsByAlbum).sort()

  const handleAlbumClick = (album) => {
    setSelectedAlbum(album)
    setView('album')
  }

  return (
    <MainLayout
      theme={theme}
      headerRight={
        <ThemeToggle currentTheme={theme} onThemeChange={setTheme} />
      }
      playerBar={
        <PlayerBar
          currentSong={currentSong}
          isPlaying={isPlaying}
          onTogglePlay={togglePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          audioRef={audioRef}
        />
      }
    >
      <AnimatePresence mode="wait">
        {view === 'library' ? (
          <LibraryScreen
            key="library"
            isLoading={loading}
            albums={albums}
            songsByAlbum={songsByAlbum}
            onAlbumClick={handleAlbumClick}
            onUploadClick={() => setShowUpload(true)}
          />
        ) : (
          <AlbumDetailScreen
            key="album"
            album={selectedAlbum}
            songs={songsByAlbum[selectedAlbum] || []}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onBack={() => setView('library')}
            onTrackClick={playSong}
            onDeleteTrack={handleDelete}
          />
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowUpload(false)}
            />
            <div className="glass w-full max-w-md p-8 rounded-2xl relative shadow-2xl flex flex-col items-center">
              <button
                onClick={() => setShowUpload(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-base transition-colors"
              >
                <X size={24} />
              </button>

              <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6 shadow-glow">
                <Upload size={32} />
              </div>

              <h2 className="text-2xl font-bold mb-2">Upload MP3</h2>
              <p className="text-text-muted mb-8 text-center">Add new tracks to your library</p>

              <input
                type="text"
                placeholder="Album name"
                value={uploadAlbum}
                onChange={(e) => setUploadAlbum(e.target.value)}
                className="w-full bg-surface-elevated rounded-lg px-4 py-3 mb-4 outline-none focus:ring-2 ring-primary transition-all text-text-base border border-white/5"
              />

              <label className="w-full">
                <div className="w-full bg-primary text-black font-bold py-4 rounded-lg flex items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
                  {uploadStatus || 'Select File'}
                </div>
                <input
                  type="file"
                  accept="audio/mpeg,.mp3"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentSong ? api.getStreamUrl(currentSong.fileName) : null}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleNext} // Auto-play next song
      />
    </MainLayout>
  )
}

export default App
