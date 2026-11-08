/**
 * Host half of `dsh-side-chat`.
 *
 * Three jobs:
 *  1. Own the HTTP surface the panel uses to get its own thread. The Host creates the
 *     Session, so it knows the id before the panel ever sees it.
 *  2. Remember those ids on disk, so the adviser policy survives a DSH restart.
 *  3. Keep threads advisory: their agent gets a read-only tool mask, applied when the
 *     thread is created and again whenever that agent is (re)created.
 *
 * Everything here is best-effort: a missing optional service must leave the panel
 * working (it just loses the mask), never blank the Web UI.
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const ROUTE = '/x-side-chat'
// A 30-second 16 kHz mono WAV is ~1 MB; base64 adds a third. The default 100 kB
// ceiling would reject the first recording.
const MAX_BODY = 8_000_000
/** The conversational preset this thread runs under (see the side-chat-preset bundle). */
const PRESET_ID = 'sidechat'

/** Default effort until the settings tab says otherwise. */
const DEFAULT_EFFORT = 'off'

/** Tools an adviser may keep: reading, searching, and skill references. */
const READ_ONLY = new Set([
  'read',
  'read_image',
  'grep',
  'glob',
  'web_search',
  'web_fetch',
  'skill',
  'list_agents',
  'list_subagent_models',
  'get_goal',
])

function sendJson(res, status, value) {
  const body = Buffer.from(JSON.stringify(value), 'utf8')
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.setHeader('content-length', String(body.length))
  res.end(body)
}

async function readJsonBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY) throw new Error('request body too large')
    chunks.push(chunk)
  }
  if (chunks.length === 0) return {}
  const text = Buffer.concat(chunks).toString('utf8')
  if (text.trim() === '') return {}
  return JSON.parse(text)
}

/** A service from a context, without turning a missing one into a crash. */
function service(scope, key) {
  try {
    const value = scope.get(key)
    if (value !== undefined && value !== null) return value
  } catch { /* not provided here */ }
  try {
    return scope[key]
  } catch {
    return undefined
  }
}

export function apply(ctx) {
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  const storePath = path.join(home, 'side-chat', 'threads.json')
  const settingsPath = path.join(home, 'side-chat', 'settings.json')

  /** Panel settings, kept beside the thread registry so they survive a restart. */
  const readSettings = () => {
    try {
      const parsed = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
      if (parsed && typeof parsed === 'object' && typeof parsed.reasoningEffort === 'string') {
        return { reasoningEffort: parsed.reasoningEffort }
      }
    } catch { /* first run or unreadable: fall back to the default */ }
    return { reasoningEffort: DEFAULT_EFFORT }
  }
  const writeSettings = (next) => {
    try {
      fs.mkdirSync(path.dirname(settingsPath), { recursive: true })
      fs.writeFileSync(settingsPath, JSON.stringify(next, null, 2), 'utf8')
    } catch (error) {
      console.warn('[side-chat] could not persist settings: %s', (error && error.message) || error)
    }
  }
  let settings = readSettings()
  const currentEffort = () => settings.reasoningEffort || DEFAULT_EFFORT

  /**
   * Thread registry. v1 stored a bare array of ids; v2 keeps a record per thread so the
   * panel can show history and binding. Reading accepts both shapes.
   */
  const loadThreads = () => {
    try {
      const parsed = JSON.parse(fs.readFileSync(storePath, 'utf8'))
      const rows = Array.isArray(parsed)
        ? parsed
        : (parsed && Array.isArray(parsed.threads) ? parsed.threads : [])
      const records = []
      for (const row of rows) {
        if (typeof row === 'string' && row !== '') {
          records.push({ id: row, owner: null, title: '', createdAt: 0 })
        } else if (row && typeof row.id === 'string' && row.id !== '') {
          records.push({
            id: row.id,
            owner: typeof row.owner === 'string' && row.owner !== '' ? row.owner : null,
            title: typeof row.title === 'string' ? row.title : '',
            createdAt: typeof row.createdAt === 'number' ? row.createdAt : 0,
          })
        }
      }
      return records
    } catch {
      return []
    }
  }
  const saveThreads = () => {
    try {
      fs.mkdirSync(path.dirname(storePath), { recursive: true })
      fs.writeFileSync(storePath, JSON.stringify({ version: 2, threads }, null, 2), 'utf8')
    } catch (error) {
      console.warn('[side-chat] could not persist threads: %s', (error && error.message) || error)
    }
  }

  /** Newest first; the mask and every bulk operation read this list. */
  const threads = loadThreads()
  const findThread = (sessionId) => threads.find((row) => row && row.id === sessionId)
  /** Agents that already received the adviser role text, so a re-mask does not duplicate it. */
  const prompted = new WeakSet()

  const ADVISER_ROLE =
    'Ты работаешь в боковом чате-советнике рядом с рабочей сессией. Это обычный разговорный чат, ' +
    'как веб-чат: отвечай по существу, коротко и по-русски, без служебных отчётов и без списков дел. ' +
    'Твоя сильная сторона — планирование (разбить задачу на шаги, взвесить варианты, найти слабое место в плане) ' +
    'и объяснение (разобрать тему так, чтобы стало понятно, проверить чужое объяснение на ошибки). ' +
    'Прикладные навыки, которые управляют сторонними программами (Blender, SolidCraft, Docker, Office, ' +
    'стикеры, генерация картинок и подобное), тебе недоступны и не нужны: не предлагай их и не пытайся их применять. ' +
    'Ты ничего не меняешь: правка файлов, запуск команд и любые действия с побочными эффектами закрыты. ' +
    'Если решение требует правки — опиши её словами и предложи, что именно поручить основной сессии.'

  const agentOf = (sessionId) => {
    if (typeof sessionId !== 'string' || sessionId === '') return undefined
    const agents = service(ctx, 'agents')
    try {
      return agents && typeof agents.get === 'function' ? agents.get(sessionId) : undefined
    } catch {
      return undefined
    }
  }

  /** Mask the thread's tools down to the adviser set, reporting why when it cannot. */
  const makeAdviser = (sessionId) => {
    const agent = agentOf(sessionId)
    if (!agent) return { ok: false, why: 'agent not live yet' }
    if (!agent.ctx) return { ok: false, why: 'agent has no ctx' }
    // The agent-bound instance is what `restrict` speaks for; the service on the root
    // context would mask every agent instead of this one.
    let bound
    try {
      bound = agent.ctx.tools
    } catch {
      bound = undefined
    }
    const tools = bound || service(agent.ctx, 'tools')
    if (!tools) return { ok: false, why: 'no tools service on the agent context' }
    if (typeof tools.restrict !== 'function') return { ok: false, why: 'tools.restrict is missing' }
    let definitions
    try {
      // Resolve through the agent scope: core tools live in the agent's layer, so the
      // global view returns plugin tools only.
      definitions = tools.definitions(agent)
    } catch (error) {
      return { ok: false, why: 'definitions threw: ' + ((error && error.message) || String(error)) }
    }
    const names = (Array.isArray(definitions) ? definitions : [])
      .map((definition) => (definition && typeof definition.name === 'string' ? definition.name : ''))
      .filter((name) => name !== '')
    const allow = names.filter((name) => READ_ONLY.has(name))
    if (allow.length === 0) {
      return { ok: false, why: 'no adviser names among ' + names.length + ': ' + names.slice(0, 10).join(',') }
    }
    try {
      agent.ctx.effect(() => tools.restrict({ allow }), 'side-chat: adviser tools')
    } catch (error) {
      return { ok: false, why: 'restrict threw: ' + ((error && error.message) || String(error)) }
    }
    if (!prompted.has(agent)) {
      prompted.add(agent)
      try {
        agent.ctx.effect(() => agent.ctx.systemPrompt.section({
          name: 'side-chat:adviser',
          order: 900,
          text: ADVISER_ROLE,
        }), 'side-chat: adviser role')
      } catch { /* the tool mask is the hard guarantee; the role text is guidance */ }
      // The runtime snapshot (cwd, file policy, GUI URL) is host-level context that
      // every session gets by default. A chat does not need it, and it only invites
      // replies about paths and policies.
      try {
        agent.ctx.effect(() => agent.ctx.systemPrompt.suppressRuntimeContext(), 'side-chat: no runtime context')
      } catch { /* older harness: the block simply stays */ }
    }
    return { ok: true, why: 'allow=' + allow.join(',') }
  }

  /** The working Session's directory, so the thread can read the same project. */
  const cwdOf = (sessionId) => {
    const agent = agentOf(sessionId)
    if (!agent) return undefined
    const workingDirectory = service(ctx, 'workingDirectory')
    if (!workingDirectory || typeof workingDirectory.get !== 'function') return undefined
    try {
      const session = agent.session
      const cwd = session === undefined ? undefined : workingDirectory.get(session)
      return typeof cwd === 'string' && cwd !== '' ? cwd : undefined
    } catch {
      return undefined
    }
  }

  const remember = (sessionId, owner) => {
    if (typeof sessionId !== 'string' || sessionId === '') return
    const existing = findThread(sessionId)
    if (existing) {
      if (owner !== undefined) existing.owner = owner
      saveThreads()
      return
    }
    threads.push({
      id: sessionId,
      owner: typeof owner === 'string' && owner !== '' ? owner : null,
      title: '',
      createdAt: Date.now(),
    })
    saveThreads()
  }

  const forget = (sessionId) => {
    const index = threads.findIndex((row) => row && row.id === sessionId)
    if (index === -1) return false
    threads.splice(index, 1)
    saveThreads()
    return true
  }

  /** Sentinel: the thread's Session no longer exists, so the entry is dead weight. */
  const MISSING = Symbol('missing')

  /**
   * First human message of a thread, or '' when the page holds none.
   * `throughSeq` asks for the opening turn; harmless to omit when it yields nothing.
   */
  const firstUserText = async (record, throughSeq) => {
    const controller = service(ctx, 'sessionController')
    if (!controller || typeof controller.events !== 'function') return ''
    const request = { address: { kind: 'session', sessionId: record.id }, maxMessages: 12 }
    if (throughSeq !== undefined) request.throughSeq = throughSeq
    const page = await controller.events(request, new AbortController().signal)
    for (const entry of (page && page.records) || []) {
      const event = entry && entry.event
      if (!event || event.type !== 'user/message') continue
      const kind = event.data && event.data.source ? event.data.source.kind : undefined
      if (kind !== undefined && kind !== 'user') continue
      const content = event.data && event.data.content
      const text = Array.isArray(content)
        ? content.filter((block) => block && block.type === 'text').map((block) => block.text).join(' ')
        : ''
      const clean = text.replace(/\s+/g, ' ').trim()
      if (clean !== '') return clean
    }
    return ''
  }

  /**
   * A thread's title, taken from its first human message and cached in the registry.
   * Returns MISSING when the Session is gone, so the caller can drop the entry.
   */
  const titleOf = async (record) => {
    if (!record) return ''
    if (record.title) return record.title
    const missing = (error) => /not found|not-found|no such|unknown session|expired/i.test((error && error.message) || String(error))
    let text = ''
    // Each attempt is isolated: a rejected `throughSeq` must not cancel the fallback.
    try {
      text = await firstUserText(record, 64)
    } catch (error) {
      if (missing(error)) return MISSING
    }
    if (text === '') {
      try {
        text = await firstUserText(record)
      } catch (error) {
        if (missing(error)) return MISSING
        return ''
      }
    }
    if (text === '') return ''
    record.title = text.length > 64 ? text.slice(0, 61) + '…' : text
    saveThreads()
    return record.title
  }

  /**
   * Point one thread at a low reasoning effort.
   *
   * `selectModel` installs the choice on the Session *and* saves it as the deployment
   * default in the background, so the previous default is restored immediately after:
   * the coding sessions must keep their own effort.
   */
  /** The model this chat runs on and the efforts it accepts. */
  const modelContext = async () => {
    const controller = service(ctx, 'sessionController')
    const defaults = service(ctx, 'agentDefaultModel')
    let base
    try {
      base = defaults && typeof defaults.currentSelection === 'function' ? defaults.currentSelection() : undefined
    } catch {
      base = undefined
    }
    let catalog
    if (controller && typeof controller.modelCatalog === 'function') {
      try {
        catalog = await controller.modelCatalog()
      } catch {
        catalog = undefined
      }
    }
    if (!base && catalog && catalog.default) base = catalog.default
    let efforts = []
    if (catalog && base) {
      const group = (catalog.groups || []).find((entry) => entry && entry.id === base.provider)
      const model = group && (group.models || []).find((entry) => entry && entry.id === base.model)
      if (model && model.reasoning && Array.isArray(model.reasoning.efforts)) {
        efforts = model.reasoning.efforts.map((effort) => ({ id: effort.id, name: effort.name }))
      }
    }
    return { base, efforts }
  }

  /**
   * Point one thread at the configured reasoning effort.
   *
   * `selectModel` installs the choice on the Session *and* saves it as the deployment
   * default in the background, so the previous default is restored immediately after:
   * the coding sessions must keep their own effort.
   */
  const applyChatModel = async (sessionId, effort) => {
    const wanted = typeof effort === 'string' && effort !== '' ? effort : currentEffort()
    const controller = service(ctx, 'sessionController')
    if (!controller || typeof controller.selectModel !== 'function') {
      return { ok: false, why: 'selectModel недоступен' }
    }
    const defaults = service(ctx, 'agentDefaultModel')
    let before
    try {
      before = defaults && typeof defaults.currentSelection === 'function' ? defaults.currentSelection() : undefined
    } catch {
      before = undefined
    }
    const context = await modelContext()
    const base = before || context.base
    if (!base || typeof base.provider !== 'string' || typeof base.model !== 'string') {
      return { ok: false, why: 'не удалось определить текущую модель' }
    }
    try {
      await controller.selectModel({
        sessionId,
        provider: base.provider,
        model: base.model,
        reasoningEffort: wanted,
      })
    } catch (error) {
      return { ok: false, why: 'selectModel: ' + ((error && error.message) || String(error)) }
    }
    if (before && defaults && typeof defaults.saveSelection === 'function') {
      try {
        await defaults.saveSelection(before)
      } catch (error) {
        console.warn('[side-chat] could not restore the default model: %s', (error && error.message) || error)
      }
    }
    return { ok: true, why: base.provider + '/' + base.model + ' effort=' + wanted }
  }

  const createThread = async (workingSessionId, bind) => {
    const controller = service(ctx, 'sessionController')
    if (!controller || typeof controller.create !== 'function') {
      throw new Error('sessionController недоступен на хосте')
    }
    const cwd = cwdOf(workingSessionId)
    // Name the Session ourselves and remember it *before* creation, so the
    // `agent/created` hook already knows this agent is an adviser.
    const wanted = 'session-' + randomUUID()
    // Threads are free unless the caller asks for a binding: pinning is a deliberate
    // action in the history list, not a side effect of pressing "+".
    const owner = bind === true ? workingSessionId : null
    remember(wanted, owner)
    const request = { sessionId: wanted, agentPreset: PRESET_ID }
    if (cwd !== undefined) request.cwd = cwd
    const created = await controller.create(request)
    const sessionId = created && created.sessionId
    if (typeof sessionId !== 'string' || sessionId === '') {
      forget(wanted)
      throw new Error('create вернул пустой sessionId')
    }
    if (sessionId !== wanted) {
      forget(wanted)
      remember(sessionId, owner)
    }
    const masked = makeAdviser(sessionId)
    const model = await applyChatModel(sessionId)
    return { sessionId, masked: masked.ok, why: masked.why, cwd: cwd ?? null, model: model.ok ? model.why : 'failed: ' + model.why }
  }

  // Re-applied on every (re)creation, which is what makes the policy survive a
  // restart: a resumed thread is masked before its first turn can run.
  ctx.on('agent/created', (payload) => {
    const agent = payload && payload.agent
    if (!agent || !findThread(agent.id)) return
    try {
      makeAdviser(agent.id)
    } catch (error) {
      console.warn('[side-chat] adviser mask on creation failed: %s', (error && error.message) || error)
    }
  })

  const handler = async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost')
      const rest = url.pathname.startsWith(ROUTE) ? url.pathname.slice(ROUTE.length) || '/' : url.pathname
      const method = (req.method ?? 'GET').toUpperCase()

      if (method === 'POST' && rest === '/thread') {
        const body = await readJsonBody(req)
        const value = await createThread(body && body.workingSessionId, body && body.bind === true)
        return sendJson(res, 200, { ok: true, value })
      }

      // Idempotent: the panel calls it on mount, so a thread restored after a
      // restart is masked again before the user can send anything.
      if (method === 'POST' && rest === '/adviser') {
        const body = await readJsonBody(req)
        const sessionId = body && body.sessionId
        if (typeof sessionId !== 'string' || sessionId === '') {
          return sendJson(res, 200, { ok: false, error: 'sessionId is required' })
        }
        remember(sessionId)
        const masked = makeAdviser(sessionId)
        return sendJson(res, 200, { ok: true, value: { masked: masked.ok, why: masked.why } })
      }

      if (method === 'GET' && (rest === '/' || rest === '/status.json')) {
        return sendJson(res, 200, {
          ok: true,
          value: { threads: threads.map((row) => row.id), binding: threads.map((row) => ({ id: row.id, owner: row.owner })) },
        })
      }

      // Support probe: what a page read actually returns for a thread.
      if (method === 'GET' && rest === '/eventpage.json') {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const sessionId = url.searchParams.get('sessionId') || ''
        const controller = service(ctx, 'sessionController')
        if (!controller || typeof controller.events !== 'function') {
          return sendJson(res, 200, { ok: false, error: 'events недоступен' })
        }
        const cut = url.searchParams.get('throughSeq')
        const request = { address: { kind: 'session', sessionId }, maxMessages: 12 }
        if (cut !== null) request.throughSeq = Number(cut)
        try {
          const page = await controller.events(request, new AbortController().signal)
          const records = (page && page.records) || []
          return sendJson(res, 200, {
            ok: true,
            value: {
              cursor: page && page.cursor,
              hasMore: page && page.hasMore,
              count: records.length,
              types: records.map((entry) => entry && entry.event ? entry.event.type : 'raw'),
              users: records
                .map((entry) => (entry && entry.event) || null)
                .filter((event) => event && event.type === 'user/message')
                .map((event) => {
                  const data = event.data || {}
                  const content = Array.isArray(data.content) ? data.content : []
                  const texts = content.filter((block) => block && typeof block.text === 'string')
                  return {
                    kind: data.source ? data.source.kind : null,
                    blocks: content.map((block) => block && block.type),
                    chars: texts.reduce((sum, block) => sum + block.text.length, 0),
                  }
                }),
            },
          })
        } catch (error) {
          return sendJson(res, 200, { ok: false, error: (error && error.message) || String(error) })
        }
      }

      // History for the panel: threads bound to this working session, plus the free
      // ones that belong to no session. Titles are resolved lazily and cached.
      if (method === 'GET' && rest === '/threads.json') {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const owner = url.searchParams.get('owner') || ''
        const rows = [...threads].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        const bound = []
        const free = []
        for (const row of rows) {
          const title = await titleOf(row)
          if (title === MISSING) {
            // The Session was deleted outside the plugin; drop the stale entry.
            forget(row.id)
            continue
          }
          const item = { id: row.id, owner: row.owner, createdAt: row.createdAt, title }
          if (row.owner === null || row.owner === '') free.push(item)
          else if (owner !== '' && row.owner === owner) bound.push(item)
        }
        return sendJson(res, 200, { ok: true, value: { bound, free } })
      }

      // bind / unbind / forget one thread. Forget removes the registry entry only: the
      // Session log stays on disk until the user deletes it.
      if (method === 'POST' && rest === '/threads') {
        const body = await readJsonBody(req)
        const sessionId = body && body.sessionId
        const action = body && body.action
        if (typeof sessionId !== 'string' || sessionId === '') {
          return sendJson(res, 200, { ok: false, error: 'sessionId is required' })
        }
        const record = findThread(sessionId)
        if (!record) return sendJson(res, 200, { ok: false, error: 'unknown thread' })
        if (action === 'bind') {
          record.owner = typeof body.owner === 'string' && body.owner !== '' ? body.owner : null
          saveThreads()
          return sendJson(res, 200, { ok: true, value: { id: record.id, owner: record.owner } })
        }
        if (action === 'unbind') {
          record.owner = null
          saveThreads()
          return sendJson(res, 200, { ok: true, value: { id: record.id, owner: null } })
        }
        if (action === 'forget') {
          forget(sessionId)
          return sendJson(res, 200, { ok: true, value: { forgotten: sessionId } })
        }
        return sendJson(res, 200, { ok: false, error: 'action must be bind, unbind or forget' })
      }

      // Same path the panel uses; kept as a route so the thread can be driven and
      // checked without a browser (also the seam a voice transcription would use).
      if (method === 'POST' && rest === '/say') {
        const body = await readJsonBody(req)
        const controller = service(ctx, 'sessionController')
        if (!controller || typeof controller.prompt !== 'function') {
          return sendJson(res, 200, { ok: false, error: 'sessionController.prompt недоступен' })
        }
        const value = await controller.prompt({
          requestId: 'side-chat-say-' + randomUUID(),
          sessionId: body.sessionId,
          mode: 'queue',
          content: [{ type: 'text', text: String(body.text || '') }],
        }, new AbortController().signal)
        return sendJson(res, 200, { ok: true, value })
      }

      if (method === 'GET' && rest === '/voice.json') {
        const speech = service(ctx, 'speechController')
        if (!speech || typeof speech.catalog !== 'function') {
          return sendJson(res, 200, { ok: false, error: 'speechController недоступен' })
        }
        const catalog = await speech.catalog()
        const selection = catalog && catalog.selection
        // Warming the recognizer takes seconds; starting it now means the first
        // recording does not wait for the model.
        try {
          if (selection && selection.providerId && typeof speech.prepare === 'function') {
            speech.prepare(selection.providerId)
          }
        } catch { /* the transcribe call reports the real failure */ }
        return sendJson(res, 200, { ok: true, value: catalog })
      }

      if (method === 'POST' && rest === '/voice') {
        const body = await readJsonBody(req)
        const speech = service(ctx, 'speechController')
        if (!speech || typeof speech.transcribe !== 'function') {
          return sendJson(res, 200, { ok: false, error: 'speechController.transcribe недоступен' })
        }
        const audioBase64 = body && body.audioBase64
        if (typeof audioBase64 !== 'string' || audioBase64.length < 100) {
          return sendJson(res, 200, { ok: false, error: 'пустая запись' })
        }
        const request = { audioBase64 }
        if (body.providerId) request.providerId = body.providerId
        if (body.language) request.language = body.language
        const value = await speech.transcribe(request, new AbortController().signal)
        return sendJson(res, 200, { ok: true, value })
      }

      if (method === 'GET' && rest === '/settings.json') {
        const context = await modelContext()
        return sendJson(res, 200, {
          ok: true,
          value: {
            reasoningEffort: currentEffort(),
            efforts: context.efforts,
            model: context.base ? { provider: context.base.provider, model: context.base.model } : null,
          },
        })
      }

      if (method === 'POST' && rest === '/settings') {
        const body = await readJsonBody(req)
        const effort = body && body.reasoningEffort
        const context = await modelContext()
        const allowed = context.efforts.map((entry) => entry.id)
        if (typeof effort !== 'string' || effort === '' || (allowed.length > 0 && allowed.indexOf(effort) === -1)) {
          return sendJson(res, 200, {
            ok: false,
            error: 'недопустимое усилие: ' + String(effort) + ' (доступно: ' + allowed.join(', ') + ')',
          })
        }
        settings = { reasoningEffort: effort }
        writeSettings(settings)
        const failed = []
        for (const record of threads) {
          const applied = await applyChatModel(record.id, effort)
          if (!applied.ok) failed.push(record.id + ': ' + applied.why)
        }
        return sendJson(res, 200, { ok: true, value: { reasoningEffort: effort, threads: threads.length, failed } })
      }

      if (method === 'POST' && rest === '/model') {
        const body = await readJsonBody(req)
        const sessionId = body && body.sessionId
        if (typeof sessionId !== 'string' || sessionId === '') {
          return sendJson(res, 200, { ok: false, error: 'sessionId is required' })
        }
        const model = await applyChatModel(sessionId)
        return sendJson(res, 200, { ok: model.ok, value: model })
      }

      if (method === 'GET' && rest === '/models.json') {
        const controller = service(ctx, 'sessionController')
        if (!controller || typeof controller.modelCatalog !== 'function') {
          return sendJson(res, 200, { ok: false, error: 'modelCatalog недоступен' })
        }
        const catalog = await controller.modelCatalog()
        return sendJson(res, 200, { ok: true, value: catalog })
      }

      if (method === 'GET' && rest === '/tools.json') {
        const tools = service(ctx, 'tools')
        let names = []
        try {
          names = (tools && typeof tools.definitions === 'function' ? tools.definitions() : [])
            .map((definition) => (definition && typeof definition.name === 'string' ? definition.name : ''))
            .filter((name) => name !== '')
            .sort()
        } catch (error) {
          return sendJson(res, 200, { ok: false, error: (error && error.message) || String(error) })
        }
        const matched = names.filter((name) => READ_ONLY.has(name))
        return sendJson(res, 200, { ok: true, value: { total: names.length, matched, names } })
      }

      return sendJson(res, 404, { ok: false, error: 'not found' })
    } catch (error) {
      return sendJson(res, 200, { ok: false, error: (error && error.message) || String(error) })
    }
  }

  // `webServer` may not exist yet when this row applies on a cold start — a one-shot
  // `ctx.get` silently lost the whole HTTP surface (404 after every app restart).
  // `inject` waits for the service and disposes the route with the plugin.
  ctx.inject(['webServer'], (scope) => {
    const webServer = service(scope, 'webServer')
    if (!webServer || typeof webServer.register !== 'function') {
      console.warn('[side-chat] webServer без register: панель не сможет создать тред')
      return
    }
    scope.effect(() => webServer.register({ kind: 'prefix', path: ROUTE, handler }), 'side-chat: HTTP surface')
  })
}
