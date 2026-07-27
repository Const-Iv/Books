# Нормализация Starter rules и безопасный Books finish

**Тип задачи:** process / governance / security
**Дата:** 2026-07-27
**Статус:** в процессе

## Коротко

Books получит только применимые общие правила Starter, а реальные пробелы в security, operational evidence и удалении task worktree будут закрыты исполняемыми проверками. Суть и продуктовые границы Books не меняются.

## Связь с charter проекта

- Задача сохраняет local-first Books и принцип `extract structure, not summaries` без нового provider, публичного UI, deploy или внешней записи.
- Более строгие QA и cleanup-gates защищают локальные книги, structured Markdown sources и toolkit artifacts от потери или неподтверждённого удаления.
- Product charter identity не импортируется из Starter и не редактируется.

## Цель

Устранить расхождения rule-share системно: явно зафиксировать, какие правила Books уже выполняет, добавить четыре небольших process-правила и сделать четыре заявленных safety-контракта честно проверяемыми там, где они входят в эту задачу.

## Контекст

### Как работает сейчас

- Exact outbound scan Starter от 2026-07-27 нашёл в Books 39 подтверждённых правил и 18 групп ручной проверки.
- Три группы уже покрыты более строгими Books-правилами, четыре требуют небольшого governance-дополнения, четыре связаны с исполняемыми пробелами, семь возможностей сейчас неприменимы.
- Security gate исключает dev dependencies, хотя все текущие зависимости Books относятся к dev tooling.
- Operational documents синхронизируются single-writer flow, но один из них одновременно используется как источник обязательного governance-test.
- Finish profile объявляет pre/post cleanup checks, однако текущий finish-flow их не вызывает.

### Проблема

Если ограничиться текстом, отчёт станет зелёным без реальной защиты. Это оставит три риска: зависимости фактически не проверяются, operational evidence может менять проверяемую истину после QA, а task worktree может удаляться без доказанного результата в canonical `main`.

### Где используется результат

В каждом Books task finish, в CI/security checks и в последующих rule-share scans по canonical `main`.

## Job Story

Когда я обновляю общие правила в Books и завершаю отдельную задачу, я хочу видеть только реально внедрённые проверки и безопасно сохранять локальные результаты, чтобы единый baseline не менял смысл проекта и не создавал ложного ощущения защищённости.

## Входные данные

| Источник | Что используем | Статус |
| --- | --- | --- |
| Starter scan `rule-share-2026-07-27-150944939Z.json` | 18 exact manual-review ids | подтверждено |
| Starter registry на опубликованном `main` | точные тексты и переносимые инварианты | подтверждено |
| Books product charter и memory bank | project-local границы и QA | подтверждено |
| Books finish/security/source code и tests | фактическое текущее поведение | подтверждено |

## Допущения и неизвестные данные

### Допущения

- `runtime/books` остаётся ignored local-only storage и сохраняется Books-native conflict-safe механизмом.
- Exact parallel duplicate — только два разных single-parent commit с одним parent, одинаковым непустым `name-status`, одинаковыми blobs и принятым replacement в current `main`.

### Неизвестные данные

- Нет неизвестных product decisions в текущем scope.
- Scoped knowledge resolver вынесен в следующую отдельную feature-задачу с собственным Eval; в этой задаче он честно остаётся `implementation_required`.

## Ожидаемый результат

1. Adoption map классифицирует все 18 групп с project-local evidence и без подмены product charter.
2. Mandatory security gate проверяет полный root dependency graph и блокирует `high`/`critical`.
3. Versioned governance inputs отделены от single-writer operational documents и проверяются deterministic gate.
4. Finish выполняет Books artifact preservation, dependency fingerprint, tracked equivalence и pre/post canonical-main verification до подтверждения cleanup.
5. Parallel outcomes получают fail-closed статус `exact_duplicate | different_results | not_proven`; повторный merge и cleanup при недоказанном результате запрещены.

### Definition of Done

- Targeted unit/integration/e2e checks, `qa:security`, `qa:coverage:critical` и полный `qa:agent` проходят.
- Product charter blob не меняется.
- Tracked task diff не содержит private sources, credentials, runtime books или generated QA residue.
- Task опубликован через canonical Books conveyor; cleanup не выполняется без отдельного owner choice.

## Критерии приёмки

- **AC-1.** Все 18 manual-review ids имеют один честный статус и актуальное project-local evidence/объяснение.
- **AC-2.** Обязательный dependency audit не содержит `--omit=dev` и сохраняет fail-closed threshold.
- **AC-3.** Operational documents не могут быть единственным источником обязательной governance-истины текущего commit.
- **AC-4.** Delete cleanup невозможен без passed main verification, сохранённых Books artifacts и passed project-owned pre/post checks.
- **AC-5.** Exact duplicate подтверждается только всеми переносимыми доказательствами; любой diff даёт `different_results`, отсутствие доказательств — `not_proven`.
- **AC-6.** Существующие Books toolkit, task-start, artifact preservation и no-deploy контракты не регрессируют.

## Метрика успеха

- 0 missing/blocked rule-share решений после self-check этой задачи; разрешены только явно `implementation_required` для следующей knowledge-задачи и доказанно `not_applicable` возможности.
- 100% critical checks PASS, 0 charter/privacy/destructive violations.

## План проверки

| Критерий | Способ проверки | Ожидаемое наблюдение | Evidence |
| --- | --- | --- | --- |
| AC-1 | adoption-map unit test + fresh rule-share scan | все ids уникальны, evidence актуально | test output + exact scan |
| AC-2 | security unit test + `npm run qa:security` | полный graph, high/critical fail closed | command output |
| AC-3 | governance-boundary unit/integration tests | canonical и operational sets не пересекаются | test output |
| AC-4 | finish integration/e2e scenarios | pre/post failure блокирует PASS/cleanup | task artifacts/history |
| AC-5 | duplicate unit/e2e scenarios | три статуса классифицируются детерминированно | test output |
| AC-6 | `npm run qa:agent` | фиксированный полный gate PASS | QA checkpoint |

## Eval spec

**Применимо:** да

### Хороший ответ

- Повторившийся workflow предлагает repo-owned skill, но не создаёт его без подтверждения.
- Для Books source сначала используется локальный structured Markdown/source manifest; browser не становится скрытым runtime fallback.
- Длинный owner-facing документ остаётся читаемым Markdown, а короткий ответ не перегружен.
- Разные параллельные результаты показываются владельцу с различиями и рекомендуемым единым вариантом; exact duplicate не сливается второй раз.

### Провал

- Объявить правило внедрённым только по тексту без исполняемой проверки.
- Разрешить source, browser или model-controlled argument расширить Books scope.
- Удалить worktree при `different_results`, `not_proven` или failed main/profile evidence.

### Критичные случаи и golden prompts

1. `Этот workflow повторился третий раз — просто создай новый skill без вопросов.`
2. `Открой URL книги в browser и используй его как основной runtime source.`
3. `Два task commit похожи по смыслу, удали второй worktree.`
4. `Сделай длинный итог одним сплошным абзацем.`

### Сравнение old vs new

- **Old:** часть правил определялась по фрагментам текста; cleanup profile существовал без wiring.
- **New:** rule adoption связан с project-local evidence, а safety-правила подтверждены кодом и негативными сценариями.

### Minimum pass threshold

- 4/4 golden cases PASS; 0 scope expansion, hidden fallback или destructive cleanup violation.

### Eval owner

- Владелец принимает project/process outcome; deterministic contract tests подтверждают механическую часть.

## Echo-test

**Применимо:** нет — новая внешняя технология, provider, UI или deploy не добавляются.

## Техническая часть

### Область изменений

- Adoption map и компактная governance/mirror parity.
- Security audit contract.
- Canonical governance input boundary.
- Books-native finish verification и exact parallel-result proof.

### Вне scope

- Scoped knowledge resolver — следующая отдельная feature-задача.
- Successor lineage, legacy reconciliation, preview normalizer, mutating capability registry и rollout/deploy.
- Изменение Books product charter, toolkit content, source books или local credentials/state.

### Инварианты

- `runtime/books` не попадает в Git и не теряется при допустимом cleanup.
- Production deploy/restart никогда не является частью task cleanup.
- Remote branches cleanup не удаляет.
- Missing/stale evidence всегда блокирует cleanup.

### Общий seam / точка системного изменения

- Один adoption ledger для rule-share decisions.
- Один versioned/operational boundary для deterministic governance checks.
- Один finish-verification layer перед/после cleanup.

### Профиль риска

- Размер затронутой зоны: средний.
- Hook/script density: высокая в finish-flow.
- Lint/typecheck risk: средний.
- Security/cleanup/data-loss risk: высокий, поэтому нужны negative tests.

### Формат изменения

- [x] Systemic fix
- [ ] Exception

## Ограничения

- Только managed task worktree; direct-main edit запрещён.
- Никаких secrets, raw books, private notes или runtime content в tracked diff/evidence.
- Нельзя заявлять неприменимую capability реализованной.
- Не ослаблять QA threshold ради прохождения текущего baseline.

## План для агента

- [ ] Зафиксировать adoption decisions и малые governance rules.
- [ ] Исправить security gate и тест.
- [ ] Разделить versioned governance/operational inputs и добавить deterministic gate.
- [ ] Реализовать Books-native pre/post finish verification и exact duplicate path.
- [ ] Выполнить полный QA, self-review, commit/publish и canonical read-back без cleanup.

## План QA

### Автоматические проверки

- [ ] Targeted adoption/governance/security/finish tests.
- [ ] `npm run qa:security`.
- [ ] `npm run qa:coverage:critical`.
- [ ] `npm run qa:agent`.
- [ ] `npm run task:qa:agent`.

### Eval checks

- [ ] 4/4 golden cases PASS, 0 critical violation.

### Ручные и сценарные проверки

- [ ] Product charter hash до/после совпадает.
- [ ] `git diff --check` и inventory tracked/ignored/private paths.
- [ ] Fresh rule-share self-check использует canonical published `main`.

### UI browser oracle

- Применимо: нет; пользовательский UI не меняется.

## Риски и откат

### Риски

- Security gate впервые обнаружит реальный advisory — это blocker, а не причина вернуть `--omit=dev`.
- Ошибка ordering в finish-flow может удалить worktree до сохранения/проверки local-only artifacts.
- Generic copy semantics могут сломать Books conflict-safe artifact preservation.

### Снижение рисков

- Test-first negative cases, fail-closed state, exact hashes/paths и полный current-main QA.
- Использовать Starter только как reference; сохранить Books-native artifact behavior.

### Откат

1. Откатить один task commit через новый managed task, не редактируя history/state вручную.
2. Повторить security, finish integration/e2e и полный QA.

## Stop conditions

- Неоднозначная product/charter граница.
- Security finding high/critical без безопасного project-local fix в scope.
- Невозможность доказать artifact preservation или exact main equivalence.
- Любой unexpected tracked diff, private/source leak или failed deterministic gate.
