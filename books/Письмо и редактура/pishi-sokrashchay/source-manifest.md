# Source manifest

## Book identity

- **Название:** Пиши, сокращай. Как создавать сильный текст
- **Авторы:** Максим Ильяхов, Людмила Сарычева
- **Издание:** 2-е, Москва, 2017
- **Категория:** Письмо и редактура
- **Scope:** standalone toolkit по одному полному локальному PDF

## Local source

- **Original PDF:** `runtime/books/Письмо и редактура/pishi-sokrashchay/Максим Ильяхов, Людмила Сарычева - Пиши, сокращай.pdf`
- **Canonical structured Markdown:** `runtime/books/Письмо и редактура/pishi-sokrashchay/Максим Ильяхов, Людмила Сарычева - Пиши, сокращай.md`
- **Extraction:** `pdftotext -layout` → page-aware Markdown with `## PDF page N` markers
- **PDF pages:** 401
- **Non-empty extracted pages:** 400
- **Coverage declaration:** complete
- **Original retained:** yes, because source format is PDF
- **Original SHA-256:** `813b604e015b7d38c9bfa7acfdddc84939132d2a09345fc35ce168d1e3c0b8a2`
- **Structured Markdown SHA-256:** `0b804eadd9e009e993658f2ec5f9016eb42db0ea6cc76e41fc62fcb66a5030c9`

## Shareable artifact

- `books/Письмо и редактура/pishi-sokrashchay/Пиши, сокращай - Максим Ильяхов, Людмила Сарычева - практический toolkit.md`

## Source navigation

- Introduction and author stance: `PDF page 5–29`.
- Chapter 1, `Отжать воду`: `PDF page 30–163`.
  - Method and stop words: `31–39`.
  - Introductory phrases: `40–49`.
  - Evaluations and intensifiers: `50–69`.
  - Clichés, bureaucracy, formalism: `70–98`.
  - Unnecessary complexity and terminology: `99–115`.
  - Euphemisms and criticism boundary: `115–126`.
  - Verbal nouns, participles, passive voice: `127–136`.
  - Indefinite claims: `136–143`.
  - Distortion and lies: `143–153`.
  - Real-life resistance and unfamiliar subjects: `153–163`.
- Chapter 2, `Донести мысли`: `PDF page 164–314`.
  - Informativeness: `165–176`.
  - Syntax and reading aloud: `177–194`.
  - Commas and syntactic restructuring: `195–213`.
  - Homogeneous parts: `213–218`.
  - Paragraphs: `218–234`.
  - Goal and tasks: `234–245`.
  - Structure and modules: `245–264`.
  - Headlines: `265–281`.
  - Teaching: `281–296`.
  - Sensory experience: `296–302`.
  - Facts: `302–311`.
  - Complex cases: `311–314`.
- Chapter 3, `Рассказать о себе`: `PDF page 315–400`.
  - Purchase decision: `316–330`.
  - Product story: `330–336`.
  - About self/company: `336–360`.
  - Credentials and clients: `361–375`.
  - Cover letter: `375–387`.
  - Lies in self-presentation: `387–395`.
  - Main secret and next practice: `395–400`.

## Copyright and fidelity notes

- The tracked toolkit is a practical transformation with concise paraphrases and source locators, not a reproduction of the book.
- The full PDF and structured source remain only under ignored `runtime/books/`.
- `pdftotext -layout` preserves readable text and approximate column layout but not full visual fidelity; consult the retained PDF for image-dependent examples.
