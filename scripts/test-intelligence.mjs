import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');

const root = new URL('../src/lib/', import.meta.url);
const dataSource = fs.readFileSync(new URL('data.ts', root), 'utf8');
const typesSource = fs.readFileSync(new URL('types.ts', root), 'utf8');
const intelligenceSource = fs.readFileSync(new URL('intelligence.ts', root), 'utf8');

function transpile(source, fileName) {
  return ts.transpileModule(source, {
    fileName,
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  }).outputText;
}

function loadModule(source, fileName, dependencies = {}) {
  const moduleExports = { exports: {} };
  const context = vm.createContext({
    module: moduleExports,
    exports: moduleExports.exports,
    require: (request) => dependencies[request] ?? require(request),
    console,
  });
  vm.runInContext(transpile(source, fileName), context, { filename: fileName });
  return module.exports;
}

const types = loadModule(typesSource, 'types.ts');
const data = loadModule(dataSource, 'data.ts', { './types': types });
const intelligence = loadModule(intelligenceSource, 'intelligence.ts', { './data': data, './types': types });

const cases = [
  { id: 'P001', expect: ['AREA_MISMATCH'] },
  { id: 'P002', expect: ['OWNER_MISMATCH', 'AREA_MISMATCH', 'LITIGATION_PRESENT'] },
  { id: 'P003', expect: ['MASTER_PLAN_CONFLICT', 'ROAD_RESERVATION_OVERLAP', 'POTENTIAL_SATELLITE_CHANGE'] },
  { id: 'P006', expect: ['OWNER_MISMATCH', 'AREA_MISMATCH', 'ENCUMBRANCE_PRESENT', 'LITIGATION_PRESENT'] },
  { id: 'P009', expect: [] },
  { id: 'P120', expect: ['MISSING_DATA'] },
];

for (const test of cases) {
  const analysis = intelligence.parcelTruthEngine.analyze(test.id);
  if (!analysis) throw new Error(`No analysis returned for ${test.id}`);
  const found = analysis.conflicts.map((item) => item.ruleId);
  for (const expectedRule of test.expect) {
    if (!found.includes(expectedRule)) {
      throw new Error(`${test.id} missing ${expectedRule}; found: ${found.join(', ')}`);
    }
  }
  const response = intelligence.parcelAssistant.ask('Why is this parcel flagged?', test.id);
  if (!response.answer || response.meta.rulesEvaluated !== 14) {
    throw new Error(`Assistant response invalid for ${test.id}`);
  }
  const report = intelligence.reportGenerator.generate(test.id);
  if (!report || report.sections.length < 3) {
    throw new Error(`Report invalid for ${test.id}`);
  }
  console.log(`${test.id}: ${found.length} findings; ${analysis.summary.evidenceRecords} evidence records`);
}

console.log('Intelligence checks passed.');
