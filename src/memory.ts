import { JSONFilePreset } from 'lowdb/node';
import type { AIMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { summarizeMessages } from './llm';

export type MessageWithMetadata = AIMessage & {
  id: string
  createdAt: string
}

type Data = {
  messages: MessageWithMetadata[]
  summary: string
}

export const addMetadata = (message: AIMessage) => {
  return {
    ...message,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
}

export const removeMetadata = (message: MessageWithMetadata) => {
  const { id, createdAt, ...rest } = message
  return rest
}

const defaultData: Data = {
  messages: [],
  summary: '',
}

export const getDb = async () => {
  const db = await JSONFilePreset<Data>('db.json', defaultData)
  return db
}

export const addMessages = async (messages: AIMessage[]) => {
  const db = await getDb()
  db.data.messages.push(...messages.map(addMetadata))

  // summarize the last 5 messages, when the total number of messages is greater than 10
  if (db.data.messages.length >= 10) {
    const oldestMessage = db.data.messages.slice(0, 5).map(removeMetadata)
    const summary = await summarizeMessages(oldestMessage)
    db.data.summary = summary
  }

  await db.write()
}

export const getMessages = async () => {
  const db = await getDb()
  const messages = await db.data.messages.map(removeMetadata)
  const lastFive = messages.slice(-5)

  // if the last message is a tool call, return the last 6 messages, to avoid broken state
  if (lastFive[0]?.role === 'tool') {
    const sixthMessage = messages[messages.length - 6]
    if (sixthMessage) return [sixthMessage, ...lastFive]
  }

  return lastFive
}

export const saveToolResponse = async (toolCallId: string, toolResponse: string) => {
  return await addMessages([
    {
      role: 'tool',
      content: toolResponse,
      tool_call_id: toolCallId,
    }
  ])
}

export const getSummary = async () => {
  const db = await getDb()
  return db.data.summary
}