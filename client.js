window.__ModuleLoader__.load({
  id: 'dsh-side-chat',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useCallback, useEffect, useRef, useState } = React;

    const TAB_ID = 'dsh-side-chat/tab';
    const TAB_KIND = 'side-chat';
    const STYLE_TAG = 'dsh-side-chat';
    const NS = 'side-chat';
    /** Where the dedicated thread's session id lives, so it survives a reload. */
    const STORAGE_KEY = 'dsh.side-chat.thread.v2';

    const FALLBACK = {
      ru: {
        tabTitle: 'Боковой чат',
        open: 'Открыть боковой чат',
        empty: 'Советник: смотрю, объясняю и планирую — но ничего не меняю.',
        placeholder: 'Спросить, не засоряя рабочую сессию…',
        attach: 'Приложить изображение',
        remove: 'Убрать',
        mic: 'Голосовой ввод',
        micStop: 'Остановить запись',
        micFailed: 'Голос не распознан',
        micEmpty: 'Речь не распознана — попробуй ещё раз',
        settingsTitle: 'Боковой чат',
        settingsAbout: 'Отдельный разговор в правой панели: читает файлы и ищет, но ничего не меняет. Здесь выбирается, сколько он думает перед ответом.',
        effortLoading: 'Читаю настройки…',
        effortLabel: 'Уровень размышлений',
        effortHint: 'Сколько модель думает перед ответом. «Без размышлений» — самый дешёвый и быстрый режим; для сложных планов лучше Low или High. Рабочая сессия не затрагивается — настройка только для бокового чата.',
        effortSaved: 'Сохранено',
        effortSaving: 'Применяю…',
        effortModel: 'Модель',
        hideLauncher: 'Скрывать кнопку Claude Migration',
        hideLauncherHint: 'Прячет плавающую кнопку плагина dsh-claude-move. Сам плагин и его инструменты продолжают работать. Настройка хранится в этом браузере.',
        'effort.off': 'Без размышлений — быстро и дёшево',
        'effort.minimal': 'Minimal — минимум',
        'effort.low': 'Low — короткое обдумывание',
        'effort.medium': 'Medium — среднее',
        'effort.high': 'High — вдумчиво',
        'effort.xhigh': 'XHigh — очень вдумчиво',
        'effort.max': 'Max — максимум',
        send: 'Отправить',
        stop: 'Остановить',
        newThread: 'Новый тред',
        creating: 'Создаю отдельный тред…',
        createFailed: 'Не удалось создать отдельный тред',
        loading: 'Загружаю переписку…',
        failed: 'Не удалось подключиться к переписке',
        separate: 'отдельный тред',
        adviser: 'советник · без изменений',
        you: 'ты',
        assistant: 'ассистент',
        tool: 'инструмент',
        history: 'История чатов',
        historyBound: 'Привязанные к этой сессии',
        historyFree: 'Свободные',
        historyEmpty: 'Пока пусто',
        untitled: 'Без названия',
        bound: 'привязан',
        free: 'свободный',
        bind: 'Привязать к этой сессии',
        freeIt: 'Отвязать — сделать свободным',
        forget: 'Убрать из истории',
      },
      en: {
        tabTitle: 'Side chat',
        open: 'Open side chat',
        empty: 'An adviser: reads, explains, plans — and changes nothing.',
        placeholder: 'Ask without cluttering the working session…',
        attach: 'Attach an image',
        remove: 'Remove',
        mic: 'Voice input',
        micStop: 'Stop recording',
        micFailed: 'Could not transcribe',
        micEmpty: 'No speech recognised — try again',
        settingsTitle: 'Side chat',
        settingsAbout: 'A separate conversation in the right panel: reads files and searches, changes nothing. This picks how much it thinks before answering.',
        effortLoading: 'Reading settings…',
        effortLabel: 'Reasoning level',
        effortHint: 'How much the model thinks before answering. “Off” is the cheapest and fastest; for harder plans pick Low or High. The working session is not affected — this applies to the side chat only.',
        effortSaved: 'Saved',
        effortSaving: 'Applying…',
        effortModel: 'Model',
        hideLauncher: 'Hide the Claude Migration button',
        hideLauncherHint: 'Hides the floating launcher injected by dsh-claude-move. That plugin and its tools keep working. Stored in this browser.',
        'effort.off': 'Off — fast and cheap',
        'effort.minimal': 'Minimal',
        'effort.low': 'Low — brief reasoning',
        'effort.medium': 'Medium',
        'effort.high': 'High — thoughtful',
        'effort.xhigh': 'XHigh — very thoughtful',
        'effort.max': 'Max — maximum',
        send: 'Send',
        stop: 'Stop',
        newThread: 'New thread',
        creating: 'Creating a separate thread…',
        createFailed: 'Could not create a separate thread',
        loading: 'Loading transcript…',
        failed: 'Could not connect to the transcript',
        separate: 'separate thread',
        adviser: 'adviser · read-only',
        you: 'you',
        assistant: 'assistant',
        tool: 'tool',
        history: 'Chat history',
        historyBound: 'Bound to this session',
        historyFree: 'Free',
        historyEmpty: 'Nothing yet',
        untitled: 'Untitled',
        bound: 'bound',
        free: 'free',
        bind: 'Bind to this session',
        freeIt: 'Unbind — make it free',
        forget: 'Remove from history',
      },
      zh: {
        tabTitle: '侧边对话',
        open: '打开侧边对话',
        empty: '顾问：会阅读、解释和规划，但不会改动任何东西。',
        placeholder: '在不打断工作会话的情况下提问…',
        attach: '附加图片',
        remove: '移除',
        mic: '语音输入',
        micStop: '停止录音',
        micFailed: '无法识别语音',
        micEmpty: '没有识别到语音，请再试一次',
        settingsTitle: '侧边对话',
        settingsAbout: '右侧面板里的独立对话：可以读取文件、搜索，但不会做任何修改。这里选择它在回答前思考的程度。',
        effortLoading: '正在读取设置…',
        effortLabel: '推理强度',
        effortHint: '模型在回答前思考的程度。「关闭」最省最快；复杂的规划建议 Low 或 High。只影响侧边对话，不影响工作会话。',
        effortSaved: '已保存',
        effortSaving: '正在应用…',
        effortModel: '模型',
        hideLauncher: '隐藏 Claude Migration 按钮',
        hideLauncherHint: '隐藏 dsh-claude-move 插件注入的浮动按钮。该插件及其工具仍然可用。设置保存在本浏览器中。',
        'effort.off': '关闭 — 快速且省',
        'effort.minimal': 'Minimal — 最小',
        'effort.low': 'Low — 简短思考',
        'effort.medium': 'Medium — 中等',
        'effort.high': 'High — 深入',
        'effort.xhigh': 'XHigh — 非常深入',
        'effort.max': 'Max — 最大',
        send: '发送',
        stop: '停止',
        newThread: '新对话',
        creating: '正在创建独立对话…',
        createFailed: '无法创建独立对话',
        loading: '正在加载对话…',
        failed: '无法连接到对话',
        separate: '独立对话',
        adviser: '顾问 · 只读',
        you: '你',
        assistant: '助手',
        tool: '工具',
        history: '对话历史',
        historyBound: '绑定到本会话',
        historyFree: '自由对话',
        historyEmpty: '还没有',
        untitled: '未命名',
        bound: '已绑定',
        free: '自由',
        bind: '绑定到本会话',
        freeIt: '解绑 — 设为自由',
        forget: '从历史中移除',
      },
    };

    const CSS = `
      .dshsc { display:flex; flex-direction:column; height:100%; min-height:0; position:relative;
        color:var(--dsw-alias-label-primary); font-size:13px; line-height:20px; }
      .dshsc-hist { position:absolute; top:42px; left:8px; right:8px; z-index:20; max-height:60%;
        overflow:auto; padding:8px; border-radius:10px; border:1px solid var(--dsw-alias-border-l1);
        background:var(--dsw-alias-bg-overlay); box-shadow:0 12px 28px rgba(0,0,0,.22); }
      .dshsc-hist__head { font-size:12px; text-transform:uppercase; letter-spacing:.04em; opacity:.6;
        padding:2px 4px 6px; }
      .dshsc-hist__sect { display:flex; flex-direction:column; gap:2px; margin-top:6px; }
      .dshsc-hist__label { font-size:11px; text-transform:uppercase; letter-spacing:.04em;
        color:var(--dsw-alias-label-secondary); padding:4px 4px 2px; }
      .dshsc-hist__empty { font-size:12px; color:var(--dsw-alias-label-secondary); padding:2px 4px 4px; }
      .dshsc-hist__row { display:flex; align-items:center; gap:2px; border-radius:8px; }
      .dshsc-hist__row:hover { background:var(--dsw-alias-bg-layer-2); }
      .dshsc-hist__row--on { background:var(--dsw-alias-bg-layer-2); }
      .dshsc-hist__open { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; gap:1px;
        padding:6px 8px; border:none; background:none; cursor:pointer; text-align:left; font:inherit;
        color:var(--dsw-alias-label-primary); }
      .dshsc-hist__title { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; }
      .dshsc-hist__meta { font-size:11px; color:var(--dsw-alias-label-secondary); }
      .dshsc-hist__act { flex:0 0 auto; width:22px; height:22px; padding:0; border:none; border-radius:6px;
        background:none; cursor:pointer; color:var(--dsw-alias-label-secondary); font-size:14px; line-height:1; }
      .dshsc-hist__act:hover { background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); }
      .dshsc-hist__act--on { color:var(--dsw-alias-brand-primary); }
      .dshsc__icon--on { background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); }
      .dshsc__head { flex:0 0 auto; display:flex; align-items:center; gap:8px;
        padding:10px 12px; border-bottom:1px solid var(--dsw-alias-border-l1); font-weight:500; }
      .dshsc__head .dshsc__grow { flex:1 1 auto; }
      .dshsc__sub { font-weight:400; opacity:.55; font-size:12px; }
      .dshsc__icon { display:inline-flex; align-items:center; justify-content:center;
        width:24px; height:24px; padding:0; border-radius:6px; border:none; background:none;
        cursor:pointer; color:var(--dsw-alias-label-secondary); }
      .dshsc__icon:hover { background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); }
      .dshsc__body { flex:1 1 auto; min-height:0; overflow:auto; padding:12px;
        display:flex; flex-direction:column; gap:10px; }
      .dshsc__row { display:flex; flex-direction:column; gap:2px; }
      .dshsc__who { font-size:11px; text-transform:uppercase; letter-spacing:.04em;
        color:var(--dsw-alias-label-secondary); }
      .dshsc__text { white-space:pre-wrap; word-break:break-word; }
      .dshsc__row--tool .dshsc__text { color:var(--dsw-alias-label-secondary);
        font-family:var(--ds-font-family-code); font-size:12px; }
      .dshsc__live { color:var(--dsw-alias-label-secondary); }
      .dshsc__muted { color:var(--dsw-alias-label-secondary); }
      .dshsc__err { color:var(--dsw-alias-state-error-primary); }
      .dshsc__icon--rec { color: var(--dsw-alias-state-error-primary); background: var(--dsw-alias-bg-layer-2); }
      .dshsc-set { display:flex; flex-direction:column; gap:14px; padding:4px 0; max-width:560px; }
      .dshsc-set__desc { margin:5px 0 0; opacity:.72; font-size:13px; line-height:19px; }
      .dshsc-set__row { display:flex; flex-direction:column; gap:6px; }
      .dshsc-set__label { font-size:13px; font-weight:500; color:var(--dsw-alias-label-primary); }
      .dshsc-set__hint { font-size:12px; line-height:18px; color:var(--dsw-alias-label-secondary); }
      .dshsc-set__field { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
      .dshsc-set__select { flex:0 1 300px; min-width:220px; height:32px; padding:0 8px; border-radius:8px;
        border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-1);
        color:var(--dsw-alias-label-primary); font:inherit; font-size:13px; cursor:pointer; }
      .dshsc-set__select:focus { outline:none; border-color:var(--dsw-alias-brand-primary); }
      .dshsc-set__select:disabled { opacity:.55; cursor:default; }
      .dshsc-set__check { display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;
        color:var(--dsw-alias-label-primary); }
      .dshsc-set__err { font-size:12px; color:var(--dsw-alias-state-error-primary); }
      .dshsc__spin { font-size: 14px; line-height: 1; color: var(--dsw-alias-label-secondary); }
      .dshsc__compose { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; gap:6px; }
      .dshsc__rowline { display:flex; gap:6px; align-items:flex-end; }
      .dshsc__thumbs { display:flex; flex-wrap:wrap; gap:6px; }
      .dshsc__thumb { position:relative; width:52px; height:52px; border-radius:8px; overflow:hidden;
        border:1px solid var(--dsw-alias-border-l1); }
      .dshsc__thumb img { width:100%; height:100%; object-fit:cover; display:block; }
      .dshsc__thumbX { position:absolute; top:1px; right:1px; width:16px; height:16px; padding:0;
        border:none; border-radius:50%; background:rgba(0,0,0,.55); color:#fff;
        font-size:11px; line-height:14px; cursor:pointer; }
      .dshsc__foot { flex:0 0 auto; display:flex; gap:6px; padding:8px;
        border-top:1px solid var(--dsw-alias-border-l1); align-items:flex-end; }
      .dshsc__input { flex:1 1 auto; min-height:32px; max-height:none; resize:none; overflow-y:hidden;
        box-sizing:border-box; line-height:20px; padding:6px 9px; border-radius:8px;
        border:1px solid var(--dsw-alias-border-l1);
        background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font:inherit;
        transition:height .08s ease-out; }
      .dshsc__input::placeholder { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .dshsc__input:focus { outline:none; border-color:var(--dsw-alias-brand-primary); }
      .dshsc__send { flex:0 0 auto; padding:0 12px; height:32px; border-radius:8px; cursor:pointer;
        border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-2);
        color:var(--dsw-alias-label-primary); font:inherit; }
      .dshsc__send:disabled { opacity:.45; cursor:default; }
      .dshsc__send--stop { color:var(--dsw-alias-state-error-primary); }
      .dshsc__open { display:inline-flex; align-items:center; justify-content:center;
        width:26px; height:26px; padding:0; border-radius:7px; border:none; background:none;
        cursor:pointer; color:var(--dsw-alias-label-secondary); }
      .dshsc__open:hover { background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); }
    `;

    function installStyles() {
      if (typeof document === 'undefined') return;
      if (document.querySelector('style[data-plugin-css="' + STYLE_TAG + '"]') !== null) return;
      const tag = document.createElement('style');
      tag.dataset.plugin = 'dsh-side-chat';
      tag.dataset.pluginCss = STYLE_TAG;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }

    /**
     * Optional: hide the launcher that `dsh-claude-move` injects as raw DOM
     * (`#cm-open` inside `#claude-move-panel`). It is not a slot, so there is no
     * registration to remove. Off by default — a plugin should not hide another
     * plugin's UI without being asked; the settings page exposes the switch.
     */
    const HIDE_LAUNCHER_KEY = 'dsh.side-chat.hide-claude-launcher';
    const LAUNCHER_TAG = STYLE_TAG + '-hide-cm';

    function launcherHidden() {
      try { return window.localStorage.getItem(HIDE_LAUNCHER_KEY) === '1'; } catch { return false; }
    }

    function applyLauncherVisibility(hidden) {
      if (typeof document === 'undefined') return;
      const existing = document.querySelector('style[data-plugin-css="' + LAUNCHER_TAG + '"]');
      if (!hidden) {
        if (existing) existing.remove();
        return;
      }
      if (existing) return;
      const tag = document.createElement('style');
      tag.dataset.plugin = 'dsh-side-chat';
      tag.dataset.pluginCss = LAUNCHER_TAG;
      tag.textContent = '#claude-move-panel, #cm-open { display: none !important; }';
      document.head.appendChild(tag);
    }

    function makeTranslator(ctx) {
      let lang = 'ru';
      try {
        const snapshot = ctx.locale.getLocale();
        // 'zh-CN' / 'en-US' / 'pt-BR' all resolve by their primary subtag.
        if (snapshot && typeof snapshot.id === 'string') lang = snapshot.id.slice(0, 2).toLowerCase();
      } catch { /* Russian by default */ }
      const dict = FALLBACK[lang];
      const fallback = FALLBACK.en;
      return (key) => (dict && dict[key]) || fallback[key] || key;
    }

    function sessionApi(ctx) {
      try {
        const direct = ctx.get && ctx.get('remote.session');
        if (direct) return direct;
      } catch { /* fall through */ }
      try {
        if (ctx.remote && ctx.remote.session) return ctx.remote.session;
      } catch { /* fall through */ }
      return undefined;
    }

    // One remembered thread per working session, so opening the panel in a session
    // returns to that session's own conversation instead of a global "last one".
    const STORAGE_PREFIX = 'dsh.side-chat.thread.v3.';
    const LEGACY_KEY = 'dsh.side-chat.thread.v2';

    function threadKey(workingSessionId) {
      return STORAGE_PREFIX + (workingSessionId || 'free');
    }
    function readStoredThread(workingSessionId) {
      try {
        const own = window.localStorage.getItem(threadKey(workingSessionId));
        if (own) return own;
        // Adopt the v1/v2 single-thread key once, so an upgrade keeps its conversation.
        const legacy = window.localStorage.getItem(LEGACY_KEY);
        if (legacy) {
          window.localStorage.setItem(threadKey(workingSessionId), legacy);
          return legacy;
        }
      } catch { /* private mode or storage disabled */ }
      return '';
    }
    function storeThread(workingSessionId, id) {
      try { window.localStorage.setItem(threadKey(workingSessionId), id); } catch { /* keep in memory */ }
    }
    function dropStoredThread(workingSessionId) {
      try { window.localStorage.removeItem(threadKey(workingSessionId)); } catch { /* nothing to drop */ }
    }

    /**
     * One resolution per page, shared by every mount. The tab body is remounted by the
     * right column, so a per-component in-flight flag would abandon the request and
     * mint a new Session on each remount — that is exactly how stray threads appeared.
     *
     * Order: this session's remembered thread → this session's newest bound thread →
     * create. A free thread is never adopted silently; it is reachable from history.
     */
    let threadPromise = null;
    function ensureThread(workingSessionId) {
      const stored = readStoredThread(workingSessionId);
      if (stored !== '') return Promise.resolve({ id: stored, masked: null });
      if (threadPromise !== null) return threadPromise;
      threadPromise = (async () => {
        if (workingSessionId) {
          try {
            const url = '/x-side-chat/threads.json?owner=' + encodeURIComponent(workingSessionId);
            const page = await (await fetch(url)).json();
            const bound = page && page.ok && page.value && Array.isArray(page.value.bound) ? page.value.bound : [];
            if (bound.length > 0 && typeof bound[0].id === 'string') {
              storeThread(workingSessionId, bound[0].id);
              return { id: bound[0].id, masked: null };
            }
          } catch { /* fall through to creation */ }
        }
        const response = await fetch('/x-side-chat/thread', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          // Free by default: pinning to a session is done from the history list.
          body: JSON.stringify({ workingSessionId, bind: false }),
        });
        const payload = await response.json().catch(() => null);
        if (!payload || payload.ok !== true) throw new Error((payload && payload.error) || ('HTTP ' + response.status));
        const value = payload.value || {};
        const id = value.sessionId;
        if (typeof id !== 'string' || id === '') throw new Error('хост вернул пустой sessionId');
        storeThread(workingSessionId, id);
        return { id, masked: value.masked === true, model: value.model };
      })();
      threadPromise.catch(() => { threadPromise = null; });
      return threadPromise;
    }

    /** Text of one message-like object, from its ordinary text blocks only. */
    function textOf(message) {
      if (message === null || message === undefined) return '';
      if (typeof message === 'string') return message;
      const content = message.content;
      if (typeof content === 'string') return content;
      if (Array.isArray(content)) {
        const parts = [];
        for (const block of content) {
          if (typeof block === 'string') { parts.push(block); continue; }
          if (!block || typeof block !== 'object') continue;
          // `reasoning` and `tool-call` blocks also carry text; only the answer belongs
          // in a transcript row.
          if (block.type !== undefined && block.type !== 'text') continue;
          if (typeof block.text === 'string') parts.push(block.text);
          else if (typeof block.content === 'string') parts.push(block.content);
        }
        return parts.join('');
      }
      if (typeof message.text === 'string') return message.text;
      return '';
    }

    function chunkText(chunk) {
      if (!chunk || typeof chunk !== 'object') return '';
      if (typeof chunk.text === 'string') return chunk.text;
      if (typeof chunk.delta === 'string') return chunk.delta;
      if (typeof chunk.textDelta === 'string') return chunk.textDelta;
      const delta = chunk.delta;
      if (delta && typeof delta === 'object' && typeof delta.text === 'string') return delta.text;
      if (delta && Array.isArray(delta.content)) {
        const parts = [];
        for (const block of delta.content) {
          if (block && block.type === 'text' && typeof block.text === 'string') parts.push(block.text);
        }
        return parts.join('');
      }
      return '';
    }

    function isNonTextChunk(chunk) {
      const kind = chunk && typeof chunk === 'object' ? (chunk.type || chunk.kind) : undefined;
      if (typeof kind !== 'string') return false;
      return kind.indexOf('reasoning') !== -1 || kind.indexOf('tool') !== -1 || kind.indexOf('thinking') !== -1;
    }

    /** Linear resample; the recognizer expects 16 kHz mono. */
    function resample(input, fromRate, toRate) {
      if (fromRate === toRate) return input;
      const ratio = fromRate / toRate;
      const length = Math.floor(input.length / ratio);
      const out = new Float32Array(length);
      for (let i = 0; i < length; i += 1) {
        const pos = i * ratio;
        const left = Math.floor(pos);
        const right = Math.min(left + 1, input.length - 1);
        const frac = pos - left;
        out[i] = input[left] * (1 - frac) + input[right] * frac;
      }
      return out;
    }

    /** 16-bit PCM WAV bytes, which is what the Host-side transcriber accepts. */
    function encodeWav(samples, sampleRate) {
      const buffer = new ArrayBuffer(44 + samples.length * 2);
      const view = new DataView(buffer);
      const text = (offset, value) => {
        for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
      };
      text(0, 'RIFF');
      view.setUint32(4, 36 + samples.length * 2, true);
      text(8, 'WAVE');
      text(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      text(36, 'data');
      view.setUint32(40, samples.length * 2, true);
      let offset = 44;
      for (let i = 0; i < samples.length; i += 1, offset += 2) {
        const value = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, value < 0 ? value * 0x8000 : value * 0x7fff, true);
      }
      return new Uint8Array(buffer);
    }

    function toBase64(bytes) {
      let binary = '';
      const step = 0x8000;
      for (let i = 0; i < bytes.length; i += step) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
      }
      return window.btoa(binary);
    }

    /** Events worth showing in a conversational transcript. */
    function rowsFromEvent(event, out) {
      if (!event || typeof event.type !== 'string') return;
      const data = event.data || {};
      if (event.type === 'user/message') {
        // Injected context arrives as a user message too; its source tells them apart.
        // `runtime-context`, workspace instructions and skill catalogs must never be
        // rendered as something the user typed.
        const kind = data && data.source ? data.source.kind : undefined;
        if (kind !== undefined && kind !== 'user') return;
        const blocks = data && Array.isArray(data.content) ? data.content : [];
        const pictures = blocks.filter((block) => block && block.type === 'image').length;
        const text = textOf(data);
        const label = pictures > 0
          ? (text.trim() === '' ? 'изображений: ' + pictures : text + '\nизображений: ' + pictures)
          : text;
        if (label.trim() !== '') out.push({ id: 'u' + event.seq, role: 'user', text: label });
        return;
      }
      if (event.type === 'assistant/message') {
        const text = textOf(data.message);
        if (text.trim() !== '') out.push({ id: 'a' + event.seq, role: 'assistant', text });
        return;
      }
      // Tool steps are deliberately not rows: a chat shows what was said, not what ran.
    }

    function apply(ctx) {
      installStyles();
      applyLauncherVisibility(launcherHidden());
      const t = makeTranslator(ctx);

      try {
        ctx.effect(() => ctx.locale.register(NS, {
          ru: { ...FALLBACK.ru },
          en: { ...FALLBACK.en },
        }), 'side-chat: dictionaries');
      } catch (error) {
        console.warn('[side-chat] locale registration failed', error);
      }

      function SideChatBody(props) {
        const workingSessionId = props.sessionId;
        const [threadId, setThreadId] = useState(() => readStoredThread(props.sessionId));
        const [creating, setCreating] = useState(false);
        const [createError, setCreateError] = useState('');
        const [attempt, setAttempt] = useState(0);
        const [masked, setMasked] = useState(null);
        const [historyOpen, setHistoryOpen] = useState(false);
        const [history, setHistory] = useState({ loading: false, bound: [], free: [] });

        const [items, setItems] = useState([]);
        const [live, setLive] = useState('');
        const [running, setRunning] = useState(false);
        const [status, setStatus] = useState('idle');
        const [error, setError] = useState('');
        const [draft, setDraft] = useState('');
        const [images, setImages] = useState([]);
        const [recording, setRecording] = useState(false);
        const [transcribing, setTranscribing] = useState(false);
        const audioRef = useRef(null);
        const fileInputRef = useRef(null);
        const inputRef = useRef(null);
        const bodyRef = useRef(null);
        const stickRef = useRef(true);
        const recreateGuard = useRef(0);

        // The host owns thread creation, so it can apply the adviser mask before the
        // first turn; the panel only asks for an id and remembers it.
        useEffect(() => {
          if (threadId !== '') return undefined;
          let alive = true;
          setCreating(true);
          setCreateError('');
          ensureThread(workingSessionId)
            .then((thread) => {
              if (!alive) return;
              setThreadId(thread.id);
              setMasked(thread.masked);
            })
            .catch((thrown) => {
              if (alive) setCreateError(thrown && thrown.message ? thrown.message : String(thrown));
            })
            .finally(() => {
              if (alive) setCreating(false);
            });
          return () => { alive = false; };
        }, [threadId, attempt, workingSessionId]);

        useEffect(() => {
          if (threadId === '') return undefined;
          const controller = new AbortController();
          let disposed = false;
          setItems([]);
          setLive('');
          setError('');
          setRunning(false);
          setStatus('loading');
          const api = sessionApi(ctx);
          if (!api || typeof api.follow !== 'function') {
            setStatus('failed');
            setError('remote.session.follow недоступен');
            return undefined;
          }
          const absorb = (event) => {
            if (!event || typeof event.type !== 'string') return;
            if (event.type === 'assistant/message') setLive('');
            if (event.type === 'turn/start') { setRunning(true); return; }
            if (event.type === 'turn/end') { setRunning(false); setLive(''); return; }
            const next = [];
            rowsFromEvent(event, next);
            if (next.length > 0) {
              setItems((prev) => {
                const merged = prev.concat(next);
                return merged.length > 400 ? merged.slice(-400) : merged;
              });
            }
          };
          (async () => {
            try {
              const stream = api.follow({ address: { kind: 'session', sessionId: threadId }, assistantStream: true }, controller.signal);
              for await (const frame of stream) {
                if (disposed) break;
                if (!frame || typeof frame.type !== 'string') continue;
                if (frame.type === 'snapshot') {
                  const next = [];
                  for (const record of frame.records || []) {
                    if (record && record.type === 'event' && record.event) rowsFromEvent(record.event, next);
                  }
                  setItems(next);
                  setStatus('ready');
                  continue;
                }
                if (frame.type === 'event') { absorb(frame.event); continue; }
                if (frame.type === 'assistant-stream') {
                  const inner = frame.frame;
                  if (!inner) continue;
                  if (inner.type === 'start') { setLive(''); setRunning(true); continue; }
                  if (inner.type === 'end') { setRunning(false); continue; }
                  if (inner.type === 'chunk') {
                    if (isNonTextChunk(inner.chunk)) continue;
                    const text = chunkText(inner.chunk);
                    if (text !== '') setLive((prev) => prev + text);
                  }
                }
              }
            } catch (thrown) {
              if (disposed || controller.signal.aborted) return;
              const message = thrown && thrown.message ? thrown.message : String(thrown);
              setStatus('failed');
              setError(message);
              // A stored id whose session no longer exists recovers by starting a fresh thread.
              if (recreateGuard.current < 2 && /not found|not-found|unknown session|no such|expired/i.test(message)) {
                recreateGuard.current += 1;
                dropStoredThread();
                setThreadId('');
              }
            }
          })();
          return () => { disposed = true; controller.abort(); };
        }, [threadId]);

        // Re-assert the adviser mask on every mount: a thread restored from storage
        // after a restart must be narrowed before the user can send anything.
        useEffect(() => {
          if (threadId === '') return;
          fetch('/x-side-chat/adviser', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ sessionId: threadId }),
          })
            .then((response) => response.json())
            .then((payload) => {
              if (payload && payload.ok === true && payload.value) setMasked(payload.value.masked === true);
            })
            .catch(() => { /* the mask keeps its last known state */ });
        }, [threadId]);

        useEffect(() => {
          const node = bodyRef.current;
          if (!node || !stickRef.current) return;
          node.scrollTop = node.scrollHeight;
        }, [items, live]);

        const onScroll = () => {
          const node = bodyRef.current;
          if (!node) return;
          stickRef.current = node.scrollHeight - node.scrollTop - node.clientHeight < 48;
        };

        // Grow the composer with the draft, up to a ceiling; past it the field scrolls.
        // Measured rather than counted in lines: wrapped paragraphs then grow correctly.
        useEffect(() => {
          const node = inputRef.current;
          if (!node) return;
          const max = 168;
          node.style.height = 'auto';
          const next = Math.min(node.scrollHeight, max);
          node.style.height = next + 'px';
          node.style.overflowY = node.scrollHeight > max ? 'auto' : 'hidden';
        }, [draft, threadId, images.length]);

        const loadHistory = useCallback(async () => {
          setHistory((prev) => ({ ...prev, loading: true }));
          try {
            const url = '/x-side-chat/threads.json?owner=' + encodeURIComponent(workingSessionId || '');
            const page = await (await fetch(url)).json();
            if (!page || page.ok !== true) throw new Error((page && page.error) || 'history failed');
            const value = page.value || {};
            setHistory({
              loading: false,
              bound: Array.isArray(value.bound) ? value.bound : [],
              free: Array.isArray(value.free) ? value.free : [],
            });
          } catch (thrown) {
            setHistory({ loading: false, bound: [], free: [] });
            setError((thrown && thrown.message) || String(thrown));
          }
        }, [workingSessionId]);

        const openHistory = () => {
          const next = !historyOpen;
          setHistoryOpen(next);
          if (next) loadHistory();
        };

        const selectThread = (id) => {
          storeThread(workingSessionId, id);
          setThreadId(id);
          setHistoryOpen(false);
        };

        const changeBinding = async (item, action) => {
          try {
            await fetch('/x-side-chat/threads', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ sessionId: item.id, action, owner: workingSessionId }),
            });
            await loadHistory();
          } catch (thrown) {
            setError((thrown && thrown.message) || String(thrown));
          }
        };

        const forgetThread = async (item) => {
          try {
            await fetch('/x-side-chat/threads', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ sessionId: item.id, action: 'forget' }),
            });
            // The Session log stays on disk; only the history entry goes away.
            if (item.id === threadId) {
              dropStoredThread(workingSessionId);
              threadPromise = null;
              recreateGuard.current = 0;
              setThreadId('');
              setAttempt((value) => value + 1);
            }
            await loadHistory();
          } catch (thrown) {
            setError((thrown && thrown.message) || String(thrown));
          }
        };

        const newThread = useCallback(() => {
          recreateGuard.current = 0;
          threadPromise = null;
          dropStoredThread(workingSessionId);
          setItems([]);
          setLive('');
          setRunning(false);
          setError('');
          setCreateError('');
          setStatus('idle');
          setThreadId('');
          setAttempt((value) => value + 1);
        }, [workingSessionId]);

        const send = async () => {
          const text = draft.trim();
          if (threadId === '' || (text === '' && images.length === 0)) return;
          const api = sessionApi(ctx);
          if (!api || typeof api.prompt !== 'function') { setError('remote.session.prompt недоступен'); return; }
          const content = [];
          if (text !== '') content.push({ type: 'text', text });
          for (const image of images) {
            content.push({ type: 'image', mediaType: image.mediaType, data: image.data, name: image.name });
          }
          const sentImages = images;
          setDraft('');
          setImages([]);
          try {
            await api.prompt({
              requestId: 'side-chat-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
              sessionId: threadId,
              mode: 'queue',
              content,
            }, new AbortController().signal);
          } catch (thrown) {
            setError(thrown && thrown.message ? thrown.message : String(thrown));
            setDraft(text);
            setImages(sentImages);
          }
        };

        const onFiles = (event) => {
          const files = Array.from((event.target && event.target.files) || []);
          if (event.target) event.target.value = '';
          for (const file of files) {
            if (!file || typeof file.type !== 'string' || file.type.indexOf('image/') !== 0) continue;
            const reader = new FileReader();
            reader.onload = () => {
              const result = typeof reader.result === 'string' ? reader.result : '';
              const comma = result.indexOf(',');
              if (comma < 0) return;
              const base64 = result.slice(comma + 1);
              setImages((prev) => prev.concat({
                id: 'img-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
                mediaType: file.type,
                data: base64,
                name: file.name,
                preview: result,
              }));
            };
            reader.readAsDataURL(file);
          }
        };

        const startRecording = async () => {
          if (recording || transcribing) return;
          setError('');
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
            });
            const Ctor = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new Ctor();
            const source = audioCtx.createMediaStreamSource(stream);
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            const buffers = [];
            processor.onaudioprocess = (event) => {
              buffers.push(new Float32Array(event.inputBuffer.getChannelData(0)));
            };
            source.connect(processor);
            processor.connect(audioCtx.destination);
            audioRef.current = { stream, audioCtx, source, processor, buffers, sampleRate: audioCtx.sampleRate };
            setRecording(true);
            // Warming the recognizer takes seconds; start it while the user talks.
            fetch('/x-side-chat/voice.json').catch(() => {});
          } catch (thrown) {
            setError(t('micFailed') + ': ' + (thrown && thrown.message ? thrown.message : String(thrown)));
          }
        };

        const stopRecording = async () => {
          const active = audioRef.current;
          audioRef.current = null;
          setRecording(false);
          if (!active) return;
          try {
            active.processor.disconnect();
            active.source.disconnect();
            active.stream.getTracks().forEach((track) => track.stop());
            await active.audioCtx.close();
          } catch { /* torn down twice, nothing to do */ }
          const total = active.buffers.reduce((sum, chunk) => sum + chunk.length, 0);
          if (total === 0) { setError(t('micEmpty')); return; }
          const merged = new Float32Array(total);
          let offset = 0;
          for (const chunk of active.buffers) {
            merged.set(chunk, offset);
            offset += chunk.length;
          }
          const wav = encodeWav(resample(merged, active.sampleRate, 16000), 16000);
          setTranscribing(true);
          try {
            const response = await fetch('/x-side-chat/voice', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              // GigaAM accepts only `auto`; the Host selection already carries it.
              body: JSON.stringify({ audioBase64: toBase64(wav) }),
            });
            const payload = await response.json().catch(() => null);
            if (!payload || payload.ok !== true) throw new Error((payload && payload.error) || ('HTTP ' + response.status));
            const text = payload.value && payload.value.text ? String(payload.value.text).trim() : '';
            if (text === '') setError(t('micEmpty'));
            else setDraft((prev) => (prev.trim() === '' ? text : prev.replace(/\s*$/, '') + ' ' + text));
          } catch (thrown) {
            setError(t('micFailed') + ': ' + (thrown && thrown.message ? thrown.message : String(thrown)));
          } finally {
            setTranscribing(false);
          }
        };

        // A panel that unmounts mid-recording must release the microphone.
        useEffect(() => () => {
          const active = audioRef.current;
          audioRef.current = null;
          if (!active) return;
          try {
            active.processor.disconnect();
            active.source.disconnect();
            active.stream.getTracks().forEach((track) => track.stop());
            active.audioCtx.close();
          } catch { /* nothing to release */ }
        }, []);

        const stop = async () => {
          const api = sessionApi(ctx);
          if (!api || typeof api.cancel !== 'function' || threadId === '') return;
          try { await api.cancel({ sessionId: threadId }); }
          catch (thrown) { setError(String((thrown && thrown.message) || thrown)); }
        };

        const rows = items.map((item) => h('div', { key: item.id, className: 'dshsc__row dshsc__row--' + item.role },
          h('div', { className: 'dshsc__who' }, t(item.role === 'user' ? 'you' : item.role === 'assistant' ? 'assistant' : 'tool')),
          h('div', { className: 'dshsc__text' }, item.text),
        ));

        const timeLabel = (value) => {
          if (!value) return '';
          try {
            return new Date(value).toLocaleString(undefined, {
              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
            });
          } catch {
            return '';
          }
        };

        const historyRow = (item) => h('div', {
          key: item.id,
          className: 'dshsc-hist__row' + (item.id === threadId ? ' dshsc-hist__row--on' : ''),
        },
        h('button', { className: 'dshsc-hist__open', type: 'button', onClick: () => selectThread(item.id) },
          h('span', { className: 'dshsc-hist__title' }, item.title || t('untitled')),
          h('span', { className: 'dshsc-hist__meta' }, (item.owner ? t('bound') : t('free')) + ' · ' + timeLabel(item.createdAt)),
        ),
        h('button', {
          className: 'dshsc-hist__act' + (item.owner ? ' dshsc-hist__act--on' : ''),
          type: 'button',
          title: item.owner ? t('freeIt') : t('bind'),
          'aria-label': item.owner ? t('freeIt') : t('bind'),
          'aria-pressed': Boolean(item.owner),
          onClick: () => changeBinding(item, item.owner ? 'unbind' : 'bind'),
        }, h('svg', { viewBox: '0 0 24 24', width: 13, height: 13, fill: 'none', 'aria-hidden': true },
          h('path', {
            d: 'M9.5 3.5h5M10.5 3.5V8L8 11.5V13h8v-1.5L13.5 8V3.5M12 13v7.5',
            stroke: 'currentColor',
            'stroke-width': item.owner ? '1.9' : '1.5',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          }))),
        h('button', {
          className: 'dshsc-hist__act',
          type: 'button',
          title: t('forget'),
          'aria-label': t('forget'),
          onClick: () => forgetThread(item),
        }, '×'),
        );

        const historySection = (label, items2) => h('div', { className: 'dshsc-hist__sect' },
          h('div', { className: 'dshsc-hist__label' }, label),
          items2.length === 0
            ? h('div', { className: 'dshsc-hist__empty' }, t('historyEmpty'))
            : items2.map(historyRow),
        );

        const historyPopover = historyOpen ? h('div', { className: 'dshsc-hist' },
          h('div', { className: 'dshsc-hist__head' }, t('history')),
          history.loading ? h('div', { className: 'dshsc-hist__empty' }, t('loading')) : null,
          historySection(t('historyBound'), history.bound),
          historySection(t('historyFree'), history.free),
        ) : null;

        return h('div', { className: 'dshsc' },
          h('div', { className: 'dshsc__head' },
            h('span', null, t('tabTitle')),
            h('span', { className: 'dshsc__sub' }, masked === false ? t('separate') : t('adviser')),
            h('span', { className: 'dshsc__grow' }),
            h('button', {
              className: 'dshsc__icon' + (historyOpen ? ' dshsc__icon--on' : ''),
              type: 'button',
              title: t('history'),
              'aria-label': t('history'),
              'aria-expanded': historyOpen,
              onClick: openHistory,
            }, h('svg', { viewBox: '0 0 24 24', width: 14, height: 14, fill: 'none', 'aria-hidden': true },
              h('path', {
                d: 'M12 7v5l3 2M12 3a9 9 0 1 1-9 9',
                stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
              }))),
            h('button', {
              className: 'dshsc__icon',
              type: 'button',
              title: t('newThread'),
              'aria-label': t('newThread'),
              onClick: newThread,
            }, h('svg', { viewBox: '0 0 24 24', width: 14, height: 14, fill: 'none', 'aria-hidden': true },
              h('path', { d: 'M12 5v14M5 12h14', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round' }))),
          ),
          historyPopover,
          h('div', { className: 'dshsc__body', ref: bodyRef, onScroll },
            creating ? h('div', { className: 'dshsc__muted' }, t('creating')) : null,
            createError !== '' ? h('div', { className: 'dshsc__err' }, t('createFailed') + ': ' + createError) : null,
            status === 'loading' && items.length === 0 && !creating ? h('div', { className: 'dshsc__muted' }, t('loading')) : null,
            status === 'ready' && items.length === 0 && live === '' ? h('div', { className: 'dshsc__muted' }, t('empty')) : null,
            rows,
            live !== '' ? h('div', { className: 'dshsc__row dshsc__row--assistant' },
              h('div', { className: 'dshsc__who' }, t('assistant')),
              h('div', { className: 'dshsc__text dshsc__live' }, live),
            ) : null,
            error !== '' ? h('div', { className: 'dshsc__err' }, t('failed') + ': ' + error) : null,
          ),
          h('div', { className: 'dshsc__foot' },
            h('div', { className: 'dshsc__compose' },
              images.length > 0 ? h('div', { className: 'dshsc__thumbs' }, images.map((image) => h('div', { key: image.id, className: 'dshsc__thumb' },
                h('img', { src: image.preview, alt: image.name || 'image' }),
                h('button', {
                  className: 'dshsc__thumbX',
                  type: 'button',
                  title: t('remove'),
                  onClick: () => setImages((prev) => prev.filter((row) => row.id !== image.id)),
                }, '×'),
              ))) : null,
              h('div', { className: 'dshsc__rowline' },
                h('button', {
                  className: 'dshsc__icon' + (recording ? ' dshsc__icon--rec' : ''),
                  type: 'button',
                  title: recording ? t('micStop') : t('mic'),
                  'aria-label': recording ? t('micStop') : t('mic'),
                  'aria-pressed': recording,
                  disabled: threadId === '' || transcribing,
                  onClick: () => { if (recording) stopRecording(); else startRecording(); },
                }, transcribing
                  ? h('span', { className: 'dshsc__spin', 'aria-hidden': true }, '…')
                  : h('svg', { viewBox: '0 0 24 24', width: 15, height: 15, fill: 'none', 'aria-hidden': true },
                    h('rect', { x: 9, y: 3, width: 6, height: 10.5, rx: 3, stroke: 'currentColor', 'stroke-width': '1.6' }),
                    h('path', {
                      d: 'M5.5 10.5a6.5 6.5 0 0 0 13 0M12 17v4',
                      stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linecap': 'round',
                    }))),
                h('button', {
                  className: 'dshsc__icon',
                  type: 'button',
                  title: t('attach'),
                  'aria-label': t('attach'),
                  disabled: threadId === '',
                  onClick: () => { if (fileInputRef.current) fileInputRef.current.click(); },
                }, h('svg', { viewBox: '0 0 24 24', width: 15, height: 15, fill: 'none', 'aria-hidden': true },
                  h('rect', { x: 3.5, y: 4.5, width: 17, height: 15, rx: 2.5, stroke: 'currentColor', 'stroke-width': '1.6' }),
                  h('circle', { cx: 8.6, cy: 9.6, r: 1.4, fill: 'currentColor' }),
                  h('path', {
                    d: 'M4.5 17.5l4.6-4.6 3.4 3.4 2.6-2.6 4.4 4.4',
                    stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linejoin': 'round',
                  }))),
                h('input', {
                  ref: fileInputRef,
                  type: 'file',
                  accept: 'image/*',
                  multiple: true,
                  style: { display: 'none' },
                  onChange: onFiles,
                }),
                h('textarea', {
                  ref: inputRef,
                  className: 'dshsc__input',
                  value: draft,
                  placeholder: t('placeholder'),
                  rows: 1,
                  disabled: threadId === '',
                  onChange: (event) => setDraft(event.target.value),
                  onKeyDown: (event) => {
                    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); }
                  },
                }),
                running
                  ? h('button', { className: 'dshsc__send dshsc__send--stop', type: 'button', onClick: stop }, t('stop'))
                  : h('button', {
                    className: 'dshsc__send',
                    type: 'button',
                    disabled: (draft.trim() === '' && images.length === 0) || threadId === '',
                    onClick: send,
                  }, t('send')),
              ),
            ),
          ),
        );
      }

      /** Settings card for the plugins list and the Plugins settings tab. */
      function SideChatSettings(props) {
        const [effort, setEffort] = useState('');
        const [efforts, setEfforts] = useState([]);
        const [model, setModel] = useState(null);
        const [busy, setBusy] = useState(false);
        const [error, setError] = useState('');
        const [hideLauncher, setHideLauncher] = useState(() => launcherHidden());

        const toggleLauncher = (next) => {
          setHideLauncher(next);
          try { window.localStorage.setItem(HIDE_LAUNCHER_KEY, next ? '1' : '0'); } catch { /* private mode */ }
          applyLauncherVisibility(next);
        };

        useEffect(() => {
          let alive = true;
          fetch('/x-side-chat/settings.json')
            .then((response) => response.json())
            .then((payload) => {
              if (!alive) return;
              if (!payload || payload.ok !== true) throw new Error((payload && payload.error) || 'нет ответа');
              const value = payload.value || {};
              setEffort(typeof value.reasoningEffort === 'string' ? value.reasoningEffort : '');
              setEfforts(Array.isArray(value.efforts) ? value.efforts : []);
              setModel(value.model || null);
            })
            .catch((thrown) => {
              if (alive) setError((thrown && thrown.message) || String(thrown));
            });
          return () => { alive = false; };
        }, []);

        const choose = async (id) => {
          if (busy || id === effort) return;
          setBusy(true);
          setError('');
          try {
            const response = await fetch('/x-side-chat/settings', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ reasoningEffort: id }),
            });
            const payload = await response.json().catch(() => null);
            if (!payload || payload.ok !== true) throw new Error((payload && payload.error) || ('HTTP ' + response.status));
            setEffort(id);
          } catch (thrown) {
            setError((thrown && thrown.message) || String(thrown));
          } finally {
            setBusy(false);
          }
        };

        const options = efforts.length > 0
          ? efforts
          : [{ id: 'off', name: 'Off' }, { id: 'low', name: 'Low' }, { id: 'high', name: 'High' }, { id: 'max', name: 'Max' }];
        const optionLabel = (option) => {
          const key = 'effort.' + option.id;
          const known = t(key);
          if (known !== key) return known;
          return option.name ? option.name + ' (' + option.id + ')' : option.id;
        };

        // The bundle page renders this entry twice: a one-line summary under the
        // description, and the full form on its own page.
        if (props && props.view === 'summary') {
          const current = options.find((option) => option.id === effort);
          return h('div', { className: 'dshsc-set__hint', 'data-testid': 'dsh-side-chat-summary' },
            t('effortLabel') + ': ' + (current ? optionLabel(current) : (effort || '—')));
        }

        return h('section', { className: 'dshsc-set', 'data-testid': 'dsh-side-chat-settings' },
          h('div', null,
            h('strong', { style: { fontSize: 16 } }, t('settingsTitle')),
            h('p', { className: 'dshsc-set__desc' }, t('settingsAbout')),
          ),
          error !== '' ? h('div', { className: 'dshsc-set__err' }, error) : null,
          effort === '' && error === '' ? h('div', { className: 'dshsc-set__hint' }, t('effortLoading')) : null,
          h('div', { className: 'dshsc-set__row' },
            h('label', { className: 'dshsc-set__label', htmlFor: 'dshsc-effort' }, t('effortLabel')),
            h('div', { className: 'dshsc-set__field' },
              h('select', {
                id: 'dshsc-effort',
                className: 'dshsc-set__select',
                value: effort,
                disabled: busy || effort === '',
                onChange: (event) => choose(event.target.value),
              }, options.map((option) => h('option', { key: option.id, value: option.id }, optionLabel(option)))),
              busy ? h('span', { className: 'dshsc-set__hint' }, t('effortSaving')) : null,
            ),
            h('div', { className: 'dshsc-set__hint' }, t('effortHint')),
          ),
          model ? h('div', { className: 'dshsc-set__hint' }, t('effortModel') + ': ' + model.provider + ' / ' + model.model) : null,
          h('div', { className: 'dshsc-set__row' },
            h('label', { className: 'dshsc-set__check' },
              h('input', {
                type: 'checkbox',
                checked: hideLauncher,
                onChange: (event) => toggleLauncher(event.target.checked),
              }),
              h('span', null, t('hideLauncher')),
            ),
            h('div', { className: 'dshsc-set__hint' }, t('hideLauncherHint')),
          ),
        );
      }

      function OpenSideChatButton() {        return h('button', {
          className: 'dshsc__open',
          type: 'button',
          title: t('open'),
          'aria-label': t('open'),
          onClick: () => {
            try { ctx.sidebarRight.openTab(TAB_KIND); }
            catch (error) { console.error('[side-chat] openTab failed', error); }
          },
        }, h('svg', {
          viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', 'aria-hidden': true,
        }, h('path', {
          d: 'M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H10l-4.4 3.3A.6.6 0 0 1 4.6 18.8V6.5Z',
          stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linejoin': 'round',
        })));
      }

      try {
        ctx.effect(() => ctx.sidebarRightTabs.register({
          id: TAB_ID,
          kind: TAB_KIND,
          title: () => t('tabTitle'),
          guide: [{
            id: 'side-chat',
            title: () => t('tabTitle'),
            description: () => 'Отдельный тред рядом с рабочей сессией',
          }],
        }), 'side-chat: tab type');
      } catch (error) {
        console.error('[side-chat] tab type registration failed', error);
      }

      try {
        ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
          name: 'sidebar.right.pane.tab',
          key: TAB_ID,
        }, SideChatBody));
      } catch (error) {
        console.error('[side-chat] tab body registration failed', error);
      }

      for (const slot of ['plugins.bundle.config', 'settings.plugins.tab', 'settings.plugin.item']) {
        try {
          ctx.slots.inject(slot, () => ctx.slots.register({
            name: slot,
            key: 'dsh-side-chat',
            id: 'side-chat',
            order: 80,
            label: () => t('settingsTitle'),
          }, SideChatSettings));
        } catch (error) {
          console.error('[side-chat] settings slot failed: ' + slot, error);
        }
      }

      try {
        ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
          name: 'conversation.session.header.utilities',
          id: 'side-chat-open',
          order: 40,
          label: () => t('open'),
        }, OpenSideChatButton));
      } catch (error) {
        console.error('[side-chat] header button registration failed', error);
      }
    }

    return {
      inject: ['slots', 'locale', 'sidebarRight', 'sidebarRightTabs'],
      apply,
    };
  },
});
