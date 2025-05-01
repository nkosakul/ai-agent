import { generateImageToolDefinition } from './generateImages';
import { redditToolDefinition } from './reddit';
import { dadJokesToolDefinition } from './dadJokes';
import { movieSearchToolDefinition } from './movieSearch';

export const tools = [generateImageToolDefinition, redditToolDefinition, dadJokesToolDefinition, movieSearchToolDefinition]