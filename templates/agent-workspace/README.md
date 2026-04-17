# Шаблоны рабочего пространства агента

Эти файлы нужны как безопасные шаблоны для локальной настройки агента без коммита личных данных в репозиторий.

## Что заполнять локально

- `SOUL.template.md` -> копия в `SOUL.md`
- `USER.template.md` -> копия в `USER.md`
- `MEMORY.template.md` -> копия в `MEMORY.md`
- `memory/L0_INDEX.template.md` -> копия в `memory/L0_INDEX.md`
- при необходимости создать дополнительные `memory/L1/*.md`
- при необходимости вести подробные заметки в `memory/L2/*` и `memory/L2/mementos/*`

## Что не коммитить

- реальные токены;
- реальные user ids;
- реальные персональные профили;
- приватные memory notes;
- session traces и runtime SQLite.
