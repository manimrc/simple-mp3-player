import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Clock, Trash2 } from 'lucide-react';

export const TrackList = ({ songs, currentSong, isPlaying, onTrackClick, onDeleteTrack }) => {
    return (
        <div className="mt-8">
            <div className="grid grid-cols-[3rem_1fr_4rem] gap-4 px-4 py-3 text-text-muted text-xs uppercase tracking-widest font-bold border-b border-text-muted/10 mb-4 opacity-70">
                <div className="text-center">#</div>
                <div>Title</div>
                <div className="flex justify-end pr-4"><Clock size={14} /></div>
            </div>

            <div className="space-y-1">
                {songs.map((song, index) => {
                    const isActive = currentSong?.id === song.id;
                    return (
                        <motion.div
                            key={song.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`
                grid grid-cols-[3rem_1fr_auto] gap-4 px-4 py-3 rounded-xl 
                group transition-all duration-300 cursor-pointer items-center
                ${isActive ? 'bg-primary/10 shadow-inner' : 'hover:bg-text-muted/5'}
              `}
                            onClick={() => onTrackClick(song)}
                        >
                            <div className="text-center flex items-center justify-center">
                                {isActive && isPlaying ? (
                                    <div className="w-5 h-5 flex items-end gap-[1.5px] pb-[2px]">
                                        {[...Array(4)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ height: ['30%', '100%', '50%', '100%'] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                                                className="w-1 bg-primary rounded-full"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-5 h-5 flex items-center justify-center relative">
                                        <span className={`group-hover:opacity-0 transition-opacity ${isActive ? 'text-primary font-bold' : 'text-text-muted'}`}>
                                            {index + 1}
                                        </span>
                                        <Play size={16} className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 text-primary fill-primary transition-opacity" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col min-w-0">
                                <span className={`font-semibold truncate text-[15px] ${isActive ? 'text-primary' : 'text-text-base'}`}>
                                    {song.name}
                                </span>
                                <span className="text-text-muted text-xs truncate font-medium">
                                    {song.album}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteTrack(song);
                                        }}
                                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="text-text-muted text-sm w-16 text-right tabular-nums font-medium pr-4">
                                    {(song.size / 1024 / 1024).toFixed(1)} MB
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
