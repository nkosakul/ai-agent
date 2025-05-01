import { z } from 'zod'
import type { ToolFn } from '../../types'
import { queryMovies } from '../rag/query'

export const movieSearchToolDefinition = {
  name: 'movie_search',
  parameters: z.object({
    query: z.string().describe('Query used to vector search on movies'),
  }),
  description: 'use this to find movies or answer questions about movies and their metadata, like score, rating, costs, director, etc.',

}

type Args = z.infer<typeof movieSearchToolDefinition.parameters>

export const movieSearch: ToolFn<Args, string> = async ({ userMessage, toolArgs }) => {
  const { query } = toolArgs
  let results

  try {
    results = await queryMovies({
      query
    })
  } catch (error) {
    console.error('Error in movie search:', error)
    return 'Error: Could not query the database to get movies.'
  }

  const formattedResults = results.map(result => {
    const { metadata, data } = result

    return {
      ...metadata,
      description: data
    }
  })

  return JSON.stringify(formattedResults, null, 2)
}