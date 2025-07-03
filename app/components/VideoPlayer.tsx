'use client';

import React, { useState } from 'react';
import YouTube from 'react-youtube';
import { PlayCircle } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  thumbnail: string;
  title: string;
  isActive: boolean;
}

export default function VideoPlayer({ videoId, thumbnail, title, isActive }: VideoPlayerProps) {
  const [showPlayer, setShowPlayer] = useState(false);

  // When the component becomes active (and we want to autoplay), show the player.
  // When it becomes inactive, hide the player to stop playback and save resources.
  React.useEffect(() => {
    if (isActive) {
      setShowPlayer(true);
    } else {
      setShowPlayer(false);
    }
  }, [isActive]);

  const playerOptions = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1, // Autoplay the video
      controls: 0, // Hide player controls
      showinfo: 0,
      modestbranding: 1,
      loop: 1,
      playlist: videoId, // Required for loop to work
      fs: 0,
      cc_load_policy: 0,
      iv_load_policy: 3,
      autohide: 1,
    },
  };

  const handlePlayClick = () => {
    setShowPlayer(true);
  };

  return (
    <div className="absolute inset-0 bg-black">
      {showPlayer && isActive ? (
        <YouTube
          videoId={videoId}
          opts={playerOptions}
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />
      ) : (
        <>
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <button
              onClick={handlePlayClick}
              className="text-white/80 hover:text-white transition-transform transform hover:scale-110"
              aria-label="Play Video"
            >
              <PlayCircle size={80} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
