import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Clock, MoreVertical, Trash2 } from 'lucide-react';
import { TrackList } from './TrackList';

export const AlbumDetailScreen = ({ album, songs, currentSong, isPlaying, onBack, onTrackClick, onDeleteTrack }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-text-muted hover:text-white mb-8 transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Library
            </button>

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-end mb-16 relative">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl glass shadow-2xl flex items-center justify-center bg-gradient-to-br from-primary/10 to-surface-elevated flex-shrink-0 border border-white/10 group overflow-hidden">
                    <motion.span
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        className="text-9xl drop-shadow-2xl"
                    >
                        🎵
                    </motion.span>
                </div>

                <div className="flex-1">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-3">Album Collection</p>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter leading-none">{album}</h1>
                    <div className="flex items-center gap-5">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onTrackClick(songs[0])}
                            className="w-16 h-16 rounded-full bg-primary text-black flex items-center justify-center hover:shadow-glow transition-all shadow-xl"
                        >
                            <Play size={32} fill="black" className="ml-1" />
                        </motion.button>
                        <div className="text-text-muted font-bold text-sm md:text-base">
                            <span className="text-text-base">{songs.length}</span> {songs.length === 1 ? 'song' : 'songs'}
                            <span className="mx-3 opacity-20">•</span>
                            <span className="text-text-base">{(songs.reduce((acc, s) => acc + s.size, 0) / 1024 / 1024).toFixed(1)}</span> MB total
                        </div>
                    </div>
                </div>
            </div>

            <TrackList
                songs={songs}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onTrackClick={onTrackClick}
                onDeleteTrack={onDeleteTrack}
            />
        </motion.div>
    );
};
