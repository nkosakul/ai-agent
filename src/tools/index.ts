import { generateImageToolDefinition } from './generateImages';
import { redditToolDefinition } from './reddit';
import { dadJokesToolDefinition } from './dadJokes';

export const tools = [generateImageToolDefinition, redditToolDefinition, dadJokesToolDefinition]