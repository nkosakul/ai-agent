import 'dotenv/config';
import { Index as UpstackIndex } from '@upstash/vector';
import { parse } from 'csv-parse/sync'
import fs from 'node:fs';
import path from 'node:path';
import ora from 'ora';

// initialize Upstash Vector client
const index = new UpstackIndex({
  url: process.env.UPSTASH_VECTOR_URL as string,
  token: process.env.UPSTASH_VECTOR_TOKEN as string,
})

// Function to index CSV data
export const indexCSV = async () => {
  const spinner = ora('Indexing CSV data...')

  spinner.start();

  const csvPath = path.join(process.cwd(), 'src/rag/imdb_movie_dataset.csv');
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
  });

  spinner.text = 'Indexing CSV data...';

  for (const record of records) {
    spinner.text = `Indexing record: ${record.Title}`;

    const text = `${record.Title}. ${record.Genre}. ${record.Description}.`;

    try {
      await index.upsert({
        id: record.Title, // using Rank as unique ID
        data: text, // Text will be automatically embedded
        metadata: {
          title: record.Title,
          year: Number(record.Year),
          genre: record.Genre,
          director: record.Director,
          actors: record.Actors,
          rating: Number(record.Rating),
          votes: Number(record.Votes),
          revenue: Number(record.Revenue),
          metscore: Number(record.Metascore),
        }
      })
    } catch (error) {
      spinner.fail(`Failed to index record: ${record.Title}`);
      console.error(error);
    }
  }

  spinner.succeed('CSV data indexed successfully!');
}

indexCSV()