import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';

export const PlayerBar = ({
    currentSong,
    isPlaying,
    onTogglePlay,
    onNext,
    onPrevious,
    audioRef
}) => {
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
                setCurrentTime(audio.currentTime);
                setDuration(audio.duration);
            }
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', updateProgress);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', updateProgress);
        };
    }, [audioRef]);

    const handleSeek = (e) => {
        const audio = audioRef.current;
        if (!audio || !audio.duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pos * audio.duration;
    };

    const handleVolumeChange = (e) => {
        const audio = audioRef.current;
        if (!audio) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.volume = pos;
        setVolume(pos);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="glass px-4 py-3 md:px-6 md:py-4 flex flex-col md:grid md:grid-cols-3 items-center gap-4 bg-black/80 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] min-h-[90px] backdrop-blur-2xl"
        >
            {/* Song Info */}
            <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/30 to-surface-elevated flex-shrink-0 flex items-center justify-center shadow-inner overflow-hidden border border-white/5">
                    <AnimatePresence mode="wait">
                        {currentSong ? (
                            <motion.span
                                key="music"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-2xl"
                            >
                                🎵
                            </motion.span>
                        ) : (
                            <motion.span
                                key="empty"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-2xl grayscale"
                            >
                                🌑
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
                <div className="min-w-0 flex-1 md:flex-none">
                    <h4 className="text-sm md:text-base font-bold truncate text-text-base">
                        {currentSong ? currentSong.name : 'No track selected'}
                    </h4>
                    <p className="text-xs md:text-sm text-text-muted truncate">
                        {currentSong ? currentSong.album : 'Select a song to play'}
                    </p>
                </div>
            </div>

            {/* Controls & Progress */}
            <div className={`flex flex-col items-center gap-2 w-full max-w-[600px] ${!currentSong ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-4 md:gap-6">
                    <button
                        onClick={onPrevious}
                        className="text-text-muted hover:text-text-base transition-colors p-2"
                    >
                        <SkipBack size={20} fill="currentColor" />
                    </button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onTogglePlay}
                        className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-text-base flex items-center justify-center text-surface shadow-xl"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
                    </motion.button>

                    <button
                        onClick={onNext}
                        className="text-text-muted hover:text-text-base transition-colors p-2"
                    >
                        <SkipForward size={20} fill="currentColor" />
                    </button>
                </div>

                <div className="w-full flex items-center gap-3">
                    <span className="text-[10px] md:text-xs text-text-muted w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
                    <div
                        className="flex-1 h-1.5 bg-text-muted/10 rounded-full relative cursor-pointer group"
                        onClick={handleSeek}
                    >
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-primary rounded-full group-hover:bg-primary/80 transition-colors shadow-[0_0_10px_rgba(30,215,96,0.3)]"
                            style={{ width: `${progress}%` }}
                        />
                        <motion.div
                            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-text-base rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity border-2 border-surface"
                            style={{ left: `calc(${progress}% - 7px)` }}
                        />
                    </div>
                    <span className="text-[10px] md:text-xs text-text-muted w-10 tabular-nums">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Extra Controls (Desktop only) */}
            <div className="hidden md:flex items-center justify-end gap-5 w-full">
                <div className="flex items-center gap-3 w-32">
                    <button
                        onClick={() => {
                            const audio = audioRef.current;
                            if (!audio) return;
                            const newVolume = volume === 0 ? 0.5 : 0;
                            audio.volume = newVolume;
                            setVolume(newVolume);
                        }}
                        className="text-text-muted hover:text-text-base transition-colors"
                    >
                        {volume === 0 ? <Volume2 size={18} className="opacity-50" /> : <Volume2 size={18} />}
                    </button>
                    <div
                        className="flex-1 h-1 bg-text-muted/10 rounded-full relative cursor-pointer group"
                        onClick={handleVolumeChange}
                    >
                        <div
                            className="absolute top-0 left-0 h-full bg-text-base/40 group-hover:bg-primary transition-colors rounded-full"
                            style={{ width: `${volume * 100}%` }}
                        />
                    </div>
                </div>
                <button className="text-text-muted hover:text-text-base transition-colors">
                    <Maximize2 size={18} />
                </button>
            </div>
        </motion.div>
    );
};
