#!/usr/bin/env node
// @ts-check
/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const COVERAGE_DIR = path.join(ROOT, "coverage");
const BASELINE_FILE = path.join(ROOT, "quality-gate-baseline.json");
const REPORT_FILE = path.join(COVERAGE_DIR, "quality-gate-report.md");
const COVERAGE_SUMMARY = path.join(COVERAGE_DIR, "coverage-summary.json");
const JSCPD_REPORT = path.join(COVERAGE_DIR, "jscpd-report.json");
const ESLINT_REPORT = path.join(COVERAGE_DIR, "eslint-report.json");

const OVERSIZED_THRESHOLD = 300;

// ─── helpers ────────────────────────────────────────────────────────────────

function round2(n) {
  return Math.round(n * 100) / 100;
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sign(n) {
  if (n > 0) return `+${n}`;
  if (n < 0) return `${n}`;
  return "—";
}

function countLinesInFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return content.split("\n").length;
}

// ─── metric collectors ───────────────────────────────────────────────────────

function collectCoverage() {
  const summary = readJson(COVERAGE_SUMMARY);
  if (!summary || !summary.total) {
    throw new Error(`coverage-summary.json not found or invalid. Run 'pnpm test:coverage' first.`);
  }
  const t = summary.total;
  return {
    lines: round2(t.lines.pct),
    statements: round2(t.statements.pct),
    functions: round2(t.functions.pct),
    branches: round2(t.branches.pct),
  };
}

function collectDuplication() {
  const report = readJson(JSCPD_REPORT);
  if (!report) {
    console.warn("  [warn] jscpd-report.json not found — duplication set to 0. Run 'pnpm dup:check' first.");
    return { percentage: 0, fragments: 0 };
  }
  const stats = report.statistics?.total ?? {};
  const percentage = round2(stats.percentage ?? 0);
  const fragments = stats.clones ?? stats.duplicatedLines ?? 0;
  return { percentage, fragments };
}

function collectViolations() {
  const eslintData = readJson(ESLINT_REPORT);
  let qualityRules = 0;
  if (!eslintData) {
    console.warn("  [warn] eslint-report.json not found — qualityRules set to 0. Run 'pnpm lint:json' first.");
  } else {
    for (const file of eslintData) {
      qualityRules += (file.errorCount ?? 0) + (file.warningCount ?? 0);
    }
  }

  const oversizedFiles = [];
  const srcDir = path.join(ROOT, "src");
  if (fs.existsSync(srcDir)) {
    walkTs(srcDir, (filePath) => {
      const lines = countLinesInFile(filePath);
      if (lines > OVERSIZED_THRESHOLD) {
        oversizedFiles.push({ file: path.relative(ROOT, filePath), lines });
      }
    });
  }

  return { qualityRules, oversizedFiles: oversizedFiles.length, oversizedFilesList: oversizedFiles };
}

function walkTs(dir, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", ".next", "coverage", "__tests__"].includes(entry.name)) walkTs(full, cb);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      cb(full);
    }
  }
}

// ─── baseline ────────────────────────────────────────────────────────────────

function buildBaseline() {
  const cov = collectCoverage();
  const dup = collectDuplication();
  const vio = collectViolations();
  return {
    timestamp: new Date().toISOString(),
    coverage: {
      lines: { pct: cov.lines },
      statements: { pct: cov.statements },
      functions: { pct: cov.functions },
      branches: { pct: cov.branches },
    },
    duplication: {
      percentage: dup.percentage,
      fragments: dup.fragments,
    },
    violations: {
      qualityRules: vio.qualityRules,
      oversizedFiles: vio.oversizedFiles,
    },
  };
}

// ─── report ──────────────────────────────────────────────────────────────────

function buildReport(current, baseline, regressions, passed) {
  const status = passed ? "✅ Passed" : "❌ Failed";
  const ts = new Date().toISOString();

  const covRows = ["lines", "statements", "functions", "branches"].map((m) => {
    const b = baseline.coverage[m].pct;
    const c = current.coverage[m];
    const d = round2(c - b);
    const reg = regressions.some((r) => r === `coverage.${m}`);
    return `| ${m.charAt(0).toUpperCase() + m.slice(1).padEnd(10)} | ${b.toFixed(2)}% | ${c.toFixed(2)}% | ${sign(d)}% ${reg ? "❌" : ""} |`;
  });

  const dupB = baseline.duplication;
  const dupC = current.duplication;
  const dupPctDelta = round2(dupC.percentage - dupB.percentage);
  const dupFragDelta = dupC.fragments - dupB.fragments;
  const dupPctReg = regressions.includes("duplication.percentage") ? "❌" : "";
  const dupFragReg = regressions.includes("duplication.fragments") ? "❌" : "";

  const vioB = baseline.violations;
  const vioC = current.violations;
  const qrDelta = vioC.qualityRules - vioB.qualityRules;
  const ofDelta = vioC.oversizedFiles - vioB.oversizedFiles;
  const qrReg = regressions.includes("violations.qualityRules") ? "❌" : "";
  const ofReg = regressions.includes("violations.oversizedFiles") ? "❌" : "";

  const oversizedSection =
    current.violations.oversizedFilesList.length > 0
      ? `\n### Oversized Files (>${OVERSIZED_THRESHOLD} lines)\n` +
        current.violations.oversizedFilesList
          .sort((a, b) => b.lines - a.lines)
          .map((f) => `- \`${f.file}\` — ${f.lines} lines`)
          .join("\n")
      : "";

  const regressionsSection =
    regressions.length > 0
      ? `\n### Regressions\n` +
        regressions.map((r) => `- \`${r}\` degraded`).join("\n")
      : "";

  return `## Quality Gate

**Status: ${status}**

### Coverage
| Metric     | Baseline | Current | Δ |
|------------|----------|---------|---|
${covRows.join("\n")}

### Duplication
| Metric     | Baseline | Current | Δ |
|------------|----------|---------|---|
| Percentage | ${dupB.percentage.toFixed(2)}% | ${dupC.percentage.toFixed(2)}% | ${sign(dupPctDelta)}% ${dupPctReg} |
| Fragments  | ${dupB.fragments} | ${dupC.fragments} | ${sign(dupFragDelta)} ${dupFragReg} |

### Violations
| Metric              | Baseline | Current | Δ |
|---------------------|----------|---------|---|
| Quality rule viol.  | ${vioB.qualityRules} | ${vioC.qualityRules} | ${sign(qrDelta)} ${qrReg} |
| Oversized files     | ${vioB.oversizedFiles} | ${vioC.oversizedFiles} | ${sign(ofDelta)} ${ofReg} |
${oversizedSection}${regressionsSection}

_Generated by scripts/quality-gate.js on ${ts}_
`;
}

function printConsoleTable(current, baseline, regressions) {
  console.log("\nCoverage");
  console.log("+--------------+----------+---------+--------+");
  console.log("| Metric       | Baseline | Current |   D    |");
  console.log("+--------------+----------+---------+--------+");
  for (const m of ["lines", "statements", "functions", "branches"]) {
    const b = baseline.coverage[m].pct;
    const c = current.coverage[m];
    const d = round2(c - b);
    const reg = regressions.includes(`coverage.${m}`) ? " <-- REGRESSION" : "";
    const label = (m.charAt(0).toUpperCase() + m.slice(1)).padEnd(12);
    console.log(`| ${label} | ${b.toFixed(2).padStart(7)}% | ${c.toFixed(2).padStart(6)}% | ${sign(d).padStart(5)}%${reg} |`);
  }
  console.log("+--------------+----------+---------+--------+");

  console.log("\nDuplication");
  const dupB = baseline.duplication;
  const dupC = current.duplication;
  console.log(`  Percentage: ${dupB.percentage}% -> ${dupC.percentage}% (${sign(round2(dupC.percentage - dupB.percentage))}%)`);
  console.log(`  Fragments:  ${dupB.fragments} -> ${dupC.fragments} (${sign(dupC.fragments - dupB.fragments)})`);

  console.log("\nViolations");
  const vioB = baseline.violations;
  const vioC = current.violations;
  console.log(`  Quality rules: ${vioB.qualityRules} -> ${vioC.qualityRules} (${sign(vioC.qualityRules - vioB.qualityRules)})`);
  console.log(`  Oversized files: ${vioB.oversizedFiles} -> ${vioC.oversizedFiles} (${sign(vioC.oversizedFiles - vioB.oversizedFiles)})`);
  if (vioC.oversizedFilesList.length > 0) {
    for (const f of vioC.oversizedFilesList) {
      console.log(`    - ${f.file} (${f.lines} lines)`);
    }
  }
  console.log();
}

// ─── compare ─────────────────────────────────────────────────────────────────

function compare(current, baseline) {
  const regressions = [];

  for (const m of ["lines", "statements", "functions", "branches"]) {
    if (round2(current.coverage[m]) < round2(baseline.coverage[m].pct)) {
      regressions.push(`coverage.${m}`);
    }
  }

  if (round2(current.duplication.percentage) > round2(baseline.duplication.percentage)) {
    regressions.push("duplication.percentage");
  }
  if (current.duplication.fragments > baseline.duplication.fragments) {
    regressions.push("duplication.fragments");
  }

  if (current.violations.qualityRules > baseline.violations.qualityRules) {
    regressions.push("violations.qualityRules");
  }
  if (current.violations.oversizedFiles > baseline.violations.oversizedFiles) {
    regressions.push("violations.oversizedFiles");
  }

  return regressions;
}

// ─── main ────────────────────────────────────────────────────────────────────

const mode = process.argv[2];
const noUpdate = process.argv.includes("--no-update");

if (!fs.existsSync(COVERAGE_DIR)) fs.mkdirSync(COVERAGE_DIR, { recursive: true });

if (mode === "init") {
  console.log("Capturing initial baseline...");
  const baseline = buildBaseline();
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2) + "\n");
  console.log(`Baseline written to quality-gate-baseline.json`);
  console.log(JSON.stringify(baseline, null, 2));
  process.exit(0);
}

// default: compare mode
const baseline = readJson(BASELINE_FILE);
if (!baseline) {
  console.error("quality-gate-baseline.json not found. Run 'pnpm quality-gate:init' first.");
  process.exit(1);
}

console.log("Running quality gate...");
const covCurrent = collectCoverage();
const dupCurrent = collectDuplication();
const vioCurrent = collectViolations();

const current = {
  coverage: covCurrent,
  duplication: dupCurrent,
  violations: vioCurrent,
};

const regressions = compare(current, baseline);
const passed = regressions.length === 0;

printConsoleTable(current, baseline, regressions);

const report = buildReport(current, baseline, regressions, passed);
fs.writeFileSync(REPORT_FILE, report);
console.log(`Report written to coverage/quality-gate-report.md`);

if (!passed) {
  console.error(`\nQuality Gate FAILED. Regressions: ${regressions.join(", ")}`);
  process.exit(1);
}

console.log("Quality Gate PASSED.");

if (!noUpdate) {
  const improved =
    ["lines", "statements", "functions", "branches"].some(
      (m) => round2(current.coverage[m]) > round2(baseline.coverage[m].pct)
    ) ||
    round2(current.duplication.percentage) < round2(baseline.duplication.percentage) ||
    current.duplication.fragments < baseline.duplication.fragments ||
    current.violations.qualityRules < baseline.violations.qualityRules ||
    current.violations.oversizedFiles < baseline.violations.oversizedFiles;

  if (improved) {
    const newBaseline = {
      timestamp: new Date().toISOString(),
      coverage: {
        lines: { pct: current.coverage.lines },
        statements: { pct: current.coverage.statements },
        functions: { pct: current.coverage.functions },
        branches: { pct: current.coverage.branches },
      },
      duplication: {
        percentage: current.duplication.percentage,
        fragments: current.duplication.fragments,
      },
      violations: {
        qualityRules: current.violations.qualityRules,
        oversizedFiles: current.violations.oversizedFiles,
      },
    };
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(newBaseline, null, 2) + "\n");
    console.log("Baseline advanced (metrics improved).");
  }
}

process.exit(0);
