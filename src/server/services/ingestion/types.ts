import { SourceProvider } from '@prisma/client';

export interface RawContent {
  [key: string]: any;
}

export interface NormalizedContent {
  title: string;
  summary?: string | null;
  content: string;
  source: string;
  sourceType: string;
  url: string;
  author?: string | null;
  publishedAt: Date;
  imageUrl?: string | null;
  language?: string;
  category: string;
  industry?: string | null;
  tags?: string[];
}

export interface IngestionProvider {
  providerRecord: SourceProvider;
  fetch(): Promise<RawContent[]>;
  normalize(rawItems: RawContent[]): Promise<NormalizedContent[]>;
  validate(): Promise<boolean>;
}
