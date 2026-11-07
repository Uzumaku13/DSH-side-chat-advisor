# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to [Semantic Versioning](https://semver.org/).

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
