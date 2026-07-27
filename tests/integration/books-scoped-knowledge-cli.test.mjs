// @ts-check

import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import test from "node:test";

import {
  loadBooksKnowledgeContext,
  runBooksKnowledgeSession
} from "../../src/books/cli/scoped-knowledge.mjs";

/**
 * @param {import("node:test").TestContext} t
 */
async function createConnectedFixture(t) {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "books-knowledge-cli-"));
  t.after(async () => {
    await rm(repoRoot, { recursive: true, force: true });
  });
  const profilePath = path.join(
    repoRoot,
    "src",
    "books",
    "knowledge",
    "scoped-knowledge-profile.json"
  );
  const sourceRoot = path.join(repoRoot, "runtime", "books");
  const protectedDirectory = path.join(sourceRoot, ".knowledge");
  const scopeManifestPath = path.join(protectedDirectory, "trusted-scope.json");
  const sourcePath = path.join(sourceRoot, "topic", "book-alpha", "source.md");
  await mkdir(path.dirname(profilePath), { recursive: true });
  await mkdir(path.dirname(sourcePath), { recursive: true });
  await mkdir(protectedDirectory, { recursive: true, mode: 0o700 });
  await chmod(protectedDirectory, 0o700);
  await writeFile(
    profilePath,
    `${JSON.stringify({
      schemaVersion: 1,
      projectId: "Books",
      sourceRoot: "runtime/books",
      scopeManifest: "runtime/books/.knowledge/trusted-scope.json",
      responseRoot: "runtime/books/.response-manifests"
    }, null, 2)}\n`,
    "utf8"
  );
  await writeFile(
    scopeManifestPath,
    `${JSON.stringify({
      schemaVersion: 1,
      scopeId: "book-alpha",
      coverageDeclaration: "complete",
      sources: [
        { id: "structured-source", relativePath: "topic/book-alpha/source.md" }
      ]
    }, null, 2)}\n`,
    { encoding: "utf8", mode: 0o600 }
  );
  await chmod(scopeManifestPath, 0o600);
  await writeFile(
    sourcePath,
    "CLI-SOURCE-SENTINEL\nПроверяемый локальный принцип.\n",
    "utf8"
  );
  return { repoRoot, scopeManifestPath };
}

/**
 * @param {string} expectedCode
 * @returns {(error: unknown) => boolean}
 */
function hasErrorCode(expectedCode) {
  return (error) =>
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    String(error.code) === expectedCode;
}

/**
 * @param {PassThrough} output
 * @returns {() => Promise<Record<string, unknown>>}
 */
function createJsonLineReader(output) {
  output.setEncoding("utf8");
  let buffer = "";
  /** @type {Record<string, unknown>[]} */
  const queued = [];
  /** @type {Array<(value: Record<string, unknown>) => void>} */
  const waiters = [];
  output.on("data", (chunk) => {
    buffer += String(chunk);
    while (buffer.includes("\n")) {
      const separator = buffer.indexOf("\n");
      const line = buffer.slice(0, separator);
      buffer = buffer.slice(separator + 1);
      const value = /** @type {Record<string, unknown>} */ (JSON.parse(line));
      const waiter = waiters.shift();
      if (waiter) {
        waiter(value);
      } else {
        queued.push(value);
      }
    }
  });
  return async () => {
    const value = queued.shift();
    if (value) {
      return value;
    }
    return new Promise((resolve) => waiters.push(resolve));
  };
}

/**
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
function asRecord(value) {
  assert.ok(value !== null && typeof value === "object" && !Array.isArray(value));
  return /** @type {Record<string, unknown>} */ (value);
}

test("fixed protected scope loader rejects missing or weak local authority", async (t) => {
  const fixture = await createConnectedFixture(t);
  const valid = await loadBooksKnowledgeContext({
    moduleRepoRoot: fixture.repoRoot,
    canonicalRepoRoot: fixture.repoRoot
  });
  assert.equal(valid.projectId, "Books");
  assert.equal(valid.scopeId, "book-alpha");
  assert.equal(valid.coverageDeclaration, "complete");

  await chmod(fixture.scopeManifestPath, 0o644);
  await assert.rejects(
    loadBooksKnowledgeContext({
      moduleRepoRoot: fixture.repoRoot,
      canonicalRepoRoot: fixture.repoRoot
    }),
    hasErrorCode("TRUSTED_SCOPE_NOT_CONFIGURED")
  );
});

test("connected JSONL session executes search, read and exact response finalization", async (t) => {
  const fixture = await createConnectedFixture(t);
  const trustedContext = await loadBooksKnowledgeContext({
    moduleRepoRoot: fixture.repoRoot,
    canonicalRepoRoot: fixture.repoRoot
  });
  const input = new PassThrough();
  const output = new PassThrough();
  const nextOutput = createJsonLineReader(output);
  const session = runBooksKnowledgeSession({ trustedContext, input, output });

  const ready = await nextOutput();
  const readyScope = asRecord(ready.scope);
  assert.equal(ready.ok, true);
  assert.equal(ready.operation, "ready");
  assert.equal(readyScope.projectId, "Books");

  input.write(`${JSON.stringify({
    operation: "search",
    query: "Проверяемый локальный принцип",
    freshness: "snapshot",
    sourceRoot: "/tmp/forbidden"
  })}\n`);
  const rejectedOverride = await nextOutput();
  assert.deepEqual(rejectedOverride, {
    ok: false,
    error: "COMMAND_AUTHORITY_FIELD_FORBIDDEN"
  });

  input.write(`${JSON.stringify({
    operation: "search",
    query: "Проверяемый локальный принцип",
    freshness: "snapshot"
  })}\n`);
  const searched = await nextOutput();
  const searchResult = asRecord(searched.result);
  assert.equal(searched.ok, true);
  assert.equal(searchResult.status, "found");
  assert.equal(searchResult.coverage, "complete");
  const requestId = String(searchResult.requestId);
  assert.ok(Array.isArray(searchResult.evidenceReferences));
  const reference = String(searchResult.evidenceReferences[0]);

  input.write(`${JSON.stringify({ operation: "read", requestId, reference })}\n`);
  const read = await nextOutput();
  const readResult = asRecord(read.result);
  assert.equal(read.ok, true);
  assert.equal(readResult.trust, "untrusted_data");
  assert.match(String(readResult.content), /CLI-SOURCE-SENTINEL/);

  const answerSentinel = "CLI-ANSWER-SENTINEL";
  const answer = `${answerSentinel}: ${reference}`;
  input.write(`${JSON.stringify({ operation: "finalize", requestId, answer })}\n`);
  const finalized = await nextOutput();
  const finalizedResult = asRecord(finalized.result);
  assert.equal(finalized.ok, true);
  assert.deepEqual(finalizedResult.evidenceReferences, [reference]);

  const manifestPath = path.join(
    fixture.repoRoot,
    "runtime",
    "books",
    ".response-manifests",
    `${String(finalizedResult.manifestId)}.json`
  );
  const manifestText = await readFile(manifestPath, "utf8");
  assert.equal(manifestText.includes("Проверяемый локальный принцип"), false);
  assert.equal(manifestText.includes("CLI-SOURCE-SENTINEL"), false);
  assert.equal(manifestText.includes(answerSentinel), false);
  assert.equal((await stat(manifestPath)).mode & 0o777, 0o600);

  input.write(`${JSON.stringify({
    operation: "search",
    query: "Кто сейчас руководитель?",
    freshness: "current"
  })}\n`);
  const currentFact = await nextOutput();
  const currentFactResult = asRecord(currentFact.result);
  assert.equal(currentFactResult.status, "not_verified");
  assert.equal(currentFactResult.coverage, "none");
  assert.deepEqual(currentFactResult.evidenceReferences, []);

  input.write(`${JSON.stringify({ operation: "catalog" })}\n`);
  const catalog = await nextOutput();
  const catalogResult = asRecord(catalog.result);
  assert.equal(catalogResult.status, "found");
  assert.ok(Array.isArray(catalogResult.evidenceReferences));
  assert.equal(catalogResult.evidenceReferences.length, 1);

  input.write(`${JSON.stringify({ operation: "close" })}\n`);
  const closed = await nextOutput();
  assert.deepEqual(closed, { ok: true, operation: "closed" });
  input.end();
  await session;
});

test("package exposes the connected Books knowledge command without authority flags", async () => {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(
    packageJson.scripts["books:knowledge"],
    "node src/books/cli/scoped-knowledge.mjs"
  );
});
