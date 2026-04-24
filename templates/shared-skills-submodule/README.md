# Shared Skills через git submodule

Этот шаблон нужен downstream проектам, которые хотят использовать canonical skills из starter без ручного копирования.

## Установка в проект

```bash
git submodule add <starter-repo-url> vendor/new-project-starter
git submodule update --init --recursive
```

Добавьте scripts в `package.json` downstream проекта:

```json
{
  "scripts": {
    "skills:link": "node vendor/new-project-starter/scripts/skills-manage.mjs link --source vendor/new-project-starter/skills",
    "skills:status": "node vendor/new-project-starter/scripts/skills-manage.mjs status --source vendor/new-project-starter/skills",
    "skills:unlink": "node vendor/new-project-starter/scripts/skills-manage.mjs unlink --source vendor/new-project-starter/skills"
  }
}
```

После clone нового устройства:

```bash
git submodule update --init --recursive
npm run skills:link
```

Если в `~/.codex/skills` уже есть локальная конфликтующая копия skill:

```bash
npm run skills:link -- --adopt
```

## Обновление версии starter

```bash
git -C vendor/new-project-starter fetch
git -C vendor/new-project-starter checkout <starter-commit-or-tag>
git add vendor/new-project-starter
git commit -m "Ver. 4.00 docs: update shared skills baseline | билд прошел"
```

Уже созданные symlink'и в `$CODEX_HOME/skills` начнут читать обновлённые файлы после submodule update.
