import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Moon, Sun, Cloud } from 'lucide-react';

const themes = [
    { id: 'dark', name: 'Spotify Dark', icon: Moon, color: '#1ed760' },
    { id: 'tokyo-night', name: 'Tokyo Night', icon: Sun, color: '#7aa2f7' },
    { id: 'pastel', name: 'Pastel Light', icon: Cloud, color: '#ffb7b2' },
];

export const ThemeToggle = ({ currentTheme, onThemeChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-surface-elevated hover:bg-surface-hover px-3 py-2 rounded-full border border-white/10 transition-colors"
                title="Switch Theme"
            >
                <Palette size={18} className="text-primary" />
                <span className="text-sm font-medium hidden sm:inline">Theme</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-48 bg-surface-elevated rounded-xl shadow-2xl z-50 overflow-hidden border border-white/10"
                        >
                            <div className="p-2 space-y-1">
                                {themes.map((theme) => {
                                    const Icon = theme.icon;
                                    const isActive = currentTheme === theme.id;
                                    return (
                                        <button
                                            key={theme.id}
                                            onClick={() => {
                                                onThemeChange(theme.id);
                                                setIsOpen(false);
                                            }}
                                            className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all
                        ${isActive ? 'bg-primary/20 text-text-base' : 'hover:bg-white/5 text-text-muted hover:text-text-base'}
                      `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: theme.color }}
                                                />
                                                <span>{theme.name}</span>
                                            </div>
                                            {isActive && <Check size={14} className="text-primary" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
