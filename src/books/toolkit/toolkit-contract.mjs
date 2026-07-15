export const BOOKS_IDEAL_TOOLKIT_CONTRACT = Object.freeze({
  name: "ideal-books-toolkit-master",
  language: "ru",
  modelArtifactPath:
    "books/TRIZ - Теория решения изобретательских задач/triz-unified-practical-toolkit/Единый практический toolkit TRIZ - по нескольким книгам.md",
  intent:
    "Produce a reusable practical toolkit, not a summary, preserving direct-book depth and route-based usability.",
  requiredSections: Object.freeze([
    "Связь с charter проекта",
    "Отчет извлечения",
    "Staged assembly / source layers",
    "Как пользоваться toolkit",
    "Battle route",
    "Training route",
    "Быстрая карта",
    "Tool selector",
    "Лайфхаки, приемы и инструменты к внедрению",
    "Deep reference body",
    "Coverage map",
    "Excluded / limited source notes",
    "Anti-patterns",
    "Практические сценарии",
    "Cheatsheet",
    "Glossary",
    "Topic index",
    "Scope and limits"
  ]),
  actionCardFields: Object.freeze([
    "Что внедрить",
    "Контекст",
    "Когда применять",
    "Первый шаг",
    "Источник / где искать в книге"
  ]),
  microPracticeStatusValues: Object.freeze([
    "card",
    "folded_into",
    "excluded_with_reason"
  ]),
  microPracticeTriggers: Object.freeze([
    "named concepts",
    "author metaphors",
    "imperative instructions",
    "checklists, rituals and tools",
    "nested subheadings inside larger frameworks"
  ]),
  toolSelectorFields: Object.freeze([
    "Tool",
    "Best for",
    "Do not use when",
    "Primary source layers"
  ]),
  qualityGates: Object.freeze([
    "extract structure, not summaries",
    "direct structured source depth pass",
    "route-based usage before deep reference",
    "tool selector prevents wrong tool use",
    "action cards immediately after quick map",
    "micro-practice inventory from the full structured source",
    "card/folded/excluded status for every micro-practice candidate",
    "coverage map and dedupe notes",
    "excluded / limited source notes",
    "verification before celebrating",
    "no large raw excerpts",
    "source traceability to runtime structured Markdown"
  ]),
  singleBook: Object.freeze({
    depthSource: "direct-structured-book-source",
    requiredStages: Object.freeze([
      "source extraction and structured Markdown copy",
      "book structure map",
      "deep direct-book evidence pass",
      "micro-practice inventory and status gate",
      "master-format toolkit synthesis",
      "source manifest",
      "quality validation"
    ]),
    forbidden: Object.freeze([
      "summary-only output",
      "generic advice not tied to author ideas",
      "action cards from only the introduction",
      "missing source path for implementation cards",
      "silent drop of named or imperative micro-practices",
      "route selector without deep reference body"
    ])
  }),
  multiBook: Object.freeze({
    depthSource: "direct-structured-book-sources",
    standaloneRole: "coverage-control-not-depth-ceiling",
    requiredStages: Object.freeze([
      "owner-selected common idea or theme",
      "direct source extraction and deep evidence pass",
      "standalone toolkit generation for every book",
      "standalone coverage and gap check",
      "combined master synthesis directly from books with standalone coverage check",
      "coverage map and dedupe notes",
      "practical sequence from route selection to deep reference",
      "source manifest"
    ]),
    forbidden: Object.freeze([
      "synthesize combined only from standalone toolkit summaries",
      "drop deep reference tables because route layer exists",
      "merge books without direct source evidence",
      "use standalone toolkit as depth ceiling",
      "lose source traceability while deduplicating",
      "make a fast shallow combined artifact"
    ])
  })
});

/**
 * @param {{mode?: "single-book" | "multi-book"}} [options]
 * @returns {string}
 */
export function buildBooksToolkitPromptRules(options = {}) {
  const mode = options.mode || "single-book";
  const contract = BOOKS_IDEAL_TOOLKIT_CONTRACT;
  const modeRules =
    mode === "multi-book"
      ? [
          "Для серии книг не ограничивайся standalone toolkit: они являются coverage-control artifacts, not depth ceiling.",
          "Combined master должен синтезироваться напрямую из direct structured Markdown source copies and local originals, затем сверяться со standalone toolkit'ами на coverage gaps.",
          "Сначала зафиксируй common idea/theme, затем source layers, direct-book evidence, standalone coverage check, dedupe notes and practical sequence."
        ]
      : [
          "Для одной книги глубина берется напрямую из direct structured Markdown source copy and local original.",
          "Standalone toolkit обязан сам быть master-format artifact, not a preliminary summary."
        ];

  return [
    "Books toolkit output contract:",
    "- Output на русском.",
    "- Это не краткий пересказ и не замена книги; это reusable practical toolkit.",
    "- Используй practitioner voice: что делать, какой книжный контекст это объясняет, когда применять, какой первый шаг, где источник.",
    `- Эталон формата: ${contract.modelArtifactPath}.`,
    "- Обязательные верхние слои: usage layer, Battle route, Training route, Быстрая карта, Tool selector.",
    "- Tool selector обязан иметь поля: Tool, Best for, Do not use when, Primary source layers.",
    "- Раздел `Лайфхаки, приемы и инструменты к внедрению` идет сразу после `Быстрая карта` and uses action cards.",
    "- Каждая action card содержит `Контекст`: source-backed summary конкретной сцены, кейса, мысленного эксперимента или причинной демонстрации из книги — кто/в какой ситуации действовал, что сделал или решил и какой эффект получил.",
    "- `Контекст` не повторяет `Что внедрить`, не подменяется generic advice, не выдумывает отсутствующую компанию или персонажа и не воспроизводит большой фрагмент source.",
    "- Перед synthesis сделай Micro-practice pass по всей structured source: named concepts, author metaphors, checklists/rituals/tools, imperative phrases and nested subheadings inside larger frameworks.",
    "- Каждый micro-practice candidate получает status `card | folded_into | excluded_with_reason`; термин или практика из source не может исчезнуть без статуса.",
    "- Не схлопывай подзаголовки внутри framework в один общий пункт, если подзаголовок содержит отдельное действие, ритуал, проверку или прием.",
    "- Сохраняй deep reference body: справочные таблицы, framework details, author-specific models and technique depth нельзя урезать ради навигации.",
    "- Добавь Coverage map, dedupe notes for multi-source work, Excluded / limited source notes, Anti-patterns, Практические сценарии, Cheatsheet, Glossary, Topic index, Scope and limits.",
    "- Каждый strong concept or recommendation проходит verification before celebrating: что проверять, какой риск, какой первый тест.",
    ...modeRules,
    "- Нельзя терять достойные внимания идеи ради скорости, токенов или красивой краткости."
  ].join("\n");
}

/**
 * @param {{
 *   sections?: string[],
 *   actionCardFields?: string[],
 *   hasDirectSourceCoverage?: boolean,
 *   hasMicroPracticeCoverage?: boolean,
 *   unresolvedMicroPracticeCandidates?: string[],
 *   hasStandaloneCoverageControl?: boolean,
 *   mode?: "single-book" | "multi-book"
 * }} candidate
 * @returns {{ok: boolean, failures: string[]}}
 */
export function validateBooksToolkitContract(candidate) {
  const sections = new Set(candidate.sections || []);
  const actionCardFields = new Set(candidate.actionCardFields || []);
  const failures = [];

  for (const section of BOOKS_IDEAL_TOOLKIT_CONTRACT.requiredSections) {
    if (!sections.has(section)) {
      failures.push(`missing section: ${section}`);
    }
  }

  for (const field of BOOKS_IDEAL_TOOLKIT_CONTRACT.actionCardFields) {
    if (!actionCardFields.has(field)) {
      failures.push(`missing action card field: ${field}`);
    }
  }

  if (!candidate.hasDirectSourceCoverage) {
    failures.push(
      candidate.mode === "multi-book"
        ? "multi-book missing direct source depth pass"
        : "single-book missing direct source depth pass"
    );
  }

  if (!candidate.hasMicroPracticeCoverage) {
    failures.push("missing micro-practice coverage gate");
  }

  for (const microPractice of candidate.unresolvedMicroPracticeCandidates || []) {
    failures.push(`unresolved micro-practice candidate: ${microPractice}`);
  }

  if (candidate.mode === "multi-book" && !candidate.hasStandaloneCoverageControl) {
    failures.push("multi-book missing standalone coverage control");
  }

  return {
    ok: failures.length === 0,
    failures
  };
}
