# Context Hygiene

This file stores reusable context, language, and token-hygiene rules for this project. Product identity remains in `.memory-bank/product-charter.md`.

## Shared Starter Baseline Rules — synced 2026-05-18

- `starter.context.concise-responses`: Ответы агента должны быть короткими и по делу; подробности добавляются только когда они нужны для решения, проверки, owner decision или safety.
- `starter.agent.read-only-subagent-summary`: Для больших read-only анализов, ревью и независимых проверок можно использовать субагентов, когда текущая платформа и рабочий контракт это разрешают. Главный чат получает structured summary: findings, risks, checked files/sources, recommended next step. Субагенты не принимают product decisions за owner'а и не мутируют shared files без отдельного write scope.
- `starter.context.markdown-first-inputs`: Входные текстовые материалы по умолчанию переводятся или сохраняются как Markdown/plain text, если задача не про layout fidelity. PDF, DOCX, HTML и другие шумные форматы используются напрямую только когда формат, layout или визуальная fidelity являются частью результата.

## Shared Starter Baseline Rules — synced 2026-07-27

- `starter.skills.repeated-workflow-skill-proposal`: Если сложный workflow повторился 2-3 похожих повторения, агент должен предложить создать или обновить repo-owned skill. Task-level предложение оформляется через связь с charter, цель, одну owner-language Job Story и критерии приемки без отдельных JTBD/User Story. Skill не создаётся автоматически без owner approval.
- `starter.context.on-demand-tools`: Skills, MCP servers, connectors, browser tools и extended reasoning используются on demand. Не запрещать browser/Playwright там, где он нужен для UI verification, browser oracle или smoke-проверки реального интерфейса.
- `starter.docs.owner-facing-readable-markdown`: Owner-facing документы, которые должны читаться или переиспользоваться позже, включая планы, specs, QA-сводки, статусы, отчёты и operator-facing docs, оформляются как читаемый Markdown: ясные заголовки, короткий `TL;DR` где он помогает, **жирные** смысловые метки для ключевых решений, таблицы для сопоставлений, чекбоксы для статусов, ссылки на файлы или артефакты и Mermaid-диаграммы только когда они реально проясняют поток или архитектуру. Короткие ответы в чате не нужно искусственно утяжелять форматированием, но длинные owner-facing документы нельзя отдавать как плоский неструктурированный текст.
