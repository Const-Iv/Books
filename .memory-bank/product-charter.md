# Product Charter

Этот файл — канонический product source of truth для миссии, видения, цели, целевой аудитории и пользовательской ценности `new-project-starter`.

## Миссия

Мы даём команде переносимую операционную основу для старта нового проекта с первого дня: понятные правила работы, безопасный task flow, воспроизводимые проверки, memory-bank governance, TRIZ-эскалацию и разговорное управление задачами без ручной сборки заново.

## Видение

`new-project-starter` становится базовым слоем для новых репозиториев: команда подключает его как baseline, сразу получает понятный способ заводить, проверять, завершать и публиковать задачи, а продуктовую специфику добавляет поверх через adapters/profiles без изменения core governance.

## Цель проекта

Поддерживать runnable local-first starter baseline, который можно подключать или копировать в downstream проекты, чтобы они сразу имели canonical sources of truth, managed worktrees, deterministic QA, task state/history, operational docs и reusable shared skills.

## Целевая аудитория

- Команды, которые начинают новый проект или новый репозиторий и хотят с первого дня работать по понятным правилам без ручной сборки governance заново.
- Технические и продуктовые лиды, которые отвечают за переносимую операционную основу: task flow, проверки, правила, память проекта и безопасное завершение задач.
- Инженеры и agent-operators, которые ведут задачи через Codex/worktree conveyor и должны получать воспроизводимый, проверяемый процесс.
- Downstream maintainers, которые подключают starter как baseline и добавляют продуктовую специфику поверх него через adapters/profiles.

Не является целевой аудиторией starter core: конечные пользователи downstream-продуктов. Их аудитория должна быть отдельно описана в product charter и product specs конкретного downstream-проекта.

## JTBD

Когда начинается новый проект, я хочу получить готовую и переносимую операционную основу, чтобы команда сразу работала по ясным правилам, проверяла изменения воспроизводимо и не собирала governance, task flow и QA заново.

## Product Charter Gate

- Перед любым продуктовым решением, feature, behavior, process или governance изменением нужно сначала прочитать этот документ целиком и сверить решение с миссией, видением, целью, целевой аудиторией и `JTBD`.
- Изменение нельзя реализовывать, если оно противоречит этому документу, ослабляет переносимость baseline, deterministic QA, safe task flow, source-of-truth governance или hardcode'ит product-specific поведение в starter core.
- Для feature, behavior, process и governance задач нужно явно показать, какую часть миссии, видения, цели, целевой аудитории или `JTBD` изменение поддерживает. Для maintenance-задач достаточно явно сохранить совместимость с этим charter.
- Product proposal нельзя подменять техническим sketch: полный разбор должен ссылаться на существующий project charter, а затем идти через `Цель изменения/решения -> JTBD -> Job Stories -> User Stories -> Критерии приемки`. `Миссия` и `Видение` нельзя создавать для конкретной задачи; эти блоки принадлежат project charter или Project Intake нового downstream-проекта.
- В Plan mode все уточняющие вопросы, варианты выбора и рекомендации ассистента должны проходить через этот же gate: recommended option обязан быть совместим с миссией, видением, целью, целевой аудиторией и `JTBD`, а charter-конфликтный вариант нельзя подавать как равнозначно рекомендуемый.
- Если запрос пользователя конфликтует с этим charter, ассистент должен остановиться, коротко объяснить конфликт и предложить ближайший безопасный вариант, который сохраняет миссию и цель проекта.
- Product charter нельзя обходить через локальный patch, mirror-файл, временный exception или ad-hoc script. Если charter требует изменения, сначала обновить этот файл и синхронизировать обязательные правила в `AGENTS.md`, `.memory-bank/*` и `CODEX_MEMORY.md`.
- Downstream проекты должны заменить или расширить этот charter своим product-specific charter, включая собственную целевую аудиторию, и сохранить baseline-инварианты starter core.
- Новый downstream-проект обязан начинаться с Project Intake Gate: команда заполняет недостающие сведения о миссии, видении, цели, целевой аудитории, `JTBD`, продуктовых ограничениях, сценариях, метриках успеха, governance/QA choices и applicable capability decisions; каждый применимый пункт должен получить явное owner approval до первой feature/refactor/behavior-change реализации в этой зоне.
- Conversational bootstrap нового downstream-проекта должен идти через `$starter-project-bootstrap`: фразы вроде `стартуем новый проект` запускают safe skill linking (`npm run skills:link`), guided Project Intake, перенос approved ответов в canonical sources и baseline QA вместо общего checklist.
- Для изменений, влияющих на AI/agent behavior, рекомендации, Plan mode, rule-sync reports, rule-share reports, conversational commands или качество ответов, acceptance criteria недостаточно: задача должна иметь Eval spec с описанием хорошего ответа, провала, критичных edge cases, regression examples, способа сравнения версий и minimum pass threshold.
