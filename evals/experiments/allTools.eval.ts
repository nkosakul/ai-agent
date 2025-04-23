import { runEval } from '../evalTools'
import { runLLM } from '../../src/llm'
import { ToolCallMatch } from '../scorers'
import { redditToolDefinition } from '../../src/tools/reddit'
import { generateImageToolDefinition } from '../../src/tools/generateImages'
import { dadJokesToolDefinition } from '../../src/tools/dadJokes'

const createToolCallMessage = (toolName: string) => ({
  role: 'assistant',
  tool_calls: [
    {
      type: 'function',
      function: { name: toolName },
    },
  ],
})

const allTools = [
  redditToolDefinition,
  generateImageToolDefinition,
  dadJokesToolDefinition,
]

runEval('allTools', {
  task: (input) =>
    runLLM({
      messages: [{ role: 'user', content: input }],
      tools: allTools,
    }),
  data: [
    {
      input: 'tell me something interesting from reddit',
      expected: createToolCallMessage(redditToolDefinition.name),
    },
    {
      input: 'generate an image of a mountain landscape',
      expected: createToolCallMessage(generateImageToolDefinition.name),
    },
    {
      input: 'tell me a dad joke',
      expected: createToolCallMessage(dadJokesToolDefinition.name),
    },
  ],
  scorers: [ToolCallMatch],
})
