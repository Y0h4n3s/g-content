import { supabase } from '../lib/supabaseClient';
import ContentFeed from './components/ContentFeed';
import { Content } from '../types';
import ChannelManager from './components/ChannelManager';
import AuthManager from './components/AuthManager';

async function getContent(): Promise<Content[]> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching content:', error);
    return [];
  }
  return data as Content[];
}

export default async function HomePage() {
  const initialContent = await getContent();

  const allTags = [...new Set(initialContent.flatMap(item => item.tags || []))];
  const allSources = [...new Set(initialContent.map(item => item.source))];

  return (
    <div className="font-sans bg-gray-900 flex items-center justify-center min-h-screen overflow-hidden">
      <ContentFeed 
        initialContent={initialContent} 
        allTags={allTags}
        allSources={allSources}
      />
      <ChannelManager /> 
      <AuthManager />
    </div>
  );
}
