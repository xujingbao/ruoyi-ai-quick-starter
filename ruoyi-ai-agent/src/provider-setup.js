import fs from 'node:fs/promises'
import path from 'node:path'
import { config } from './config.js'

/**
 * Ensure agentDir has models.json for OpenAI-compatible provider from env.
 */
export async function ensureProviderConfig() {
  await fs.mkdir(config.agentDir, { recursive: true })

  const modelsPath = path.join(config.agentDir, 'models.json')
  const models = {
    providers: {
      [config.providerId]: {
        baseUrl: config.apiBaseUrl,
        api: 'openai-completions',
        apiKey: config.apiKey || 'missing-key',
        compat: {
          supportsDeveloperRole: false,
          supportsReasoningEffort: false
        },
        models: [
          {
            id: config.modelId,
            name: config.modelId,
            reasoning: false,
            input: ['text'],
            contextWindow: 128000,
            maxTokens: 8192,
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
          }
        ]
      }
    }
  }

  await fs.writeFile(modelsPath, `${JSON.stringify(models, null, 2)}\n`, 'utf8')
  return modelsPath
}
