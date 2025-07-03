'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { X, Plus, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Defines the shape of a channel object fetched from the database
interface CuratedChannel {
    id: number;
    channel_id: string;
    channel_name: string;
    channel_url: string;
}

// Defines the shape of the results after processing multiple URLs
interface ProcessResult {
    success: string[];
    errors: { url: string, message: string }[];
}

export default function ChannelManager() {
    const [isOpen, setIsOpen] = useState(false);
    const [channels, setChannels] = useState<CuratedChannel[]>([]);
    const [newChannelUrls, setNewChannelUrls] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processResult, setProcessResult] = useState<ProcessResult | null>(null);

    // Fetch the list of channels when the modal is opened
    useEffect(() => {
        if (isOpen) {
            fetchChannels();
        }
    }, [isOpen]);

    // Fetches all curated channels from the database
    const fetchChannels = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('curated_channels')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (data) setChannels(data);
        if (error) setError("Could not fetch channels.");
        setIsLoading(false);
    };

    // Handles the form submission for adding multiple channels
    const handleAddChannels = async (e: FormEvent) => {
        e.preventDefault();
        // 1. Split the textarea input by new lines, trim whitespace, and remove empty lines.
        const urls = newChannelUrls.split('\n').map(u => u.trim()).filter(Boolean);
        if (urls.length === 0) return;

        setIsLoading(true);
        setError(null);
        setProcessResult(null);

        const results: ProcessResult = { success: [], errors: [] };

        // 2. Process each URL concurrently using Promise.allSettled.
        // This ensures all requests are sent without waiting for the previous one to finish.
        await Promise.allSettled(urls.map(async (url) => {
            try {
                // 3. For each URL, send a POST request to our API endpoint.
                const response = await fetch('/api/channels', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url }),
                });

                const result = await response.json();

                if (!response.ok) {
                    // If the API returns an error, throw it to be caught by the catch block.
                    throw new Error(result.error || 'Failed to add channel.');
                }
                
                // On success, add the channel name to the success array for feedback.
                results.success.push(result.data.channel_name);
                // Optimistically add the new channel to the top of the UI list without re-fetching.
                setChannels(prev => [result.data, ...prev]);

            } catch (err: any) {
                // On failure, add the URL and error message to the errors array for feedback.
                results.errors.push({ url, message: err.message });
            }
        }));
        
        // 4. Set the results to be displayed in the UI, clear the textarea, and stop the loading state.
        setProcessResult(results);
        setNewChannelUrls('');
        setIsLoading(false);
    };

    // Handles deleting a channel from the list
    const handleDeleteChannel = async (id: number) => {
        const originalChannels = channels;
        // Optimistically remove the channel from the UI
        setChannels(channels.filter(c => c.id !== id));

        const response = await fetch(`/api/channels?id=${id}`, {
            method: 'DELETE',
        });

        // If the API call fails, revert the UI change.
        if (!response.ok) {
            setError('Failed to delete channel. Reverting.');
            setChannels(originalChannels);
        }
    };

    return (
        <>
            {/* Button to open the modal */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 left-4 z-30 bg-gray-700 text-white p-3 rounded-full shadow-lg hover:bg-gray-600 transition-colors"
                aria-label="Manage Channels"
            >
                <Plus />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-gray-800 text-white rounded-xl shadow-2xl w-full max-w-md relative"
                        >
                            <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white"><X /></button>
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-4">Manage Channels</h2>
                                
                                {/* Form for submitting multiple URLs */}
                                <form onSubmit={handleAddChannels} className="flex flex-col items-center gap-2 mb-4">
                                    <textarea
                                        value={newChannelUrls}
                                        onChange={(e) => setNewChannelUrls(e.target.value)}
                                        placeholder="Paste one or more YouTube channel URLs, one per line."
                                        className="w-full bg-gray-700 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 border-transparent"
                                        rows={4}
                                        disabled={isLoading}
                                    />
                                    <button type="submit" className="w-full bg-blue-600 p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-500 flex items-center justify-center" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="animate-spin" /> : <><Plus className="mr-2" /> Add Channels</>}
                                    </button>
                                </form>
                                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                                
                                {/* Section to display the results of the bulk add */}
                                {processResult && (
                                    <div className="text-sm space-y-2 my-4">
                                        {processResult.success.map((name, i) => (
                                            <div key={i} className="flex items-center text-green-400"><CheckCircle size={16} className="mr-2"/> Added: {name}</div>
                                        ))}
                                        {processResult.errors.map((err, i) => (
                                            <div key={i} className="flex items-center text-red-400"><XCircle size={16} className="mr-2"/> Failed: {err.url} ({err.message})</div>
                                        ))}
                                    </div>
                                )}

                                {/* List of currently curated channels */}
                                <div className="h-64 overflow-y-auto pr-2">
                                    {channels.map(channel => (
                                        <div key={channel.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md mb-2">
                                            <span className="truncate">{channel.channel_name}</span>
                                            <button onClick={() => handleDeleteChannel(channel.id)} className="text-gray-400 hover:text-red-400 p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}