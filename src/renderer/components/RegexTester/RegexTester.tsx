/**
 * Regex Tester Plugin
 *
 * Real-time regular expression testing and debugging tool
 */

import React, { useState, useCallback, useMemo } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './RegexTester.module.css';

interface RegexTesterProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface Match {
  index: number;
  match: string;
  groups: string[];
}

const commonPatterns = {
  'Email': '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
  'URL': 'https?:\\/\\/[^\s]+',
  'Phone (US)': '\\(\\d{3}\\)\\s?\\d{3}-\\d{4}',
  'IPv4': '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
  'Hex Color': '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b',
  'Date (YYYY-MM-DD)': '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])',
  'Time (HH:MM)': '([01]?[0-9]|2[0-3]):[0-5][0-9]',
  'Credit Card': '\\b(?:\\d[ -]*?){13,16}\\b',
  'ZIP Code (US)': '\\b\\d{5}(?:-\\d{4})?\\b',
  'Username': '^[a-zA-Z0-9_]{3,16}$',
};

const RegexTester: React.FC<RegexTesterProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Test regex and get matches
  const matches = useMemo((): Match[] | null => {
    if (!pattern) {
      setError('');
      return null;
    }

    try {
      const regex = new RegExp(pattern, flags);
      setError('');

      if (!testString) {
        return [];
      }

      const found: Match[] = [];
      let match: RegExpExecArray | null;

      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          found.push({
            index: match.index,
            match: match[0],
            groups: match.slice(1),
          });

          // Prevent infinite loop for zero-width matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          found.push({
            index: match.index,
            match: match[0],
            groups: match.slice(1),
          });
        }
      }

      return found;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid regex');
      return null;
    }
  }, [pattern, flags, testString]);

  // Highlight matches in test string
  const highlightedText = useMemo(() => {
    if (!matches || matches.length === 0) {
      return testString;
    }

    let lastIndex = 0;
    const parts: React.ReactNode[] = [];

    matches.forEach((match, i) => {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${i}`}>
            {testString.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add highlighted match
      parts.push(
        <mark key={`match-${i}`} className={styles.match}>
          {match.match}
        </mark>
      );

      lastIndex = match.index + match.match.length;
    });

    // Add remaining text
    if (lastIndex < testString.length) {
      parts.push(
        <span key="text-end">
          {testString.substring(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  }, [matches, testString]);

  // Copy regex to clipboard
  const copyRegex = useCallback(() => {
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [pattern, flags]);

  // Load common pattern
  const loadPattern = useCallback((patternName: string) => {
    setPattern(commonPatterns[patternName as keyof typeof commonPatterns]);
    setTestString('');
  }, []);

  // Toggle flag
  const toggleFlag = useCallback((flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  }, [flags]);

  return (
    <PluginWindow
      title="正则表达式测试器"
      icon="🔍"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="regex-tester-standalone"
      pluginId="regex-tester"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* Pattern Input */}
        <div className={styles.patternSection}>
          <div className={styles.patternHeader}>
            <label htmlFor="pattern" className={styles.label}>正则表达式</label>
            <div className={styles.regexDisplay}>
              <code className={styles.regexCode}>/{pattern || 'pattern'}/{flags}</code>
              {pattern && (
                <button onClick={copyRegex} className={styles.copyButton}>
                  {copied ? '✓' : '📋'}
                </button>
              )}
            </div>
          </div>
          <div className={styles.patternInput}>
            <span className={styles.slash}>/</span>
            <input
              id="pattern"
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className={styles.input}
              placeholder="输入正则表达式..."
              spellCheck={false}
            />
            <span className={styles.slash}>/</span>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className={styles.flagsInput}
              placeholder="flags"
              maxLength={5}
              spellCheck={false}
            />
          </div>

          {/* Flags */}
          <div className={styles.flags}>
            <button
              onClick={() => toggleFlag('g')}
              className={`${styles.flagButton} ${flags.includes('g') ? styles.active : ''}`}
              title="Global search"
            >
              g
            </button>
            <button
              onClick={() => toggleFlag('i')}
              className={`${styles.flagButton} ${flags.includes('i') ? styles.active : ''}`}
              title="Case-insensitive"
            >
              i
            </button>
            <button
              onClick={() => toggleFlag('m')}
              className={`${styles.flagButton} ${flags.includes('m') ? styles.active : ''}`}
              title="Multiline"
            >
              m
            </button>
            <button
              onClick={() => toggleFlag('s')}
              className={`${styles.flagButton} ${flags.includes('s') ? styles.active : ''}`}
              title="Dot matches newline"
            >
              s
            </button>
            <button
              onClick={() => toggleFlag('u')}
              className={`${styles.flagButton} ${flags.includes('u') ? styles.active : ''}`}
              title="Unicode"
            >
              u
            </button>
            <button
              onClick={() => toggleFlag('y')}
              className={`${styles.flagButton} ${flags.includes('y') ? styles.active : ''}`}
              title="Sticky"
            >
              y
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.error}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Test String */}
        <div className={styles.testSection}>
          <label htmlFor="testString" className={styles.label}>测试字符串</label>
          <textarea
            id="testString"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            className={styles.textarea}
            placeholder="在此输入要测试的文本..."
            rows={6}
          />
        </div>

        {/* Results */}
        <div className={styles.resultsSection}>
          <h3 className={styles.resultsTitle}>
            匹配结果
            {matches !== null && (
              <span className={styles.matchCount}>
                {matches.length} 个匹配
              </span>
            )}
          </h3>

          {matches === null ? (
            <p className={styles.placeholder}>输入正则表达式和测试字符串以开始</p>
          ) : matches.length === 0 ? (
            <p className={styles.noMatches}>未找到匹配</p>
          ) : (
            <>
              {/* Highlighted Text */}
              <div className={styles.highlighted}>
                {highlightedText}
              </div>

              {/* Match Details */}
              <div className={styles.matchesList}>
                {matches.map((match, index) => (
                  <div key={index} className={styles.matchItem}>
                    <div className={styles.matchHeader}>
                      <span className={styles.matchIndex}>匹配 #{index + 1}</span>
                      <span className={styles.matchPosition}>
                        位置: {match.index}
                      </span>
                    </div>
                    <code className={styles.matchValue}>{match.match}</code>
                    {match.groups.length > 0 && (
                      <div className={styles.groups}>
                        <span className={styles.groupsLabel}>捕获组:</span>
                        {match.groups.map((group, i) => (
                          <span key={i} className={styles.group}>
                            ${i + 1}: <code>{group || '(empty)'}</code>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Common Patterns */}
        <div className={styles.patternsLibrary}>
          <h3 className={styles.patternsTitle}>常用模式</h3>
          <div className={styles.patternButtons}>
            {Object.entries(commonPatterns).map(([name, patternValue]) => (
              <button
                key={name}
                onClick={() => loadPattern(name)}
                className={styles.patternButton}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PluginWindow>
  );
};

export default RegexTester;
