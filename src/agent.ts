import type { AIMessage } from '../types';
import { runLLM, runApprovalCheck } from './llm'
import { addMessages, getMessages, saveToolResponse } from './memory'
import { runTool } from './toolRunner'
import { showLoader, logMessage } from './ui'
import { generateImageToolDefinition } from './tools/generateImages';

const handleImageApprovalFlow = async (
  history: AIMessage[],
  userMessage: string
) => {
  const lastMessage = history[history.length - 1]
  const toolCall = lastMessage?.tool_calls?.[0]

  if (
    !toolCall ||
    toolCall.function.name !== generateImageToolDefinition.name
  ) {
    return false
  }

  const loader = showLoader('Processing approval...')
  const approved = await runApprovalCheck(userMessage)

  if (approved) {
    loader.update(`executing tool: ${toolCall.function.name}`)
    const toolResponse = await runTool(toolCall, userMessage)

    loader.update(`done: ${toolCall.function.name}`)
    await saveToolResponse(toolCall.id, toolResponse)
  } else {
    await saveToolResponse(
      toolCall.id,
      'User did not approve image generation at this time.'
    )
  }

  loader.stop()

  return true
}

export const runAgent = async ({ userMessage, tools }: { userMessage: string, tools: any[] }) => {
  const history = await getMessages()
  const isImageApproval = await handleImageApprovalFlow(history, userMessage)

  if (!isImageApproval) {
    // save incoming message
    await addMessages([{ role: 'user', content: userMessage }])
  }

  // show thinking message
  const loader = showLoader('🤔 Hm, let me think...')

  while (true) {
    // get all messages from db, so the AI has the whole context
    const history = await getMessages()

    // run the LLM
    const response = await runLLM({ messages: history, tools })

    // save the response from the AI as well
    await addMessages([response])

    if (response.content) {
      loader.stop()
      logMessage(response)
      return getMessages()
    }

    if (response.tool_calls) {
      const toolCall = response.tool_calls[0]

      logMessage(response)
      loader.update(`🔧 Running tool... ${toolCall.function.name}`)

      if (toolCall.function.name === generateImageToolDefinition.name) {
        loader.update('need user approval')
        loader.stop()
        return getMessages()
      }

      const toolResponse = await runTool(toolCall, userMessage)

      await saveToolResponse(toolCall.id, toolResponse)

      loader.update(`✅ Done! ${toolCall.function.name}`)
    }
  }
}
