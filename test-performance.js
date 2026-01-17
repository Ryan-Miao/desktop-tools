#!/usr/bin/env node

/**
 * 性能测试脚本
 * 测试日志系统的异步写入性能
 */

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(require('os').homedir(), '.config/desktop-tool/logs/app.log');

console.log('%c====================================================', 'color: #00bcd4; font-weight: bold');
console.log('%c         性能测试 - 日志异步写入性能             ', 'color: #00bcd4; font-weight: bold');
console.log('%c====================================================', 'color: #00bcd4; font-weight: bold');
console.log('');

// 测试1：检查日志文件大小
console.log('%c【测试1】日志文件大小检查', 'color: #4caf50; font-weight: bold');
try {
  const stats = fs.statSync(LOG_FILE);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  console.log(`✓ 日志文件大小: ${fileSizeKB} KB`);
  console.log(`✓ 日志文件路径: ${LOG_FILE}`);
} catch (error) {
  console.log(`✗ 无法访问日志文件: ${error.message}`);
}
console.log('');

// 测试2：检查最近日志条目的时间戳
console.log('%c【测试2】日志写入频率检查', 'color: #4caf50; font-weight: bold');
try {
  const logContent = fs.readFileSync(LOG_FILE, 'utf8');
  const lines = logContent.split('\n').filter(line => line.trim());

  // 获取最后100条日志
  const recentLines = lines.slice(-100);

  if (recentLines.length > 0) {
    // 提取时间戳并计算间隔
    const timestamps = recentLines
      .map(line => {
        const match = line.match(/\[(\d{4}-\d{2}-\d{2}T[\d:\.]+Z)\]/);
        return match ? new Date(match[1]) : null;
      })
      .filter(Boolean);

    if (timestamps.length > 1) {
      const timeDiffs = [];
      for (let i = 1; i < timestamps.length; i++) {
        const diff = timestamps[i] - timestamps[i - 1];
        timeDiffs.push(diff);
      }

      const avgDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
      const maxDiff = Math.max(...timeDiffs);
      const minDiff = Math.min(...timeDiffs);

      console.log(`✓ 分析最后 ${timestamps.length} 条日志`);
      console.log(`✓ 平均间隔: ${(avgDiff).toFixed(2)} ms`);
      console.log(`✓ 最小间隔: ${(minDiff).toFixed(2)} ms`);
      console.log(`✓ 最大间隔: ${(maxDiff).toFixed(2)} ms`);

      if (avgDiff < 10) {
        console.log('%c✓ 优秀：日志写入频率正常', 'color: #4caf50; font-weight: bold');
      } else if (avgDiff < 50) {
        console.log('%c✓ 良好：日志写入频率可接受', 'color: #8bc34a; font-weight: bold');
      } else {
        console.log('%c⚠ 警告：日志写入间隔较大', 'color: #ff9800; font-weight: bold');
      }
    }
  }
} catch (error) {
  console.log(`✗ 无法读取日志内容: ${error.message}`);
}
console.log('');

// 测试3：统计日志级别分布
console.log('%c【测试3】日志级别分布', 'color: #4caf50; font-weight: bold');
try {
  const logContent = fs.readFileSync(LOG_FILE, 'utf8');
  const lines = logContent.split('\n').filter(line => line.trim());

  const levels = {
    DEBUG: (logContent.match(/DEBUG/g) || []).length,
    INFO: (logContent.match(/INFO/g) || []).length,
    WARN: (logContent.match(/WARN/g) || []).length,
    ERROR: (logContent.match(/ERROR/g) || []).length
  };

  const total = Object.values(levels).reduce((a, b) => a + b, 0);

  console.log(`✓ 总日志条数: ${total}`);
  console.log(`  - DEBUG: ${levels.DEBUG} (${(levels.DEBUG/total*100).toFixed(1)}%)`);
  console.log(`  - INFO: ${levels.INFO} (${(levels.INFO/total*100).toFixed(1)}%)`);
  console.log(`  - WARN: ${levels.WARN} (${(levels.WARN/total*100).toFixed(1)}%)`);
  console.log(`  - ERROR: ${levels.ERROR} (${(levels.ERROR/total*100).toFixed(1)}%)`);
} catch (error) {
  console.log(`✗ 无法统计日志级别: ${error.message}`);
}
console.log('');

// 测试4：检查是否有错误日志
console.log('%c【测试4】错误日志检查', 'color: #4caf50; font-weight: bold');
try {
  const logContent = fs.readFileSync(LOG_FILE, 'utf8');
  const lines = logContent.split('\n').filter(line => line.trim() && line.includes('ERROR'));

  if (lines.length > 0) {
    console.log(`✓ 发现 ${lines.length} 条错误日志`);
    console.log('');
    console.log('最近的5条错误:');
    lines.slice(-5).forEach((line, index) => {
      const match = line.match(/\[(\d{4}-\d{2}-\d{2}T[\d:\.]+Z)\] ERROR (.+)/);
      if (match) {
        console.log(`  ${index + 1}. [${match[1]}] ${match[2].substring(0, 80)}...`);
      }
    });
  } else {
    console.log('%c✓ 没有错误日志', 'color: #4caf50; font-weight: bold');
  }
} catch (error) {
  console.log(`✗ 无法检查错误日志: ${error.message}`);
}
console.log('');

// 总结
console.log('%c====================================================', 'color: #00bcd4; font-weight: bold');
console.log('%c              测试完成                         ', 'color: #00bcd4; font-weight: bold');
console.log('%c====================================================', 'color: #00bcd4; font-weight: bold');
console.log('');
console.log('%c提示: 在浏览器控制台执行 testLogPerformance(1000) 进行完整的性能测试', 'color: #666');
