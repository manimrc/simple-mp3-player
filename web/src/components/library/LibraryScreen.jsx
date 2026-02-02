import React from 'react';
import { motion } from 'framer-motion';
import { AlbumCard } from './AlbumCard';
import { Plus } from 'lucide-react';

export const LibraryScreen = ({ isLoading, albums, songsByAlbum, onAlbumClick, onUploadClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black mb-2">Your Library</h1>
                    <p className="text-text-muted">Cloud MP3 Collection</p>
                </div>
                <button
                    onClick={onUploadClick}
                    className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Upload MP3</span>
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                {isLoading ? (
                    // Skeleton Loaders
                    [...Array(10)].map((_, i) => (
                        <div key={i} className="bg-surface-elevated p-4 rounded-xl space-y-4">
                            <div className="aspect-square rounded-lg bg-text-muted/10 shimmer" />
                            <div className="space-y-2">
                                <div className="h-4 w-3/4 bg-text-muted/10 rounded shimmer" />
                                <div className="h-3 w-1/2 bg-text-muted/10 rounded shimmer" />
                            </div>
                        </div>
                    ))
                ) : (
                    <>
                        {albums.map((album) => (
                            <AlbumCard
                                key={album}
                                album={album}
                                songCount={songsByAlbum[album]?.length || 0}
                                onClick={() => onAlbumClick(album)}
                            />
                        ))}
                        {albums.length === 0 && (
                            <div className="col-span-full py-20 text-center glass rounded-2xl">
                                <p className="text-text-muted text-lg">No albums found. Upload some MP3s to get started!</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
};
