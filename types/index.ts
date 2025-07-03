export type ContentSource = 'youtube' | 'twitter' | 'rss';

export interface Content {
  id: number;
  created_at: string;
  title: string;
  source: ContentSource;
  url: string;
  summary: string | null;
  tags: string[] | null;
  duration_sec: number | null;
  author: string | null;
  thumbnail: string | null;
}

export interface Filters {
    tags: string[];
    sources: ContentSource[];
    maxDuration: number | null;
}
