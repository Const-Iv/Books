# Настольная книга project-менеджера - source manifest

## Что хранится в Git

- `Настольная книга project-менеджера - Владимир Завертайлов - toolkit.md` - единственный shareable practical toolkit v2 на русском языке по книге Владимира Завертайлова: routes, action cards, micro-practice coverage, deep reference, scenarios, cheatsheet, glossary and topic index.
- Этот manifest - навигация по локальному источнику, structured Markdown copy, extraction metadata и ограничениям.

## Что не хранится в Git

- Полный EPUB-оригинал не коммитится.
- Локальный original и same-basename structured Markdown source copy хранятся в ignored runtime:
  - `runtime/books/Project Management - Управление проектами/zavertaylov-nastolnaya-kniga-project-menedzhera/Владимир Завертайлов - Настольная книга project-менеджера.epub`
  - `runtime/books/Project Management - Управление проектами/zavertaylov-nastolnaya-kniga-project-menedzhera/Владимир Завертайлов - Настольная книга project-менеджера.md`
- Extraction metadata:
  - `runtime/books/Project Management - Управление проектами/zavertaylov-nastolnaya-kniga-project-menedzhera/extraction-report.json`
  - `runtime/books/Project Management - Управление проектами/zavertaylov-nastolnaya-kniga-project-menedzhera/spine-index.json`
  - `runtime/books/Project Management - Управление проектами/zavertaylov-nastolnaya-kniga-project-menedzhera/tool-candidate-inventory.md`

## Почему так

Books должен помогать делиться применимым toolkit'ом, но не превращать репозиторий в хранилище полного текста книги. Tracked artifact содержит маршруты применения, action cards, tool selector, micro-practice coverage, чек-листы, anti-patterns, сценарии, cheatsheet, glossary и topic index. Полный источник нужен локально для проверки спорных мест и future agent search.

## Проверка source bundle

| Поле | Значение |
|---|---|
| Нормализованный источник | `Владимир Завертайлов - Настольная книга project-менеджера.epub` |
| Structured Markdown source copy | `Владимир Завертайлов - Настольная книга project-менеджера.md` |
| Метод извлечения | `stdlib zipfile + ElementTree OPF/NCX + HTMLParser markdown extraction` |
| Объем | 156 spine items, примерно 148999 слов |
| Original retention | `сохранен`, потому что исходник EPUB |
| SHA-256 EPUB | `b7835454c87a82ce6f31e531c69df8a9a110f6399ac7c3e518d466543ecf4450` |
| Статус | source normalized; toolkit generated |

## Использование источника

- `spine 003-013` - делегирование, research-задачи, контрольные точки, письменная коммуникация.
- `spine 014-020` - требовательность, власть, эксплуатация, форсаж, критика.
- `spine 021-026` - Scrum, Planning Poker, демонстрация, фиксация, метод красной рамки.
- `spine 027-050` - требования, Lean Canvas, персоны, JTBD, MVP, scoring, roadmap/backlog.
- `spine 051-065` - оценка, декомпозиция, вилочная смета, Gantt, PERT, большое ТЗ.
- `spine 066-093` - дизайн-процесс, презентации, UI-kit, UX, обучение дизайнеров.
- `spine 094-115` - команда, ритуалы, 1:1, обратная связь, выгорание, Niko-Niko, дайджесты, review.
- `spine 116-120` - этюды для тренировки.
- `spine 121-129` - заказная/product команда, передача проекта, техподдержка.
- `spine 130-134` - интеграции, рабочая группа, brief, protocol, ввод в эксплуатацию.
- `spine 135-140` - муда, риски, ретроспективы.
- `spine 141-154` - домены, cookies, frameworks, hosting, monitoring, SSL, access, performance, VCS, adaptive, integrations.

## Ограничения

- EPUB не содержит физических страниц; ссылки используют spine marker и heading.
- Inline formatting упрощен при извлечении; структура заголовков и смысловой текст сохранены для анализа.
- Toolkit намеренно не содержит длинных цитат и не заменяет оригинал.
