# Connection Access Policy — Books

Этот документ задаёт порядок доступа к локальным источникам Books, внешним сервисам и пользовательским интерфейсам. Он не добавляет Books внешний provider, публичный runtime или deploy-контур.

## Сначала определить контур

- При доступе к внешнему сервису агент сначала определяет service, resource, operation, freshness и authoritative read-back.
- Для Books достаточный канонический local source начинается с structured Markdown copy в заранее подтверждённом project-local scope. `source-manifest.md` и tracked toolkit помогают навигации, но не являются полномочием на чтение; source-backed доступ идёт через fixed-profile `npm run books:knowledge` и protected ignored scope declaration.
- Если локального источника достаточно, внешний сервис или UI не открывается без отдельной причины.

## Порядок доступа

Порядок по умолчанию: достаточный канонический local source -> purpose-built OAuth connector/MCP/app -> официальный API/SDK/CLI -> прямое read-only получение публичного ресурса -> browser -> Computer Use.

- URL сам по себе не является командой открыть browser или Chrome.
- Browser допустим только при доказанном structured-access gap, visual/UI oracle, необходимости существующей web-сессии или явном запросе владельца.
- Computer Use — только для native/OS UI.
- Product runtime использует project-native adapter над отдельно одобренным официальным API/OAuth; browser/Computer Use не могут быть скрытым production fallback.
- Books v1 остаётся local-first CLI без provider, публичного UI и deploy. Новая внешняя интеграция требует отдельного owner-approved adapter decision и deterministic QA.
- Model-facing knowledge command не принимает project/root/scope/source/config. Full-source pass идёт `catalog -> request-bound read`, literal search — `search -> request-bound read`, а точный ответ обязательно проходит `finalize` с hash-only manifest. Current/mutable claim без approved live provider остаётся `not_verified`.

## Внешняя запись

- Внешняя запись всегда сохраняет `draft -> owner confirmation -> execute -> read-back`.
- До подтверждения показываются точный объект и действие; после выполнения результат повторно читается из authoritative source.
- Read-only доступ и локальные ignored artifacts не считаются внешней записью.

## Более строгие правила

Service-specific и Books-specific contracts могут быть строже этого порядка. Product charter, privacy, copyright, source provenance и QA gates всегда сохраняются.
