import { z } from 'zod'
import type { ToolFn } from '../../types'
import fetch from 'node-fetch'

export const dadJokesToolDefinition = {
  name: 'dad_jokes',
  parameters: z.object({}),
  description: 'use this to get a dad joke',
}

type Args = z.infer<typeof dadJokesToolDefinition.parameters>

export const dadJoke: ToolFn<Args, string> = async ({ toolArgs }) => {
  const res = await fetch('https://icanhazdadjoke.com/', {
    headers: {
      Accept: 'application/json',
    },
  })

  return (await res.json()).joke
}