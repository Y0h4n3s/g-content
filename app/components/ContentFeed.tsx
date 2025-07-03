'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import ContentCard from './ContentCard';
import FilterBar from './FilterBar';
import { Content, ContentSource, Filters } from '../../types';
import { useSupabase } from '../supabaseProvider';

interface ContentFeedProps {
  initialContent: Content[];
  allTags: string[];
  allSources: ContentSource[];
}

export default function ContentFeed({ initialContent, allTags, allSources }: ContentFeedProps) {
;
  const { supabase, session } = useSupabase(); // Get session and supabase client
  const [filters, setFilters] = useState<Filters>({
    tags: [],
    sources: [],
    maxDuration: null,
  })
  const [activeIndex, setActiveIndex] = useState(0);
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const [showSeen, setShowSeen] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const seenTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch seen video IDs when the user session loads
  useEffect(() => {
    const fetchSeenIds = async () => {
      if (!session) return;
      const { data } = await supabase
        .from('seen_content')
        .select('content_id')
        .eq('user_id', session.user.id);
      
      if (data) {
        setSeenIds(new Set(data.map(item => item.content_id)));
      }
    };
    fetchSeenIds();
  }, [session, supabase]);

  // Mark video as seen after a delay
  const markAsSeen = async (contentId: number) => {
    if (!session || seenIds.has(contentId)) return;

    // Optimistic update
    setSeenIds(prev => new Set(prev).add(contentId));

    await supabase.from('seen_content').insert({
      user_id: session.user.id,
      content_id: contentId,
    });
  };

  const filteredData = useMemo(() => {
    return initialContent.filter(item => {
      if (!showSeen && seenIds.has(item.id)) return false;
      const tagMatch = filters.tags.length === 0 || (item.tags && filters.tags.every(tag => item.tags!.includes(tag)));
      const sourceMatch = filters.sources.length === 0 || filters.sources.includes(item.source);
      const durationMatch = filters.maxDuration === null || (item.duration_sec && item.duration_sec <= filters.maxDuration);
      return tagMatch && sourceMatch && durationMatch;
    });
  }, [filters, initialContent, seenIds, showSeen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
         entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
            setActiveIndex(index);

            // Logic to mark as seen
            if (seenTimeoutRef.current) clearTimeout(seenTimeoutRef.current);
            const contentId = filteredData[index]?.id;
            if (contentId) {
                seenTimeoutRef.current = setTimeout(() => {
                    markAsSeen(contentId);
                }, 5000); // Mark as seen after 5 seconds of viewing
            }
          }
        });
      },
      {
        root: feedRef.current,
        threshold: 0.6, // 60% of the item must be visible to be considered active
      }
    );

    const currentFeed = feedRef.current;
    if (currentFeed) {
      Array.from(currentFeed.children).forEach(child => observer.observe(child));
    }

    return () => {
    if (seenTimeoutRef.current) clearTimeout(seenTimeoutRef.current);
      if (currentFeed) {
        Array.from(currentFeed.children).forEach(child => observer.unobserve(child));
      }
    };
  }, [filteredData]); // Re-run observer setup when filtered data changes

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-0 md:p-4 relative">
      <FilterBar
        tags={allTags}
        sources={allSources}
        filters={filters}
        setFilters={setFilters}
        onApply={() => {}}
        showSeen={showSeen}
        setShowSeen={setShowSeen}
        isUserLoggedIn={!!session}
      />
      
      {/* Vertical Scroll Feed */}
      <div
        ref={feedRef}
        className="w-full h-full snap-y snap-mandatory overflow-y-scroll scrollbar-hide"
      >
        {filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <div
              key={item.id}
              data-index={index}
              className="h-full w-full snap-center flex items-center justify-center"
            >
              <div className="h-full md:h-[90vh] md:max-h-[800px] w-full">
                <ContentCard item={item} isActive={index === activeIndex} />
              </div>
            </div>
          ))
        ) : (
          <div className="h-full w-full snap-center flex items-center justify-center">
            <div className="text-white text-center p-8 bg-gray-800 rounded-lg">
              <h2 className="text-2xl font-bold mb-2">No Content Found</h2>
              <p className="text-gray-400">Try adjusting your filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}