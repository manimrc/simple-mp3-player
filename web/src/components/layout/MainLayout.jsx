import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const MainLayout = ({ children, headerRight, playerBar, theme }) => {
    return (
        <div className="flex flex-col h-screen bg-surface text-text-base overflow-hidden transition-colors duration-500">
            {/* Brand Header */}
            <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between glass z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer">
                        <span className="text-black font-black text-xl tracking-tighter leading-none select-none">i’M</span>
                    </div>
                    <span className="font-black text-xl tracking-tight hidden sm:block">ikTarfa Music</span>
                </div>

                <div className="flex items-center gap-4">
                    {headerRight}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                {/* Background Ambient Glow */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
                    <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full" />
                </div>

                <div className="max-w-[1400px] mx-auto p-4 md:p-8 pb-32 relative">
                    {children}
                </div>
            </main>

            {/* Sticky Player Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                {playerBar}
            </div>
        </div>
    );
};
