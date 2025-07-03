'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, LogIn, LogOut } from 'lucide-react';
import { useSupabase } from '../supabaseProvider';

export default function AuthManager() {
    const { supabase, session } = useSupabase();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    return (
        <>
            {session ? (
                 <button
                    onClick={handleLogout}
                    className="fixed bottom-4 right-4 z-30 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                    aria-label="Logout"
                >
                    <LogOut />
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-4 right-4 z-30 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                    aria-label="Login"
                >
                    <LogIn />
                </button>
            )}

            <AnimatePresence>
                {isOpen && !session && (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-gray-800 text-white rounded-xl shadow-2xl w-full max-w-md relative p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                             <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white"><X /></button>
                             <Auth
                                supabaseClient={supabase}
                                appearance={{ theme: ThemeSupa }}
                                theme="dark"
                                providers={[ 'github']} // Optional: add social logins
                                redirectTo={`${origin}`}
                             />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
