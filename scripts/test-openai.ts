// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import OpenAI from 'openai'

const SCRIPT_FILE = fileURLToPath(import.meta.url)
const PROJECT_ROOT = path.resolve(path.dirname(SCRIPT_FILE), '..')
const ENV_FILE = path.join(PROJECT_ROOT, '.env')
const hadProcessOpenAIKey = Boolean(process.env.OPENAI_API_KEY)
const dotenvResult = dotenv.config({ path: ENV_FILE })
const apiKey = process.env.OPENAI_API_KEY?.trim() || ''
const source = hadProcessOpenAIKey
  ? 'process environment'
  : Object.hasOwn(dotenvResult.parsed || {}, 'OPENAI_API_KEY')
    ? '.env'
    : 'not configured'

console.log('OpenAI key loaded:', Boolean(apiKey))

if (!apiKey) {
  console.error('FAIL: OPENAI_API_KEY no está configurada.')
  process.exitCode = 1
} else if (process.env.CODEX_API_KEY && apiKey === process.env.CODEX_API_KEY) {
  console.error('FAIL: OPENAI_API_KEY coincide con CODEX_API_KEY.')
  process.exitCode = 1
} else {
  const model = process.env.OPENAI_TEXT_MODEL || 'gpt-5.6-luna'
  const openai = new OpenAI({ apiKey })

  try {
    const response = await openai.responses.create({
      model,
      input: 'Reply with exactly: OK',
      max_output_tokens: 16
    })

    console.log('PASS: autenticación y Responses API funcionan.')
    console.log('Model:', model)
    console.log('Response ID:', response.id)
    console.log('Output:', response.output_text?.trim() || '(empty)')
  } catch (error) {
    console.error('FAIL: la llamada directa a OpenAI falló.')
    console.error('Status:', error.status || '(unknown)')
    console.error('Code:', error.code || '(unknown)')
    console.error('Message:', error?.error?.message || error.message || 'Unknown error')
    console.error('Request ID:', error.requestID || '(none)')
    process.exitCode = 1
  }
}
