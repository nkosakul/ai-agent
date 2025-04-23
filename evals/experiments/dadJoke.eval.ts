import { runEval } from '../evalTools'
import { runLLM } from '../../src/llm'
import { ToolCallMatch } from '../scorers'
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

runEval('dadJoke', {
  task: (input) =>
    runLLM({
      messages: [{ role: 'user', content: input }],
      tools: [dadJokesToolDefinition],
    }),
  data: [
    {
      input: 'tell me a dad joke',
      expected: createToolCallMessage(dadJokesToolDefinition.name),
    },
  ],
  scorers: [ToolCallMatch],
})
