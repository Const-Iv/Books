# Ideal Books Toolkit Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Закрепить обновленный TRIZ unified master как эталонный формат для каждого single-book и multi-book Books toolkit.

**Architecture:** Канонический контракт живет в `src/books/toolkit/toolkit-contract.mjs`, чтобы будущий product runtime and prompts могли ссылаться на один источник. Governance mirrors (`.memory-bank/*`, `AGENTS.md`, `CODEX_MEMORY.md`, `README.md`, `.cursorrules`, `CLAUDE.md`) описывают тот же контракт человеческим языком. `research/triz/agent-prompt-v2.md` получает route-based TRIZ prompt, совместимый с master toolkit.

**Tech Stack:** Node.js ESM, Node test runner, Markdown governance files.

---

## Charter anchor

Изменение усиливает миссию Books: книга превращается в применимый русскоязычный toolkit, а не в summary. JTBD поддержан тем, что пользователь получает один файл, который работает и как быстрый route selector, и как глубокий справочник.

## Acceptance criteria

- [ ] Каждый future single-book toolkit строится по master-format: usage layer, `Battle route`, `Training route`, `Быстрая карта`, `Tool selector`, action cards, deep reference/body, coverage/source notes, limitations, anti-patterns, scenarios, cheatsheet, glossary, topic index.
- [ ] Multi-book/series toolkit не теряет глубину: synthesis идет напрямую из локальных structured Markdown source copies and originals, а standalone toolkit'ы используются как control/coverage artifacts, not as depth-limiting summaries.
- [ ] Multi-book/series toolkit сохраняет staged sequence: common theme, source layers, direct-book evidence, standalone coverage check, dedupe, practical sequence, source traceability.
- [ ] `src/books/toolkit/toolkit-contract.mjs` экспортирует deterministic contract for prompts and QA.
- [ ] Tests fail before implementation and pass after implementation.
- [ ] Governance mirrors and TRIZ prompt do not contradict the new contract.

## Tasks

- [ ] Add failing unit tests for ideal toolkit contract.
- [ ] Implement `src/books/toolkit/toolkit-contract.mjs`.
- [ ] Update Product Charter and project context to make master-format the canonical Books output contract.
- [ ] Update agent-facing governance mirrors and README.
- [ ] Update `research/triz/agent-prompt-v2.md` to use route selection and verification.
- [ ] Run structural contract test, lint and test suite.
