#!/usr/bin/env node

/**
 * 核心代码覆盖率验证脚本
 *
 * 根据AI开发规范，核心代码必须满足：
 * - 行覆盖率 >= 80%
 * - 函数覆盖率 >= 80%
 * - 语句覆盖率 >= 80%
 * - 分支覆盖率 >= 70%
 */

const fs = require('fs');
const path = require('path');

// 核心代码路径
const CORE_PATHS = [
  'src/main/',
  'src/shared/types/',
  'src/shared/logger/',
  'src/renderer/services/',
];

// 核心代码覆盖率阈值
const CORE_THRESHOLDS = {
  lines: 80,
  functions: 80,
  branches: 70,
  statements: 80,
};

/**
 * 读取覆盖率报告
 */
function readCoverageReport() {
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-final.json');

  if (!fs.existsSync(coveragePath)) {
    console.error('❌ 覆盖率报告不存在，请先运行: npm run test:coverage');
    process.exit(1);
  }

  const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  return coverageData;
}

/**
 * 判断文件是否是核心代码
 */
function isCoreFile(filePath) {
  return CORE_PATHS.some(corePath => filePath.includes(corePath));
}

/**
 * 计算核心代码的总体覆盖率
 */
function calculateCoreCoverage(coverageData) {
  let coreFiles = [];
  let totalLines = 0;
  let coveredLines = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalStatements = 0;
  let coveredStatements = 0;

  for (const [filePath, fileData] of Object.entries(coverageData)) {
    if (!isCoreFile(filePath)) continue;

    coreFiles.push(filePath);

    // 行覆盖率
    if (fileData.l) {
      const lines = fileData.l;
      totalLines += lines.length;
      coveredLines += lines.filter(hit => hit > 0).length;
    }

    // 函数覆盖率
    if (fileData.f) {
      const functions = Object.values(fileData.f);
      totalFunctions += functions.length;
      coveredFunctions += functions.filter(f => f > 0).length;
    }

    // 分支覆盖率
    if (fileData.b) {
      for (const branches of Object.values(fileData.b)) {
        totalBranches += branches.length;
        coveredBranches += branches.filter(hit => hit > 0).length;
      }
    }

    // 语句覆盖率
    if (fileData.s) {
      const statements = Object.values(fileData.s);
      totalStatements += statements.length;
      coveredStatements += statements.filter(hit => hit > 0).length;
    }
  }

  return {
    fileCount: coreFiles.length,
    files: coreFiles,
    lines: {
      total: totalLines,
      covered: coveredLines,
      percentage: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0,
    },
    functions: {
      total: totalFunctions,
      covered: coveredFunctions,
      percentage: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0,
    },
    branches: {
      total: totalBranches,
      covered: coveredBranches,
      percentage: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0,
    },
    statements: {
      total: totalStatements,
      covered: coveredStatements,
      percentage: totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0,
    },
  };
}

/**
 * 检查覆盖率是否达标
 */
function checkThresholds(coverage) {
  const results = {
    lines: {
      actual: coverage.lines.percentage,
      threshold: CORE_THRESHOLDS.lines,
      passed: coverage.lines.percentage >= CORE_THRESHOLDS.lines,
    },
    functions: {
      actual: coverage.functions.percentage,
      threshold: CORE_THRESHOLDS.functions,
      passed: coverage.functions.percentage >= CORE_THRESHOLDS.functions,
    },
    branches: {
      actual: coverage.branches.percentage,
      threshold: CORE_THRESHOLDS.branches,
      passed: coverage.branches.percentage >= CORE_THRESHOLDS.branches,
    },
    statements: {
      actual: coverage.statements.percentage,
      threshold: CORE_THRESHOLDS.statements,
      passed: coverage.statements.percentage >= CORE_THRESHOLDS.statements,
    },
  };

  return results;
}

/**
 * 打印覆盖率报告
 */
function printReport(coverage, results) {
  console.log('\n📊 核心代码覆盖率报告');
  console.log('='.repeat(60));
  console.log(`核心代码文件数: ${coverage.fileCount}`);
  console.log('');

  const metrics = [
    { name: '行覆盖率', data: results.lines },
    { name: '函数覆盖率', data: results.functions },
    { name: '分支覆盖率', data: results.branches },
    { name: '语句覆盖率', data: results.statements },
  ];

  let allPassed = true;

  metrics.forEach(({ name, data }) => {
    const icon = data.passed ? '✅' : '❌';
    const actual = data.actual.toFixed(2);
    const threshold = data.threshold;
    const status = data.passed ? '通过' : '未达标';

    console.log(`${icon} ${name}: ${actual}% (要求: >= ${threshold}%) - ${status}`);

    if (!data.passed) {
      allPassed = false;
    }
  });

  console.log('='.repeat(60));

  return allPassed;
}

/**
 * 列出未达标的核心文件
 */
function listUncoveredFiles(coverageData) {
  const uncoveredFiles = [];

  for (const [filePath, fileData] of Object.entries(coverageData)) {
    if (!isCoreFile(filePath)) continue;

    // 计算单个文件的覆盖率
    let lineCoverage = 0;
    if (fileData.l && fileData.l.length > 0) {
      const covered = fileData.l.filter(hit => hit > 0).length;
      lineCoverage = (covered / fileData.l.length) * 100;
    }

    if (lineCoverage < CORE_THRESHOLDS.lines) {
      uncoveredFiles.push({
        path: filePath,
        coverage: lineCoverage,
      });
    }
  }

  if (uncoveredFiles.length > 0) {
    console.log('\n⚠️  未达80%行覆盖率的核心文件:');
    console.log('');

    uncoveredFiles.forEach(({ path, coverage }) => {
      console.log(`  - ${path} (${coverage.toFixed(2)}%)`);
    });

    console.log('');
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 检查核心代码覆盖率...\n');

  const coverageData = readCoverageReport();
  const coverage = calculateCoreCoverage(coverageData);

  if (coverage.fileCount === 0) {
    console.warn('⚠️  未找到核心代码的覆盖率数据');
    console.warn('核心代码路径:');
    CORE_PATHS.forEach(path => console.warn(`  - ${path}`));
    process.exit(0);
  }

  const results = checkThresholds(coverage);
  const allPassed = printReport(coverage, results);

  if (!allPassed) {
    listUncoveredFiles(coverageData);
    console.error('\n❌ 核心代码覆盖率未达标，请添加测试');
    process.exit(1);
  }

  console.log('\n✅ 核心代码覆盖率达标！');
  process.exit(0);
}

// 运行脚本
main();
