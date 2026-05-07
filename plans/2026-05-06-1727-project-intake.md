Название проекта: Books (product charter approved 2026-05-07)
Дата создания intake: 2026-05-06 17:27

Статус intake (отметить один пункт):
- [ ] Не начато
- [ ] В процессе
- [ ] Заблокировано
- [x] Согласовано

Правило:
- Новый проект не переходит к feature/refactor/behavior-change реализации, пока все обязательные пункты ниже не заполнены и не согласованы owner'ом.
- Placeholder-ответы, `TBD`, “заполним потом” и несогласованные допущения считаются blocker.
- Пока проект находится на этапе проверки гипотезы, нельзя считать утверждёнными архитектуру, технологии, способ запуска, коммерческую модель, зоны ответственности и важные продуктовые возможности. Эти решения становятся правилами проекта только после явного согласования в Project Intake, product charter или roadmap.
- Миссию сначала формулирует owner. После согласования миссии Codex предлагает формулировки следующих пунктов intake на основе уже согласованных ответов, а owner подтверждает или корректирует каждую формулировку.

Product Charter:

Миссия:
- Отвечает на вопросы: зачем проект существует; для кого работает; какую проблему решает; какую пользу создаёт.
- Формула: `Мы помогаем [кому] получать [какой результат] через [что / как]`.
- Ответ: Мы помогаем любому пользователю превращать книгу в применимый рабочий toolkit на русском языке через структурное извлечение моделей, принципов, техник, anti-patterns, сценариев применения и быстрых шпаргалок вместо обычного пересказа.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-07

Видение:
- Отвечает на вопросы: куда проект идёт; каким хочет стать; какой рынок, привычку или способ работы хочет изменить; как выглядит успех через 3-10 лет.
- Формула: `Мы видим будущее, в котором [желаемое состояние мира / рынка], а наш проект — [роль в этом будущем]`.
- Ответ: Мы видим будущее, в котором книга после чтения или загрузки не остаётся разовым текстом, а становится рабочим инструментом для решений, действий и обучения; Books — продукт, который превращает содержание книги в навигационный практический toolkit, готовый к повторному применению.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-07

Цель проекта:
- Ответ: Создать local-first прототип, который берёт официально предоставленную пользователем книгу или фрагмент книги и создаёт русскоязычный практический toolkit: карта книги, framework'и автора, принципы, техники, anti-patterns, практические выводы по главам, glossary, patterns / techniques, cheatsheet и topic index.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-07

Целевая аудитория:
- Ответ: Люди, которые читают книги ради применения, а не ради пересказа: занятые специалисты, предприниматели, студенты, самообучающиеся читатели и все, кто использует книги как источник решений, идей, действий и рабочих моделей.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-07

JTBD:
- Ответ: Когда у меня есть книга и я хочу применить её идеи в жизни, работе или обучении, я хочу превратить её в понятный toolkit с моделями, принципами, техниками, anti-patterns, сценариями применения и шпаргалками, чтобы быстро находить нужное и сразу действовать.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-07

Статус гипотезы и утверждения решений:
- Проект проверяет гипотезу или уже подтверждён: Проект находится на этапе проверки гипотезы: нужно подтвердить, что пользователям действительно нужен именно применимый toolkit из книг, а не краткий пересказ, и что такой формат помогает применять содержание сразу.
- Какие решения уже явно утверждены: Миссия, видение, цель проекта, целевая аудитория, JTBD, главный принцип `extract structure, not summaries`, первый local-first контур и output первой версии на русском.
- Какие решения ещё нельзя считать утверждёнными: финальная логика toolkit, eval spec, способ получения содержания книг, архитектура, стек, способ запуска, коммерческая модель, роли пользователей, auth, payments, analytics, async jobs implementation, API и post-publish действия.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-07

Продуктовые ограничения:
- Что нельзя сломать: Практическую применимость toolkit, понятность для обычного пользователя, доверие к содержанию, разделение идей книги и рекомендаций продукта, прозрачность источника и принцип “структура применения вместо summary”.
- Что вне scope: Полная замена чтения книги, дословное воспроизведение больших фрагментов книги, академический литературный анализ, универсальная экспертная консультация по всем темам книги, публичный веб-продукт, аккаунты, оплата, аналитика, deploy и product-specific stack/provider решения до отдельного согласования.
- Регуляторные / бизнес-рамки: Входные книги предоставляет пользователь из официально скачанных экземпляров; toolkit нельзя выдавать за официальный текст автора или издателя; не публиковать и не хранить полный текст книги как продуктовый output без отдельного согласованного решения; явно отделять пользовательскую пользу от юридических, медицинских, финансовых и других профессиональных советов там, где это применимо.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-07

Сценарии использования:
- Основной сценарий: Пользователь передаёт официально скачанную книгу или фрагмент и получает toolkit: карту книги, модели, принципы, техники, anti-patterns, сценарии применения, шпаргалки и topic index.
- Adjacent scenarios: Пользователь сравнивает несколько книг по одной теме; возвращается к ранее созданному toolkit; просит сделать toolkit под конкретную задачу, например работа, обучение, привычки или личная эффективность.
- Нежелательные сценарии: Пользователь пытается получить полный пересказ вместо toolkit, заменить чтение книги дословным воспроизведением, получить профессиональный совет без проверки специалистом или загрузить материалы, происхождение которых не может подтвердить.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-07

Метрики успеха:
- Пользовательская метрика: Пользователь после получения toolkit может назвать минимум одно конкретное действие, которое готов применить, и считает результат полезным для своей задачи.
- Операционная метрика: Стабильно создавать один toolkit по официально переданной пользователем книге с понятной структурой, traceable input source и без ручной переделки каждого результата.
- QA / reliability метрика: Для проверочных книг результат проходит deterministic QA: обязательные секции toolkit заполнены, нет больших дословных фрагментов, действия отделены от идей книги, output на русском, а ограничения и предупреждения применены там, где нужны.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-07

Governance / Process:

Source-of-truth файлы:
- Product charter: `.memory-bank/product-charter.md` — миссия, видение, цель, аудитория, JTBD и продуктовые рамки Books.
- Project context: `.memory-bank/project-context.md` — текущий контекст проекта, утверждённые решения и рабочие команды.
- Architecture map: `.memory-bank/architecture-map.md` — границы продукта, модулей, adapters/profiles и ключевые риски архитектуры.
- Code rules: `.memory-bank/code-rules.md` и `AGENTS.md` — обязательные правила разработки, безопасности, intake и agent behavior.
- QA playbook: `.memory-bank/qa-playbook.md` — deterministic проверки, acceptance evidence и правила качества выжимек.
- Operational docs: `CODEX_MEMORY.md`, `Docs/qa-implementation-log.md`, `Docs/triz-usage-log.md` и task history — краткие рабочие заметки, QA evidence и lessons.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-06

Core / adapters / profiles boundary:
- Что остаётся core baseline: Starter governance, Project Intake Gate, task/worktree conveyor, deterministic QA, memory-bank rules, reusable skills and safe source-of-truth process.
- Что добавляется через adapters: Импорт/чтение книг из выбранных форматов, извлечение текста, AI/model provider, хранение файлов и результатов, UI/API, auth, payments, analytics, background jobs and deploy/release integrations.
- Что является product-specific profile: Books-specific product charter, структура toolkit, правила качества toolkit, пользовательские сценарии, ограничения по книгам, метрики полезности и решения о коммерческой модели.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-06

Stack / runtime choices:
- Runtime: Product runtime для Books v1 — local CLI contour on Node/npm orchestration with optional Python extraction adapter. Node/npm остаётся orchestration, governance and QA baseline; Python используется только behind extraction adapter boundary после feature-level echo-test.
- Package manager: `npm` для Node orchestration and QA baseline. Python dependencies для extraction adapter фиксируются отдельно внутри feature plan / echo-test и не становятся starter core defaults.
- Test framework: built-in Node test runner для orchestration, contracts and process QA. Python extraction adapter получает targeted deterministic checks в feature plan before/after implementation.
- Build command: `npm run build` для baseline. Product CLI build/release stays local-first and follows existing build gate unless a future feature explicitly adds a separate product build command.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-07

Echo-testing / root capability check:
- Есть ли неизвестная корневая технология, интеграция, provider, runtime, agent surface, bot/channel, worker или внешний API: [x] Да [ ] Нет [ ] Заблокировано
- Что именно неизвестно: Extraction adapter behavior на реальных PDF/EPUB, AI/model provider, future UI/API and any multi-user storage. Product runtime contour выбран: local CLI on Node/npm orchestration with optional Python extraction adapter.
- Minimal echo-test scenario: Для первой extraction feature до implementation выполнить isolated proof: local PDF/EPUB или synthetic book-like input -> extraction adapter -> extracted text + metadata under ignored `runtime/books/` -> clear decision `proceed | blocked | narrow spike | choose alternative`. Для AI/model provider нужен отдельный owner-approved adapter echo-test.
- Входной сигнал / test input: Короткий synthetic book-like PDF/EPUB или небольшой официально предоставленный фрагмент без production user data и без секретов.
- Ожидаемый minimal observable result: Проверяемый result: extracted text path, metadata with source/format/method/pages-or-spine/words/tokens/detected chapters/ToC flag, and user-readable proceed/blocker decision.
- Security boundary: Не использовать real secrets, production user data, небезопасные bypass, полный текст книги как публичный output или материалы с неподтверждённым происхождением.
- Evidence path / где фиксируется результат: Feature plan for first extraction implementation and `Docs/qa-implementation-log.md`.
- Фактический результат: Bootstrap decision approved; runtime contour selected. Product echo-test is required at first extraction feature, not during this intake closure.
- Найденные ограничения: AI/model provider, public UI/API, multi-user storage and deploy remain future adapter decisions.
- Решение: [ ] Proceed [ ] Blocked [x] Narrow spike
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-07

QA / release choices:
- Primary deterministic gate: Для bootstrap и governance использовать `npm run qa:agent`.
- Smoke / e2e scope: Для bootstrap использовать process-level проверки стартера. Для Books product work использовать `Books Product QA` из `.memory-bank/qa-playbook.md` and feature-level eval evidence.
- Security gate: Не использовать secrets и production user data в тестах; проверять, что output не содержит больших дословных фрагментов книги и не выдаётся за официальный текст автора или издателя.
- Release path: Пока local-first, без deploy.
- Preview / deploy adapter: Не применимо для v1 local CLI; deploy не утверждён.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-07

Agent / eval choices:
- Agent surfaces: Project Intake assistant behavior можно оценивать сейчас; generation of book-to-toolkit output, quality checks for “structure not summary” и future UI/API assistant flows зависят от будущей owner-approved логики toolkit.
- Хороший ответ: Для toolkit generation хороший ответ создаёт применимый русский toolkit, а не summary: обязательные материалы первой версии заполнены, идеи ранжированы по применимости/важности/повторяемости/конкретности/отличимости, есть navigation layer и scope & limits.
- Провал: Подменить toolkit общим пересказом, пропустить обязательные секции, потерять точные framework names, выдать большие raw excerpts, игнорировать плохое extraction quality или начать product release без eval-набора.
- Критичные edge cases: Russian practical nonfiction, non-Russian practical nonfiction with Russian output, technical input, bad extraction, full-retelling request, purpose weighting, analyze-only mode; fiction остаётся special/manual mode.
- Regression examples / golden prompts: Для bootstrap зафиксированы в `plans/2026-05-06-1749-bootstrap-intake-suggestions.md`; minimum eval set для toolkit generation зафиксирован в `plans/2026-05-06-1903-book-extraction-logic.md`.
- Minimum pass threshold: Для bootstrap — owner-authored миссия, предложенный следующий пункт и явный approval gate. Для toolkit generation — все 7 minimum eval cases должны пройти без нарушения charter; каждый результат должен быть русским toolkit, а не summary.
- Кто владеет eval-набором: Owner вместе с Codex; owner сначала описывает логику toolkit, затем Codex предлагает eval-набор на approval.
- Какие evals обязательны перед release: До release product generation обязательно утвердить eval spec по логике toolkit и проверить минимум 3-5 test inputs; до этого release остаётся только local governance baseline.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-07

Memory / rules ownership:
- Кто может менять charter: Owner напрямую или Codex после явного owner approval.
- Кто может менять governance rules: Codex в task worktree, если изменение поддерживает charter, синхронизировано в canonical sources и проходит deterministic QA.
- Как фиксируются operational lessons: Короткие lessons фиксируются в `CODEX_MEMORY.md` и QA/TRIZ logs; стабильные правила переносятся в `.memory-bank/*` и `AGENTS.md`.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-06

Capability decisions (заполнять, если применимо):

Правило:
- Каждый блок ниже сначала получает статус `применимо` или `не применимо`.
- Если блок применим, owner согласует ответы до первой feature/refactor/behavior-change реализации в этой capability area.
- Нельзя переносить provider-specific или stack-specific рецепт в core baseline без отдельного adapter/profile boundary.

Auth / user identity:
- Статус применимости: [ ] Применимо [x] Не применимо [ ] Заблокировано
- Кто входит в продукт и зачем: На этапе bootstrap не утверждаем пользовательские аккаунты; первый product scope считается single-owner/local до отдельного решения.
- Provider / identity source: Не выбран.
- Token/session storage strategy: Не применимо до появления auth.
- Refresh / rotation / revocation policy: Не применимо до появления auth.
- Logout / account disconnect behavior: Не применимо до появления auth.
- CSRF / OAuth state / replay protection: Не применимо до появления auth.
- Sensitive data boundaries: До появления auth нельзя хранить multi-user personal data, user libraries or account-linked book history как утверждённое поведение.
- Required QA scenarios: Если auth станет применимым, до реализации нужны отдельные QA scenarios для login/logout, session expiry, revocation, CSRF/OAuth state and access boundaries.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-06

Payments / billing:
- Статус применимости: [ ] Применимо [x] Не применимо [ ] Заблокировано
- Что пользователь покупает: Не утверждено; на этапе bootstrap коммерческая модель не выбрана.
- Currency / market assumptions: Не применимо до выбора коммерческой модели.
- Provider selection rule: Не выбран; payment provider нельзя добавлять без отдельного owner-approved решения.
- Webhook verification strategy: Не применимо до появления payments.
- Idempotency key / transaction id policy: Не применимо до появления payments.
- Refund / cancellation behavior: Не применимо до появления payments.
- Audit trail: Не применимо до появления payments.
- Required QA scenarios: Если payments станут применимыми, до реализации нужны QA scenarios для checkout, webhook verification, idempotency, refund/cancellation and audit trail.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-06

Credits / limits:
- Статус применимости: [ ] Применимо [x] Не применимо [ ] Заблокировано
- Что измеряется и почему: Не утверждено; на этапе bootstrap нет credits, paid quotas, usage limits или user balance.
- Balance source of truth: Не применимо до появления credits/limits.
- Precision / rounding policy: Не применимо до появления credits/limits.
- Pre-execution check: Не применимо до появления credits/limits.
- Spend / refund / correction policy: Не применимо до появления credits/limits.
- Race condition protection: Не применимо до появления credits/limits.
- User-visible balance / history: Не применимо до появления credits/limits.
- Required QA scenarios: Если credits/limits станут применимыми, до реализации нужны QA scenarios для balance source of truth, pre-execution checks, spend/refund/correction, race protection and user-visible history.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-06

Analytics / consent:
- Статус применимости: [ ] Применимо [x] Не применимо [ ] Заблокировано
- Какие решения нужно измерять: Не утверждено; на этапе bootstrap analytics не включаем.
- Event catalog owner: Не применимо до появления analytics.
- Consent / cookie policy: Не применимо до появления analytics.
- Provider selection rule: Не выбран; analytics provider нельзя добавлять без отдельного owner-approved решения.
- Failure isolation policy: Не применимо до появления analytics.
- Data retention / privacy boundaries: Не применимо до появления analytics; до отдельного решения не собирать usage events, personal analytics or consent-bound telemetry.
- Reject / accept / withdrawal scenarios: Не применимо до появления analytics.
- Required QA scenarios: Если analytics станут применимыми, до реализации нужны QA scenarios для consent, reject/accept/withdrawal, failure isolation and data retention boundaries.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-06

i18n / localization:
- Статус применимости: [x] Применимо [ ] Не применимо [ ] Заблокировано
- Supported locales: Входные книги могут быть на разных языках; список поддерживаемых входных языков будет зависеть от выбранного product stack/provider. Выходной язык первой версии всегда русский.
- Default locale / fallback rule: Default output locale — русский. Если язык входной книги или качество извлечения не позволяют сделать надёжный русский toolkit, продукт должен остановиться и показать понятный blocker вместо частичного результата.
- Locale selection strategy: Язык входной книги определяется из содержимого или metadata книги; пользователь не выбирает язык output в первой версии.
- Translation source of truth: Source of truth — содержимое официально предоставленной пользователем книги; русский toolkit является производным продуктовым output, а не официальным переводом книги.
- Metadata / SEO / routing policy: Не утверждено до появления публичного UI/SEO; для bootstrap не применимо.
- Translation completeness check: Проверять, что итоговый toolkit написан на русском, ключевые термины не потеряны, а нужные оригинальные названия/термины сохранены с понятным объяснением.
- Required QA scenarios: Перед реализацией нужны QA scenarios для книги на русском, книги не на русском, mixed-language фрагмента, плохого извлечения текста и проверки, что output остаётся на русском без больших дословных фрагментов.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-06

Async jobs / workers:
- Статус применимости: [x] Применимо [ ] Не применимо [ ] Заблокировано
- Какие операции долгие или отложенные: Извлечение текста из книги, языковая обработка, генерация toolkit, проверка качества и сохранение результата могут быть долгими.
- Job lifecycle statuses: Для future implementation нужны статусы минимум `queued`, `processing`, `completed`, `failed`, `cancelled`.
- Retry / backoff policy: Не утверждено до выбора product runtime/provider; retry нельзя добавлять без idempotency и защиты от дублей.
- Cancellation policy: Пользователь или owner должен иметь способ отменить долгую обработку после появления UI/API; до выбора stack не утверждено.
- Idempotency / duplicate handling: Один и тот же input/source не должен случайно создавать несколько списаний, результатов или конфликтующих jobs; конкретная политика будет утверждена перед реализацией.
- Concurrency / locking choice: Не утверждено до выбора product runtime/storage.
- User-visible progress: Future product должен показывать понятный статус обработки, если операция не мгновенная.
- Failure alerting: Ошибки извлечения, языка, provider или качества должны сохраняться как понятный failure reason без раскрытия secrets.
- Required QA scenarios: Перед реализацией нужны QA scenarios для successful job, failed extraction, provider failure, cancellation, retry/idempotency and duplicate input.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-06

API documentation:
- Статус применимости: [ ] Применимо [x] Не применимо [ ] Заблокировано
- API audience: Не утверждено; на этапе bootstrap публичный или внутренний API не выбран.
- Documentation source of truth: Не применимо до появления API.
- Human-readable docs path: Не применимо до появления API.
- Agent-readable docs path: Не применимо до появления API.
- Freshness / generation policy: Не применимо до появления API.
- Public / private boundary: Не применимо до появления API.
- Required QA scenarios: Если API станет применимым, до реализации нужны QA scenarios для docs freshness, public/private boundary, request/response examples and agent-readable contract.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-06

Service layout:
- Статус применимости: [x] Применимо [ ] Не применимо [ ] Заблокировано
- Product code layout: Future Books product source lives under `src/books/`. Approved sub-boundaries: `src/books/cli/`, `src/books/extraction/`, `src/books/toolkit/`.
- Service boundaries: `cli` orchestrates local user flow; `extraction` validates PDF/EPUB and produces extracted text + metadata; `toolkit` owns schema, ranking rules, artifact contracts, quality checks and eval fixtures. AI/model provider remains future adapter-specific boundary.
- Shared package boundaries: Shared reusable process code stays in `scripts/` / `scripts/lib/`; product-specific Books logic must not be added to starter governance scripts unless it is a generic process helper.
- Worker / cron / background process boundaries: No worker/cron in v1 local CLI. Long operations can expose local statuses in feature work, but async infrastructure is not approved.
- Governance-root files that must stay at repo root: `AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`, `README.md`, `plans/`, `skills/`, `scripts/`, `tests/` and package governance files remain at repo root unless owner approves a migration.
- Runtime/local artifact boundary: Generated local Books artifacts live under ignored `runtime/books/` and are not canonical source.
- Required QA scenarios: Module boundary checks, import path checks, no hardcoded provider in product core, generated artifacts ignored under `runtime/books/`, and no product-specific logic in process governance scripts.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-07

Runtime-specific rules:
- Статус применимости: [x] Применимо [ ] Не применимо [ ] Заблокировано
- Runtime / language: Первый пользовательский контур — локальный CLI-прототип: owner передаёт книгу или фрагмент локально, а продукт создаёт русский практический toolkit без публичного UI, аккаунтов, оплаты и deploy. Runtime: Node/npm orchestration with optional Python extraction adapter.
- Dependency manager: `npm` для Node orchestration. Python dependencies are adapter-specific and approved per feature/echo-test, not globally baked into starter core.
- Type / lint expectations: Node orchestration uses existing lint/typecheck gates. Python extraction helper, if added, must have targeted deterministic checks and no silent failures.
- Runtime safety checks: В локальном прототипе нельзя использовать secrets, production user data, публично выдавать полный текст книги или сохранять входную книгу как публичный output.
- Нужны ли действия после публикации, например перезапуск локальных агентов или сервисов: Нет; первый контур — локальный прототип без deploy/publish.
- Как owner согласовал способ выполнения таких действий: Owner approved 2026-05-07 via “давай все сделаем” after recommended local CLI/runtime/service layout.
- Official docs / integration source: For provider/API work, Codex checks current official documentation before implementation. For extraction tools, feature plan records installed tools, command path and actual echo-test result.
- What must remain adapter/profile-specific: AI/model provider, public UI/API, multi-user storage, deploy/release commands, Python extraction dependencies beyond the approved boundary.
- Required QA scenarios: Перед реализацией локального прототипа нужны QA scenarios для передачи книги/фрагмента, генерации русского toolkit, ошибки извлечения, provider failure and отсутствия больших дословных фрагментов.
- Статус согласования: [ ] Ожидает owner approval [x] Согласовано [ ] Заблокировано
- Подтвердил: owner
- Дата: 2026-05-07

Перенос в canonical sources:
- [x] `.memory-bank/product-charter.md`
- [x] `.memory-bank/project-context.md`
- [x] `.memory-bank/architecture-map.md`
- [x] `.memory-bank/code-rules.md`
- [x] `.memory-bank/qa-playbook.md`
- [x] `AGENTS.md`
- [x] `CODEX_MEMORY.md`
- [x] `README.md`
- [x] Другие релевантные файлы: `.cursorrules`, `CLAUDE.md`

Итоговое подтверждение:
- [x] Все обязательные пункты заполнены
- [x] Все обязательные пункты согласованы owner'ом
- [x] Ответы перенесены в canonical sources
- [x] Baseline QA прошёл

Итоговый статус:
- [x] Project Intake согласован
- [ ] Project Intake заблокирован

Комментарии / blockers:
- Agent / eval choices для toolkit generation согласованы 2026-05-07 на основе owner-approved логики toolkit.
- Service layout согласован 2026-05-07.
- Product runtime для v1 согласован 2026-05-07: local CLI on Node/npm orchestration with optional Python extraction adapter.
- Product feature/refactor/behavior-change work может начинаться после intake только через feature-level plan, applicable echo-test and deterministic QA.
- AI/model provider, public UI/API, multi-user storage and deploy remain future adapter decisions.
- Canonical transfer утверждённого product charter выполнен 2026-05-07.
- Baseline QA после final canonical transfer выполнен 2026-05-07: `npm run qa:agent` PASS.
