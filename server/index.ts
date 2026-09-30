// Migration bridge: the existing runtime is preserved while endpoint types are introduced incrementally.
// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import OpenAI, { toFile } from 'openai'

const BACKEND_FILE = fileURLToPath(import.meta.url)
const PROJECT_ROOT = path.resolve(path.dirname(BACKEND_FILE), '..')
const ENV_FILE = path.join(PROJECT_ROOT, '.env')
const hadProcessOpenAIKey = Boolean(process.env.OPENAI_API_KEY)
const dotenvResult = dotenv.config({ path: ENV_FILE })
const OPENAI_KEY_SOURCE = hadProcessOpenAIKey
  ? 'process environment'
  : Object.hasOwn(dotenvResult.parsed || {}, 'OPENAI_API_KEY')
    ? '.env'
    : 'not configured'

const app = express()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
})

const PORT = Number(process.env.PORT || 8787)
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-5.6-luna'
const TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-mini-transcribe'

app.use(cors({
  origin(origin, callback) {
    // Vite puede elegir otro puerto local si 5173 ya está ocupado.
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true)
    }
    callback(new Error('Origen no permitido.'))
  }
}))
app.use(express.json({ limit: '1mb' }))

function openAIKeyDiagnostics() {
  const apiKey = process.env.OPENAI_API_KEY?.trim() || ''

  return {
    loaded: Boolean(apiKey),
    prefix: apiKey ? apiKey.slice(0, 12) : null,
    length: apiKey.length,
    source: OPENAI_KEY_SOURCE,
    envFile: path.relative(PROJECT_ROOT, ENV_FILE),
    backendFile: path.relative(PROJECT_ROOT, BACKEND_FILE),
    workingDirectory: process.cwd(),
    codexKeyConfigured: Boolean(process.env.CODEX_API_KEY)
  }
}

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY?.trim()

  if (!apiKey) {
    const error = new Error('Falta OPENAI_API_KEY en el archivo .env')
    error.statusCode = 503
    throw error
  }

  if (apiKey.startsWith('ssk-')) {
    const error = new Error('La clave configurada es una clave de entorno/sesiÃ³n, no una API key de OpenAI. Crea una API key de proyecto y configÃºrala como OPENAI_API_KEY.')
    error.statusCode = 503
    throw error
  }

  if (process.env.CODEX_API_KEY && apiKey === process.env.CODEX_API_KEY) {
    const error = new Error('OPENAI_API_KEY coincide con CODEX_API_KEY. Usa una API key de proyecto de OpenAI, no una clave de entorno de Codex.')
    error.statusCode = 503
    throw error
  }

  return new OpenAI({ apiKey })
}

function parseJsonFromModel(text) {
  const clean = String(text || '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')

  return JSON.parse(clean)
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    configured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    textModel: TEXT_MODEL,
    transcribeModel: TRANSCRIBE_MODEL
  })
})

// Endpoint temporal de diagnóstico. Nunca devuelve la clave completa.
app.get('/api/debug-openai', (_req, res) => {
  res.json({
    ok: true,
    ...openAIKeyDiagnostics()
  })
})

app.post('/api/transcribe', upload.single('audio'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió audio.' })

    console.log('Received audio:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    })

    if (req.file.size < 1000) {
      return res.status(400).json({ error: 'No se capturó suficiente audio. Intenta grabar nuevamente.' })
    }

    const openai = getOpenAI()
    const extension = req.file.mimetype.includes('ogg')
      ? 'ogg'
      : req.file.mimetype.includes('mp4')
        ? 'mp4'
        : 'webm'

    const filename = path.basename(req.file.originalname || `recording.${extension}`)
    const file = await toFile(req.file.buffer, filename, {
      type: req.file.mimetype || 'audio/webm'
    })

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: TRANSCRIBE_MODEL,
      language: 'en',
      prompt: 'This is a job interview. Expect software, QA, testing, programming, React, Python, SQL, JavaScript, API, database, and behavioral interview terminology.'
    })

    res.json({ text: transcription.text?.trim() || '' })
  } catch (error) {
    next(error)
  }
})

app.post('/api/analyze', async (req, res, next) => {
  try {
    const question = String(req.body?.question || '').trim()
    if (!question) return res.status(400).json({ error: 'Escribe o graba una pregunta.' })

    const mode = ['interview', 'class', 'meeting', 'general'].includes(req.body?.mode) ? req.body.mode : 'interview'
    const answerLength = ['short', 'normal', 'detailed'].includes(req.body?.answerLength) ? req.body.answerLength : 'normal'
    const responseStyle = ['natural', 'professional', 'simple', 'technical'].includes(req.body?.responseStyle) ? req.body.responseStyle : 'natural'
    const outputLanguage = ['auto', 'english', 'spanish'].includes(req.body?.outputLanguage) ? req.body.outputLanguage : 'auto'
    const modeRules = {
      interview: 'Help answer a job interview naturally. Do not invent experience. Use the candidate context only when relevant.',
      class: 'Help a student answer a class question clearly and correctly. Do not pretend certainty when the question is ambiguous.',
      meeting: 'Help respond clearly and professionally in a meeting. Do not commit to unconfirmed timelines or information.',
      general: 'Help formulate a useful, natural response in a general conversation.'
    }

    const openai = getOpenAI()
    const response = await openai.responses.create({
      model: TEXT_MODEL,
      instructions: `You are a live job-interview assistant for Angel Martinez.

Candidate context:
- Systems Engineering student.
- Seeking junior/entry-level QA, software testing, or related software roles.
- English level: intermediate (B1/B2). Keep spoken answers natural and easy to pronounce.
- Skills: Python intermediate; JavaScript, React, HTML/CSS, SQL/MySQL, Node.js, Java, C++, C# at basic/foundation level.
- Has personal web projects, including an e-commerce app with React/Vite/Supabase and UI testing with Playwright.
- Has practiced testing login, order creation, permissions, edge cases and bug investigation.
- Do not invent professional software/QA employment experience.
- If the question requires an experience Angel does not have, frame the answer honestly around studies, personal projects, transferable customer-service experience, or willingness to learn.

Your job:
1. Translate the interviewer's question into natural Spanish.
2. Give ONE short answer Angel could actually say aloud in English.
3. Keep the answer around 2-4 sentences unless the question clearly needs more.
4. Avoid corporate or AI-sounding phrases.
5. Use simple B1/B2 English.
6. Add one concise tip in Spanish.
7. Never claim credentials, jobs, projects, or achievements not included above.

Mode: ${mode}. ${modeRules[mode]}
Answer length: ${answerLength} (${answerLength === 'short' ? '1-2 sentences' : answerLength === 'detailed' ? 'up to 6 sentences' : '2-4 sentences'}).
Style: ${responseStyle}. Output language: ${outputLanguage}; auto means answer in the question's language.
First decide whether this contains a clear question. If it does not, set needsAnswer false and do not invent an answer.
Return ONLY valid JSON with exactly these keys:
{"detectedLanguage":"en|es|unknown","translation":"... or null","suggestedAnswer":"...","quickAnswer":"...","tip":"...","questionType":"behavioral|technical|general|clarification|opinion|unknown","needsAnswer":true,"reason":"... or null"}`,
      input: question
    })

    let result
    try {
      result = parseJsonFromModel(response.output_text)
    } catch {
      result = {
        translation: 'No pude estructurar la traducción correctamente.',
        answer: response.output_text?.trim() || 'Could you please repeat the question?',
        tip: 'La IA respondió, pero no devolvió el formato esperado.'
      }
    }

    res.json({
      transcript: question,
      detectedLanguage: result.detectedLanguage || 'unknown',
      translation: result.translation || null,
      suggestedAnswer: result.suggestedAnswer || result.answer || '',
      quickAnswer: result.quickAnswer || result.suggestedAnswer || result.answer || '',
      tip: result.tip || '',
      questionType: result.questionType || 'unknown',
      needsAnswer: result.needsAnswer !== false,
      reason: result.reason || null
    })
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  const status = error.statusCode || error.status || 500
  const message = error?.error?.message || error?.message || 'Error interno.'
  res.status(status).json({ error: message })
})

app.listen(PORT, () => {
  console.log(`Interview Assistant API: http://localhost:${PORT}`)
  const diagnostics = openAIKeyDiagnostics()
  console.log(`OpenAI key loaded: ${diagnostics.loaded}`)
})
