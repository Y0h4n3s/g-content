import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { NextRequest } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

// Helper to extract username or channel ID from various URL formats
function parseChannelUrl(url: string): { type: 'id' | 'handle' | 'legacy', value: string } | null {
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname.split('/').filter(Boolean);

        if (path[0] === 'channel' && path[1]) {
            return { type: 'id', value: path[1] };
        }
        if (path[0]?.startsWith('@') && path[0].length > 1) {
            return { type: 'handle', value: path[0] };
        }
        if (path[0] === 'c' && path[1]) {
            return { type: 'legacy', value: path[1] };
        }
        if (path[0] === 'user' && path[1]) {
             return { type: 'legacy', value: path[1] };
        }
    } catch (e) { /* Invalid URL */ }
    return null;
}

async function getChannelDetails(identifier: { type: 'id' | 'handle' | 'legacy', value: string }): Promise<any> {
    let searchParams: any = {};
    if (identifier.type === 'id') {
        searchParams.id = identifier.value;
    } else { // For handles and legacy usernames, we must search
        searchParams.forHandle = identifier.value.replace('@', '');
    }
    console.log(searchParams)

    const response = await youtube.channels.list({
        part: ['id', 'snippet'],
        ...searchParams
    });
    
    return response.data.items?.[0];
}

// POST: Add a new channel
export async function POST(request: NextRequest) {
    const { url } = await request.json();
    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const identifier = parseChannelUrl(url);
    if (!identifier) {
        return NextResponse.json({ error: 'Invalid YouTube channel URL format.' }, { status: 400 });
    }

    try {
        const channelDetails = await getChannelDetails(identifier);
        if (!channelDetails) {
            return NextResponse.json({ error: 'Could not find YouTube channel.' }, { status: 404 });
        }

        const newChannel = {
            channel_id: channelDetails.id,
            channel_name: channelDetails.snippet.title,
            channel_url: channelDetails.snippet.customUrl ? `https://www.youtube.com/${channelDetails.snippet.customUrl}` : `https://www.youtube.com/channel/${channelDetails.id}`,
        };

        const { data, error } = await supabaseAdmin
            .from('curated_channels')
            .insert(newChannel)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return NextResponse.json({ error: 'Channel already exists.' }, { status: 409 });
            }
            throw error;
        }

        return NextResponse.json({ message: 'Channel added', data });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Remove a channel
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const { error } = await supabaseAdmin
        .from('curated_channels')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Channel deleted successfully' });
}
