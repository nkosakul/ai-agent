import type OpenAI from 'openai'
import { generateImage, generateImageToolDefinition } from './tools/generateImages';
import { reddit, redditToolDefinition } from './tools/reddit';
import { dadJoke, dadJokesToolDefinition } from './tools/dadJokes';

export const runTool = async (
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  userMessage: string
) => {
  const input = {
    userMessage,
    toolArgs: JSON.parse(toolCall.function.arguments || '{}')
  }

  switch (toolCall.function.name) {
    case generateImageToolDefinition.name:
      return await generateImage(input)
    case redditToolDefinition.name:
      return await reddit(input)
    case dadJokesToolDefinition.name:
      return await dadJoke(input)
    default:
      return `Never run this tool ${toolCall.function.name} again`
  }
}