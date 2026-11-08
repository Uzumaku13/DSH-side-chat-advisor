# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to [Semantic Versioning](https://semver.org/).

## [1.2.0] — 2026-11-08

### Added

- **Thread history.** The clock button in the panel header lists the threads bound to the
  current session and the free ones. A row switches the panel to that conversation; `×`
  removes it from the list.
- **Binding.** A thread created from a session is bound to it and returns when the panel is
  opened in that session again. The link icon rebinds a thread or makes it free.
- Titles from each thread's first human message, cached in the registry.
- `GET /x-side-chat/threads.json?owner=`, `POST /x-side-chat/threads`
  (`bind` / `unbind` / `forget`) and `GET /x-side-chat/eventpage.json` (support probe).

### Changed

- The registry file is now `{ version: 2, threads: [{ id, owner, title, createdAt }] }`.
  A v1 file (a bare array of ids) is read and migrated on load; `owner` starts as `null`,
  so existing conversations appear as free threads.
- The panel remembers one thread **per working session** (`localStorage` key
  `dsh.side-chat.thread.v3.<session>`), adopting the old single-thread key once.
- Opening the panel prefers this session's newest bound thread; a free thread is never
  adopted silently — it is reachable from history.

### Fixed

- Entries whose Session no longer exists are pruned when the history opens.
- A rejected `throughSeq` read no longer cancels the title fallback, so threads created
  before this release get their titles too.

## [1.1.0] — 2026-11-07

### Added

- **Chinese UI** (`zh`): panel, settings card and effort labels. The dictionary is keyed by
  the DSH locale's primary subtag, so `zh-CN` / `zh-Hans` resolve to it; languages without a
  dictionary fall back to English.
- The bundled persona now answers in the language it is addressed in (Russian, English or
  Chinese) instead of always Russian.
- A screenshot in all three READMEs.

### Changed

- `README.zh.md` added; every README starts with a language bar.

## [1.0.0] — 2026-11-07

First public release.

### Added

- Right-sidebar chat tab (`sidebar.right.pane.tab`) with its own agent session, opened
  from a conversation-header button.
- Bundled `sidechat` agent preset: persona, reading tools, web access, compaction; no
  workspace instructions, no skill catalog, no MCP, no shell.
- Read-only tool mask applied on thread creation and re-applied on every
  `agent/created`, so a resumed thread is narrowed before its first turn.
- Streaming answers, Stop button, auto-scroll that yields when you scroll up.
- Reasoning-level setting (`off / low / high / max`) read from the model catalog,
  persisted to `$DSH_HOME/side-chat/settings.json`, applied to every known thread.
  The deployment default is restored after each change so coding sessions keep their own.
- Voice input: microphone capture, resampling to 16 kHz, canonical PCM16 WAV, host
  transcription through the configured speech provider.
- Image attachments sent as prompt content parts.
- Settings card in three seats (`plugins.bundle.config`, `settings.plugins.tab`,
  `settings.plugin.item`), with a `summary` and a `page` view.
- Optional toggle hiding the `dsh-claude-move` launcher (off by default).
- JSON HTTP surface with a table of routes in the README, so every action can be driven
  without a browser.
- Documentation in English and Russian, MIT license.

### Fixed before the first release

- Thread creation is a page-level singleton: the right column remounts the tab body, and a
  per-component in-flight flag abandoned creation and minted a duplicate session each time.
- HTTP routes are registered through `ctx.inject(['webServer'])`; a one-shot lookup at apply
  time silently lost the whole surface on cold starts (404 after every app restart).
- Transcript rows filter injected context (`source.kind !== 'user'`) and take only `text`
  blocks of an answer, so runtime context and reasoning no longer leak into the chat.
- Voice sends `language: auto`; providers that declare only `auto` reject `ru`.
