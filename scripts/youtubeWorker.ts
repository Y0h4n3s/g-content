import { google } from 'googleapis';
import { parse, toSeconds } from 'iso8601-duration';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { Content, ContentSource } from '../types';

// --- Configuration ---
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });



// Maximum duration for a video to be considered "short-form"
const MAX_DURATION_SECONDS = 300; // 5 minutes

// --- Main Worker Logic ---

/**
 * Fetches the 10 most recent video IDs from a given YouTube channel.
 */
async function getRecentVideoIds(channelId: string): Promise<string[]> {
    try {
        const response = await youtube.search.list({
            part: ['id'],
            channelId: channelId,
            maxResults: 10,
            order: 'date',
            type: ['video'],
        });
        return response.data.items?.map(item => item.id!.videoId!).filter(Boolean) || [];
    } catch (error) {
        console.error(`Error fetching video IDs for channel ${channelId}:`, error);
        return [];
    }
}

/**
 * Fetches detailed information for a list of video IDs.
 */
async function getVideoDetails(videoIds: string[]) {
    if (videoIds.length === 0) return [];
    try {
        const response = await youtube.videos.list({
            part: ['snippet', 'contentDetails'],
            id: videoIds,
        });
        return response.data.items || [];
    } catch (error) {
        console.error('Error fetching video details:', error);
        return [];
    }
}

/**
 * Transforms raw YouTube video data into our standard Content format.
 * This is where you would add LLM-based summarization and tagging in the future.
 */
function processVideo(video: any): Omit<Content, 'id' | 'created_at'> | null {
    const durationSeconds = toSeconds(parse(video.contentDetails.duration));
    
    if (durationSeconds > MAX_DURATION_SECONDS) {
        return null; // Skip videos that are too long
    }

    // Placeholder for LLM-based processing
    const summary = video.snippet.description.split('\n')[0]; // Simple summary for now
    const tags = video.snippet.tags?.slice(0, 5) || []; // Use existing tags for now

    return {
        title: video.snippet.title,
        source: 'youtube' as ContentSource,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        summary: summary,
        tags: tags,
        duration_sec: durationSeconds,
        author: video.snippet.channelTitle,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
    };
}

async function getCuratedChannels(): Promise<string[]> {
    const { data, error } = await supabaseAdmin
        .from('curated_channels')
        .select('channel_id');
    
    if (error) {
        console.error("Error fetching curated channels:", error);
        return [];
    }
    return data.map(c => c.channel_id);
}

/**
 * The main function to run the YouTube ingestion worker.
 */
export async function runYouTubeWorker() {
    console.log('Starting YouTube Ingestion Worker...');
    const curatedChannels = await getCuratedChannels();
    if (curatedChannels.length === 0) {
        console.log("No curated channels found in the database. Exiting worker.");
        return;
    }
    console.log(`Found ${curatedChannels.length} channels to process.`);
    for (const channelId of curatedChannels) {
        console.log(`\nFetching videos for channel: ${channelId}`);
        const videoIds = await getRecentVideoIds(channelId);
        const videoDetails = await getVideoDetails(videoIds);

        if (!videoDetails) continue;

        const processedContent = videoDetails.map(processVideo).filter(Boolean) as Omit<Content, 'id' | 'created_at'>[];
        
        if (processedContent.length > 0) {
            // Use `upsert` to avoid inserting duplicate content based on the `url` constraint.
            const { data, error } = await supabaseAdmin.from('content').upsert(processedContent, {
                onConflict: 'url',
                ignoreDuplicates: true,
            }).select();

            if (error) {
                console.error(`Error inserting data for channel ${channelId}:`, error.message);
            } else {
                console.log(`Successfully upserted ${data?.length || 0} new items for channel ${channelId}.`);
            }
        } else {
            console.log(`No new short-form videos found for channel ${channelId}.`);
        }
    }
    console.log('\nYouTube Ingestion Worker finished.');
}

// To run this script directly for testing:
// npx ts-node -r dotenv/config scripts/youtube_worker.ts
if (require.main === module) {
    runYouTubeWorker();
}
