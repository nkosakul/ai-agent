import { Index as UpstashIndex } from '@upstash/vector';

// initialize Upstash Vector client
const index = new UpstashIndex({
  url: process.env.UPSTASH_VECTOR_URL as string,
  token: process.env.UPSTASH_VECTOR_TOKEN as string,
});

interface MovieMetaData {
  title?: string;
  year?: number;
  genre?: string;
  director?: string;
  actors?: string;
  rating?: number;
  votes?: number;
  revenue?: number;
  metscore?: number;
}

export const queryMovies = async ({
  query,
  filters,
  topK = 5,
}:
  {
    query: string,
    filters?: Partial<MovieMetaData>,
    topK?: number
  }) => {
  return index.query({
    data: query,
    topK,
    includeMetadata: true,
    includeData: true,
  })
}