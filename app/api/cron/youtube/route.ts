import { NextResponse } from 'next/server';
import { runYouTubeWorker } from '../../../../scripts/youtubeWorker';

export async function GET() {
    try {
        await runYouTubeWorker();
        return NextResponse.json({ success: true, message: 'YouTube worker ran successfully.' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
