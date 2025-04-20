import { runLLM } from './llm'
import { addMessages, getMessages, saveToolResponse } from './memory'
import { runTool } from './toolRunner'
import { showLoader, logMessage } from './ui'

export const runAgent = async ({ userMessage, tools }: { userMessage: string, tools: any[] }) => {
  // save incoming message
  await addMessages([{ role: 'user', content: userMessage }])

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

      loader.update(`🔧 Running tool... ${toolCall.function.name}`)

      const toolResponse = await runTool(toolCall, userMessage)

      await saveToolResponse(toolCall.id, toolResponse)

      loader.update(`✅ Done! ${toolCall.function.name}`)

      logMessage(response)
    }
  }
}
