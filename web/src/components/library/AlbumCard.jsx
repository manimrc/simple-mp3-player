import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export const AlbumCard = ({ album, songCount, onClick }) => {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            className="group bg-surface-elevated p-4 rounded-2xl transition-all duration-300 hover:bg-surface-hover cursor-pointer border border-white/5 hover:border-primary/20 shadow-lg hover:shadow-primary/5"
            onClick={onClick}
        >
            <div className="relative aspect-square mb-4 rounded-xl overflow-hidden glass shadow-inner">
                {/* Placeholder for Album Art */}
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full h-full bg-gradient-to-br from-primary/10 to-surface-elevated flex items-center justify-center"
                >
                    <span className="text-5xl drop-shadow-2xl">🎵</span>
                </motion.div>

                {/* Hover Play Button (Modern Style) */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 20 }}
                        whileHover={{ scale: 1.1 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 transform"
                    >
                        <Play className="text-black fill-black ml-1" size={28} />
                    </motion.div>
                </div>
            </div>

            <h3 className="font-bold text-lg truncate mb-1 text-text-base">{album}</h3>
            <p className="text-text-muted text-sm font-medium">{songCount} {songCount === 1 ? 'Song' : 'Songs'}</p>
        </motion.div>
    );
};
