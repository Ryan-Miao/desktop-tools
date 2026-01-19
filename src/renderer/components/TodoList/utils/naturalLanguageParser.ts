import { format, addDays, startOfWeek, parse } from 'date-fns';

export interface ParsedTodoInput {
  text: string;
  dueDate?: string;
  dueTime?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

// 中文日期映射
const datePatterns: Record<string, () => Date> = {
  '今天': () => new Date(),
  '明天': () => addDays(new Date(), 1),
  '后天': () => addDays(new Date(), 2),
  '大后天': () => addDays(new Date(), 3),
  '周一': () => getNextWeekday(1),
  '周二': () => getNextWeekday(2),
  '周三': () => getNextWeekday(3),
  '周四': () => getNextWeekday(4),
  '周五': () => getNextWeekday(5),
  '周六': () => getNextWeekday(6),
  '周日': () => getNextWeekday(0),
  '星期一': () => getNextWeekday(1),
  '星期二': () => getNextWeekday(2),
  '星期三': () => getNextWeekday(3),
  '星期四': () => getNextWeekday(4),
  '星期五': () => getNextWeekday(5),
  '星期六': () => getNextWeekday(6),
  '星期日': () => getNextWeekday(0),
};

// 时间模式
const timePatterns: Array<{
  pattern: RegExp;
  replace: string | ((match: string) => string);
}> = [
  { pattern: /上午([0-9]+点)/, replace: '$1:00' },
  {
    pattern: /下午([0-9]+点)/,
    replace: (match: string) => {
      const hour = parseInt(match.replace('下午', '').replace('点', ''));
      return `${hour + 12}:00`;
    },
  },
  {
    pattern: /晚上([0-9]+点)/,
    replace: (match: string) => {
      const hour = parseInt(match.replace('晚上', '').replace('点', ''));
      return `${hour + 12}:00`;
    },
  },
  { pattern: /([0-9]+点)/, replace: '$1:00' },
  { pattern: /([0-9]+:[0-9]+)/, replace: '$1' },
];

// 优先级模式
const priorityPatterns: Record<string, 'low' | 'medium' | 'high'> = {
  '!高': 'high',
  '!中': 'medium',
  '!低': 'low',
  '高优先级': 'high',
  '中优先级': 'medium',
  '低优先级': 'low',
  '紧急': 'high',
  '重要': 'high',
  '普通': 'medium',
  '暂缓': 'low',
};

// 获取下一个星期X
function getNextWeekday(day: number): Date {
  const today = new Date();
  const currentDay = today.getDay();
  const distance = (day + 7 - currentDay) % 7 || 7;
  return addDays(today, distance);
}

// 解析日期
function parseDate(input: string): Date | null {
  // 首先检查直接日期模式
  const dateMatch = input.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // 检查中文日期关键词
  for (const [keyword, dateFunc] of Object.entries(datePatterns)) {
    if (input.includes(keyword)) {
      return dateFunc();
    }
  }

  // 检查"下周X"模式
  const nextWeekMatch = input.match(/下周([一二三四五六七天日])/);
  if (nextWeekMatch) {
    const weekdayMap: Record<string, number> = {
      '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 0, '天': 0,
    };
    const day = weekdayMap[nextWeekMatch[1]];
    const today = new Date();
    const currentDay = today.getDay();
    const distance = (day + 7 - currentDay) % 7 + 7;
    return addDays(today, distance);
  }

  return null;
}

// 解析时间
function parseTime(input: string): string | null {
  for (const { pattern, replace } of timePatterns) {
    if (pattern.test(input)) {
      if (typeof replace === 'string') {
        return input.replace(pattern, replace);
      } else {
        const match = input.match(pattern);
        if (match) return replace(match[0]);
      }
    }
  }

  // 检查 "HH:MM" 格式
  const timeMatch = input.match(/([0-9]{1,2}):([0-9]{2})/);
  if (timeMatch) {
    return `${timeMatch[1]}:${timeMatch[2]}`;
  }

  return null;
}

// 解析分类 (支持 #分类)
function parseCategory(input: string): string | null {
  // 匹配 #分类名
  const hashTagMatch = input.match(/#([\u4e00-\u9fa5a-zA-Z0-9]+)/g);
  if (hashTagMatch && hashTagMatch.length > 0) {
    return hashTagMatch[0].replace('#', '');
  }

  return null;
}

// 解析优先级
function parsePriority(input: string): 'low' | 'medium' | 'high' | null {
  for (const [pattern, priority] of Object.entries(priorityPatterns)) {
    if (input.includes(pattern)) {
      return priority;
    }
  }
  return null;
}

// 提取纯文本（移除所有特殊标记）
function extractPlainText(input: string): string {
  let text = input;

  // 移除分类标签
  text = text.replace(/#[\u4e00-\u9fa5a-zA-Z0-9]+/g, '');

  // 移除优先级标记
  for (const pattern of Object.keys(priorityPatterns)) {
    text = text.replace(new RegExp(pattern, 'g'), '');
  }

  // 移除日期关键词
  for (const keyword of Object.keys(datePatterns)) {
    text = text.replace(new RegExp(keyword, 'g'), '');
  }

  // 移除"下周X"模式
  text = text.replace(/下周[一二三四五六七天日]/g, '');

  // 移除时间关键词
  text = text.replace(/[上下]午?[0-9]+点?/g, '');
  text = text.replace(/晚上[0-9]+点?/g, '');
  text = text.replace(/[0-9]+:[0-9]+/g, '');

  // 清理多余空格
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

// 主解析函数
export function parseNaturalLanguageInput(input: string): ParsedTodoInput {
  const result: ParsedTodoInput = {
    text: extractPlainText(input),
  };

  // 解析日期
  const parsedDate = parseDate(input);
  if (parsedDate) {
    result.dueDate = format(parsedDate, 'yyyy-MM-dd');
  }

  // 解析时间
  const parsedTime = parseTime(input);
  if (parsedTime) {
    result.dueTime = parsedTime;
  }

  // 解析分类
  const parsedCategory = parseCategory(input);
  if (parsedCategory) {
    result.category = parsedCategory;
  }

  // 解析优先级
  const parsedPriority = parsePriority(input);
  if (parsedPriority) {
    result.priority = parsedPriority;
  }

  return result;
}

// 获取解析预览标签
export function getParsedPreview(input: string): string[] {
  const result: string[] = [];

  const parsed = parseNaturalLanguageInput(input);

  if (parsed.dueDate) {
    const date = new Date(parsed.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      result.push('📅 今天');
    } else {
      const tomorrow = addDays(today, 1);
      if (date.getTime() === tomorrow.getTime()) {
        result.push('📅 明天');
      } else {
        result.push(`📅 ${format(date, 'M月d日')}`);
      }
    }
  }

  if (parsed.dueTime) {
    result.push(`⏰ ${parsed.dueTime}`);
  }

  if (parsed.category) {
    result.push(`📁 ${parsed.category}`);
  }

  if (parsed.priority) {
    const priorityEmoji = {
      high: '🔴',
      medium: '🟡',
      low: '🟢',
    };
    result.push(priorityEmoji[parsed.priority]);
  }

  return result;
}
