# Сравнение V1 и V2 - Настольная книга project-менеджера

## Короткий вывод

V2 лучше, если главная цель - не упускать микролайфхаки, named practices and small practical mechanics из книги. Он плотнее, длиннее и больше похож на рабочий справочник PM.

V1 лучше, если нужен более легкий учебный artifact для junior PM, где меньше деталей и проще читать подряд.

Решение владельца: V2 выбран как основной и единственный toolkit. Этот файл оставлен только как decision note о различиях, не как второй toolkit.

## Файлы

| Версия | Файл | Статус |
|---|---|---|
| V1 | прежнее содержимое `Настольная книга project-менеджера - Владимир Завертайлов - toolkit.md` | заменено, доступно через Git history/diff |
| V2 | `Настольная книга project-менеджера - Владимир Завертайлов - toolkit.md` | выбранный основной toolkit |

## Главное изменение

V1 был построен как хороший macro-toolkit: routes, 93 action cards, teaching layer, tool selector, deep reference.

V2 построен заново из source с другим guardrail: каждая маленькая практика должна получить статус `card`, `folded_into` или `excluded_with_reason`. Это закрывает проблему, из-за которой `гемба / иди и смотри` была в книге, но не стала отдельной карточкой.

## Что изменилось по структуре

| Область | V1 | V2 | Что это значит |
|---|---|---|---|
| Action cards | 93 карточки | 127 карточек | V2 шире покрывает книгу и вытаскивает больше мелких практик |
| Micro-practice coverage | нет отдельного статуса | отдельный раздел со статусами | можно проверить, куда попала маленькая практика |
| Gemba | folded inside broader control/PDCA logic | отдельная карточка `Gemba / иди и смотри` | больше не теряется внутри PDCA |
| Team/culture hacks | часть практик отсутствует или схлопнута | вынесены Dyatel-board, Love-is stickers, beer fund, subbotnik, library, digests, Pomodoro etc. | V2 лучше для поиска маленьких внедряемых приемов |
| Scrum details | есть основные Scrum tools | добавлены zero retro, sprint goal, cargo-cult audit, Kanban switch nuance | V2 лучше показывает, как не внедрять Scrum ритуально |
| Discovery/product | есть Lean Canvas, personas, MVP, RICE | добавлены ABCDX, progressive JPEG, stronger RAT/JTBD/HADI separation | V2 точнее покрывает source-specific product tools |
| Problem analysis | есть muda/risk | добавлены fact maps, TOC/root-cause mechanics | V2 сильнее как troubleshooting toolkit |
| Technical literacy | есть production basics | добавлены official docs habit, daily push before standup, more explicit access/SSL/DNS framing | V2 лучше для PM, который должен понимать production контур |
| Teaching layer | сильный junior route | compact teaching matrix | V1 чуть удобнее как учебный курс, V2 как справочник |

## Что V2 добавил явно

### Micro-practices, которых не было видно в V1

| Практика | Как покрыто в V2 |
|---|---|
| `гемба / иди и смотри` | отдельная action card |
| `покликайте проект сами` | folded into self-check / gemba / touch-hands cards |
| `glvrd.ru` | отдельная card for writing clarity |
| `принцип пирамиды` | отдельная card |
| `поископригодность записи` | отдельная card |
| `цель спринта перед глазами` | отдельная card |
| `ABCDX` | отдельная card |
| `прогрессивный JPEG` | отдельная card |
| `Дятел-board` | отдельная card |
| `Love is stickers` | отдельная card |
| `совет дня / трендвотчинг` | отдельная card |
| `желтые письма` | отдельная card |
| `пивной фонд` | отдельная card |
| `субботники / корпоративная библиотека / лидерборды` | отдельная grouped card with caution |
| `песочные часы / Pomodoro` | отдельная card |
| `факт-карты / TOC diagrams` | отдельная card |
| `читать официальную документацию` | отдельная card |

### Более точная PM-практика

V2 сильнее разделяет:
- `проверять самому` и `идти в gemba`;
- `PDCA как функция власти` and отдельные поддействия `Планируй / Делай / Проверяй / Воздействуй`;
- `Scrum как framework` and конкретные practices: zero retro, sprint goal, demo, retro decisions, Kanban switch;
- `дизайн как процесс` and отдельные tools: creative slider, moodboard, presentation checklist, UI-kit readiness, objections log;
- `risk management` and problem solving: muda scan, fact maps, TOC/root-cause, risk matrix.

## Что стало хуже или тяжелее в V2

| Недостаток V2 | Почему это важно |
|---|---|
| Он плотнее | читать подряд тяжелее, чем V1 |
| Меньше narrative flow | V2 больше справочник, меньше учебный рассказ |
| Больше маленьких practices | пользователь должен выбирать, что применимо, а не внедрять все подряд |
| Некоторые culture hacks опасны без контекста | V2 помечает их, но все равно их надо применять аккуратно |

## Что V1 делает лучше

- V1 проще как первый учебный материал для junior PM.
- V1 короче и быстрее читается.
- V1 меньше отвлекает на корпоративные micro-hacks, если цель - освоить только базовые PM-практики.
- V1 уже был хорошо организован под training route.

## Что V2 делает лучше

- Не теряет микро-практики.
- Лучше покрывает source-specific приемы, а не только большие frameworks.
- Явно показывает coverage status для спорных мелких практик.
- Лучше подходит как возвращаемый рабочий справочник.
- Лучше отвечает на твой исходный запрос: `я заранее не знаю, где практика есть и как она называется`.

## Решение, которое было принято

V2 выбран, потому что приоритеты были:
- максимальную полноту;
- сохранение маленьких лайфхаков;
- справочник, к которому можно возвращаться;
- меньше риска, что полезная практика исчезла внутри крупной карточки.

Выполнено после выбора:
- старый `toolkit.md` заменен на V2;
- `source-manifest.md` обновлен;
- временный V2-файл удален;
- comparison note переименован так, чтобы он не выглядел как второй toolkit.
