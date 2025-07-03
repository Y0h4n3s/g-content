import React from 'react';
import { Youtube, Twitter, Rss, Clock, ThumbsUp, Bookmark, Share2 } from 'lucide-react';
import { Content, ContentSource } from '../../types';
import VideoPlayer from './VideoPlayer';

interface ContentCardProps {
  item: Content;
  isActive: boolean; // To control autoplay
}

const SourceIcon: React.FC<{ source: ContentSource; className?: string }> = ({ source, className }) => {
  switch (source) {
    case 'youtube': return <Youtube className={className} />;
    case 'twitter': return <Twitter className={className} />;
    case 'rss': return <Rss className={className} />;
    default: return null;
  }
};

// Helper to extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        }
        if (urlObj.hostname.includes('youtube.com')) {
            return urlObj.searchParams.get('v');
        }
    } catch (e) {
        console.error("Invalid URL", e);
    }
    return null;
}

export default function ContentCard({ item, isActive }: ContentCardProps) {
  if (!item) return null;
  
  const videoId = item.source === 'youtube' ? getYouTubeVideoId(item.url) : null;

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="h-full w-full max-w-sm mx-auto bg-black rounded-2xl shadow-2xl overflow-hidden relative text-white flex flex-col">
      {/* Video Player or Thumbnail */}
      {videoId && item.thumbnail ? (
          <VideoPlayer videoId={videoId} thumbnail={item.thumbnail} title={item.title} isActive={isActive} />
      ) : (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <img src={item.thumbnail || 'https://placehold.co/500x800/1a1a1a/ffffff?text=Preview'} alt={item.title} className="w-full h-full object-cover opacity-30" />
              <p className="z-10 text-gray-400">Preview not available for this source.</p>
          </div>
      )}
      
      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

      {/* Content Info Overlay */}
      <div className="relative z-10 flex flex-col justify-end h-full p-6 space-y-4">
        <div className="flex-grow"></div>
        <header className="flex items-center space-x-3">
          <SourceIcon source={item.source} className="w-6 h-6 text-gray-300" />
          <span className="font-semibold text-gray-300 capitalize">{item.author || 'Unknown Author'}</span>
        </header>
        <main>
          <h2 className="text-xl font-bold leading-tight mb-2">{item.title}</h2>
          <p className="text-gray-300 text-sm leading-relaxed max-h-20 overflow-y-auto">{item.summary || 'No summary available.'}</p>
        </main>
        <footer className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {item.tags?.map(tag => (
              <span key={tag} className="bg-white/10 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
          <div className="flex justify-between items-center text-gray-400">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(item.duration_sec)}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-white/20 rounded-full transition-colors"><ThumbsUp className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-white/20 rounded-full transition-colors"><Bookmark className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-white/20 rounded-full transition-colors"><Share2 className="w-5 h-5" /></button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
