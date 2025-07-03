'use client';

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Filters, ContentSource } from '../../types';

interface FilterBarProps {
    tags: string[];
    sources: ContentSource[];
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    onApply: () => void;
    showSeen: boolean;
    setShowSeen: (show: boolean) => void;
    isUserLoggedIn: boolean;
}

export default function FilterBar({ tags, sources, filters, setFilters, onApply, isUserLoggedIn, setShowSeen, showSeen }: FilterBarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleTagChange = (tag: string) => {
        const newTags = filters.tags.includes(tag)
            ? filters.tags.filter(t => t !== tag)
            : [...filters.tags, tag];
        setFilters({ ...filters, tags: newTags });
    };

    const handleSourceChange = (source: ContentSource) => {
        const newSources = filters.sources.includes(source)
            ? filters.sources.filter(s => s !== source)
            : [...filters.sources, source];
        setFilters({ ...filters, sources: newSources as ContentSource[] });
    };
    
    const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters({...filters, maxDuration: e.target.value === 'any' ? null : parseInt(e.target.value, 10)})
    }

    const resetFilters = () => {
        setFilters({ tags: [], sources: [], maxDuration: null });
    }

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 right-4 z-30 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Filter className="w-6 h-6" />}
            </button>
            
            <div className={`fixed top-0 right-0 h-full bg-gray-900 text-white p-6 z-20 transition-transform transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-80 shadow-2xl`}>
                <h3 className="text-2xl font-bold mb-6 mt-16">Filters</h3>
                {isUserLoggedIn && (
                    <div className="mb-6">
                        <h4 className="font-semibold mb-3">Preferences</h4>
                        <div className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                            <label htmlFor="show-seen" className="text-sm">Show Seen Videos</label>
                            <button
                                id="show-seen"
                                onClick={() => setShowSeen(!showSeen)}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${showSeen ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${showSeen ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                )}
                <div className="mb-6">
                    <h4 className="font-semibold mb-3">Source</h4>
                    <div className="flex flex-wrap gap-2">
                        {sources.map(source => (
                            <button key={source} onClick={() => handleSourceChange(source)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${filters.sources.includes(source) ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                {source.charAt(0).toUpperCase() + source.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <h4 className="font-semibold mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <button key={tag} onClick={() => handleTagChange(tag)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${filters.tags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <h4 className="font-semibold mb-2">Max Duration</h4>
                     <select onChange={handleDurationChange} value={filters.maxDuration || 'any'} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="any">Any</option>
                        <option value="60">Under 1 min</option>
                        <option value="180">Under 3 mins</option>
                        <option value="300">Under 5 mins</option>
                    </select>
                </div>

                <div className="absolute bottom-6 right-6 left-6 flex flex-col space-y-2">
                     <button onClick={resetFilters} className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-500 transition-colors">
                        Reset
                    </button>
                    <button onClick={() => { onApply(); setIsOpen(false); }} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Apply
                    </button>
                </div>
            </div>
        </>
    );
};
