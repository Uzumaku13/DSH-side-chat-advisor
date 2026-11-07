# Contributing

Thanks for taking a look. This is a small plugin, and small contributions are welcome —
a bug report with a log line is as useful as a patch.

## What this project is

A DeepSeek Harness bundle with two halves:

| Half | File | Runs in | Does |
|---|---|---|---|
| Host | `index.js` | the DSH host process | creates threads, applies the tool mask, stores settings, exposes JSON routes, transcribes voice |
| Client | `client.js` | the browser page | registers slots, renders the panel and the settings card, captures the microphone |

The agent preset lives in the same `cordis.patch.yml`, so installing the bundle installs
both rows.

## Local development

```bash
git clone https://github.com/Uzumaku13/DSH-side-chat-advisor.git
```

Install the directory as a bundle from a DSH session:

```
plugin_manager
  action: install_bundle
  target: /absolute/path/to/the/clone
```

Editing `index.js` requires a host reload: toggle the plugin off and on in
**Settings → Plugins** (or restart DSH). Editing `client.js` requires the same toggle
**and** a page refresh — the client half is a browser module.

Node syntax check before committing:

```bash
node --check index.js && node --check client.js
```

## Ground rules

- **Plain JavaScript, no build step, no dependencies.** The host and client halves are
  loaded as-is. A bundler would make the plugin harder to audit and to patch in place.
- **The host owns thread creation.** The right column remounts the tab body, so anything
  created from the client must be a page-level singleton; a per-component flag abandons
  the request and mints a duplicate session on every remount.
- **HTTP routes are the API.** Every action the panel performs must also work from
  `curl`, and the route table in the README must stay accurate.
- **The thread stays read-only.** The preset ships reading tools, and the host applies an
  allow-list mask on every `agent/created`. Do not widen the mask without a very good
  reason; the guarantee is the product.
- **Do not hide another plugin's UI by default.** The one exception here is a toggle that
  is off unless the user asks for it.
- **No personal paths or names** in code or docs. Settings live under `$DSH_HOME`.

## Commits

Conventional prefixes, imperative mood, one logical change per commit:

```
feat: ...   fix: ...   docs: ...   chore: ...
```

Describe *why* in the body when the change is not obvious.

## Testing a change

There is no test suite; the routes are the test surface. With the plugin installed:

```bash
curl -s http://127.0.0.1:<port>/x-side-chat/status.json
curl -s http://127.0.0.1:<port>/x-side-chat/settings.json
curl -s http://127.0.0.1:<port>/x-side-chat/voice.json

curl -s -X POST http://127.0.0.1:<port>/x-side-chat/thread \
  -H 'content-type: application/json' -d '{"workingSessionId":"<a real session id>"}'
```

A healthy thread creation returns `masked: true` with a six-tool `allow` list, the
inherited `cwd` and the configured reasoning effort. The port is the one DSH prints on
start and shows in the runtime context.

Please check these before opening a PR:

- [ ] `node --check` passes for both halves
- [ ] a new thread is created and answers
- [ ] `GET /x-side-chat/models.json` still reports the *previous* deployment default
      effort (the restore step after `selectModel` is easy to break)
- [ ] the transcript shows no injected context and no reasoning text
- [ ] voice still transcribes (if you touched audio)

## Bug reports

Include:

1. DSH version and platform;
2. what you expected and what happened;
3. host log lines containing `[side-chat]`, if any;
4. the output of `GET /x-side-chat/settings.json` and `GET /x-side-chat/status.json`
   (they contain no private text — only ids and settings).

Use the issue template; it asks for exactly this.

## License

By contributing you agree that your contribution is licensed under the MIT license,
as described in [LICENSE](LICENSE).
