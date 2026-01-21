/**
 * 集成测试模板
 *
 * 使用说明：
 * 1. 复制此文件到测试目录
 * 2. 重命名为 <Feature>.integration.test.ts
 * 3. 替换所有TODO和占位符
 * 4. 根据被测试的功能调整测试场景
 *
 * 集成测试用于验证多个模块之间的协作和端到端的工作流程
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * 导入被测试的模块/组件
 */
import TODO_REPLACE_WITH_YOUR_COMPONENT from './TODO_REPLACE_WITH_PATH';
import { useYourStore } from './store/todoStore';

/**
 * 集成测试套件
 */
describe('TODO_ReplaceWithFeatureName - Integration Tests', () => {
  /**
   * 每个测试前的设置
   */
  beforeEach(() => {
    // 清理所有mocks
    vi.clearAllMocks();

    // 重置store状态
    const store = useYourStore.getState();
    store.reset();
  });

  /**
   * 每个测试后的清理
   */
  afterEach(() => {
    // 清理DOM
    document.body.innerHTML = '';
  });

  /**
   * 用户工作流程测试
   * 模拟完整的用户操作流程
   */
  describe('用户工作流程', () => {
    it('should complete full user workflow', async () => {
      // 渲染组件
      render(<TODO_REPLACE_WITH_YOUR_COMPONENT />);

      // 步骤1: 用户打开界面
      expect(screen.getByText(/TODO_TITLE/)).toBeInTheDocument();

      // 步骤2: 用户输入数据
      const input = screen.getByPlaceholderText(/TODO_PLACEHOLDER/);
      fireEvent.change(input, { target: { value: 'test data' } });
      expect(input).toHaveValue('test data');

      // 步骤3: 用户点击操作
      const button = screen.getByRole('button', { name: /TODO_BUTTON_NAME/ });
      fireEvent.click(button);

      // 步骤4: 验证结果
      await waitFor(() => {
        expect(screen.getByText(/EXPECTED_RESULT/)).toBeInTheDocument();
      });
    });
  });

  /**
   * 多模块协作测试
   * 验证多个组件/服务之间的协作
   */
  describe('模块协作', () => {
    it('should integrate component A with component B', async () => {
      // 渲染父组件
      render(
        <ParentComponent>
          <ComponentA />
          <ComponentB />
        </ParentComponent>
      );

      // 在ComponentA中执行操作
      const buttonA = screen.getByTestId('component-a-button');
      fireEvent.click(buttonA);

      // 验证ComponentB收到更新
      await waitFor(() => {
        const resultB = screen.getByTestId('component-b-result');
        expect(resultB).toHaveTextContent('updated');
      });
    });

    it('should pass data through service layer', async () => {
      const testData = { id: 1, name: 'test' };

      // 通过API创建数据
      await apiService.create(testData);

      // 验证数据在UI中显示
      render(<TODO_REPLACE_WITH_YOUR_COMPONENT />);

      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument();
      });
    });
  });

  /**
   * 状态管理集成测试
   * 验证状态在不同组件间的同步
   */
  describe('状态管理集成', () => {
    it('should sync state across components', async () => {
      const { rerender } = render(<ComponentA />);
      const store = useYourStore.getState();

      // 在组件A中更新状态
      const button = screen.getByTestId('update-button');
      fireEvent.click(button);

      // 验证store状态更新
      expect(store.data).toEqual('updated');

      // 渲染组件B，验证它收到更新
      rerender(<ComponentB />);
      expect(screen.getByTestId('component-b-display')).toHaveTextContent('updated');
    });
  });

  /**
   * 异步工作流程测试
   * 验证包含API调用、数据库操作的完整流程
   */
  describe('异步工作流程', () => {
    it('should handle async data loading workflow', async () => {
      render(<TODO_REPLACE_WITH_YOUR_COMPONENT />);

      // 初始状态：加载中
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // 等待数据加载完成
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // 验证数据显示
      expect(screen.getByTestId('data-display')).toBeInTheDocument();
    });

    it('should handle error in async workflow', async () => {
      // Mock API错误
      vi.spyOn(apiService, 'fetch').mockRejectedValue(new Error('Network error'));

      render(<TODO_REPLACE_WITH_YOUR_COMPONENT />);

      // 等待错误显示
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  /**
   * 数据持久化集成测试
   * 验证数据在不同存储层间的流动
   */
  describe('数据持久化', () => {
    it('should persist data to storage', async () => {
      const testData = { id: 1, value: 'test' };

      render(<TODO_REPLACE_WITH_YOUR_COMPONENT />);

      // 创建数据
      await act(async () => {
        await store.create(testData);
      });

      // 验证数据已保存
      const savedData = await storageService.get(1);
      expect(savedData).toEqual(testData);

      // 重新加载，验证数据恢复
      render(<TODO_REPLACE_WITH_YOUR_COMPONENT />);
      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });

  /**
   * 表单提交集成测试
   * 验证完整的表单提交流程
   */
  describe('表单提交', () => {
    it('should submit form with validation', async () => {
      render(<TODO_REPLACE_WITH_YOUR_COMPONENT />);

      // 填写表单
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      // 提交表单
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      // 验证提交
      await waitFor(() => {
        expect(apiService.submit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
        });
      });

      // 验证成功消息
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });

    it('should show validation errors', async () => {
      render(<TODO_REPLACE_WITH_YOUR_COMPONENT />);

      // 提交空表单
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      // 验证错误消息
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });
  });

  /**
   * 导航集成测试
   * 验证应用内导航和路由
   */
  describe('导航集成', () => {
    it('should navigate between pages', async () => {
      render(<App />);

      // 点击导航链接
      const link = screen.getByRole('link', { name: /settings/i });
      fireEvent.click(link);

      // 验证路由变化
      await waitFor(() => {
        expect(screen.getByText(/settings page/i)).toBeInTheDocument();
      });
    });
  });

  /**
   * 错误恢复集成测试
   * 验证错误后的恢复流程
   */
  describe('错误恢复', () => {
    it('should recover from network error', async () => {
      // 模拟网络错误
      vi.spyOn(apiService, 'fetch')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: 'recovered' });

      render(<TODO_REPLACE_WITH_YOUR_COMPONENT />);

      // 等待错误显示
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // 点击重试按钮
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // 验证恢复成功
      await waitFor(() => {
        expect(screen.getByText('recovered')).toBeInTheDocument();
      });
    });
  });

  /**
   * 性能集成测试
   * 验证实际使用场景中的性能
   */
  describe('性能测试', () => {
    it('should render large dataset within acceptable time', async () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      }));

      render(<TODO_REPLACE_WITH_YOUR_COMPONENT data={largeData} />);

      const startTime = performance.now();

      await waitFor(() => {
        expect(screen.getAllByTestId(/item-/)).toHaveLength(10000);
      });

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(1000); // 应在1秒内完成
    });
  });

  /**
   * 并发操作测试
   * 验证同时进行多个操作的行为
   */
  describe('并发操作', () => {
    it('should handle multiple simultaneous updates', async () => {
      render(<TODO_REPLACE_WITH_YOUR_COMPONENT />);

      // 同时触发多个更新
      const promises = Array.from({ length: 5 }, (_, i) =>
        act(async () => {
          await store.update({ id: i, value: `update-${i}` });
        })
      );

      await Promise.all(promises);

      // 验证所有更新都成功
      const items = screen.getAllByTestId(/item-/);
      expect(items).toHaveLength(5);
    });
  });

  /**
   * 生命周期集成测试
   * 验证组件/服务的完整生命周期
   */
  describe('生命周期', () => {
    it('should initialize and cleanup correctly', async () => {
      const { unmount } = render(<TODO_REPLACE_WITH_YOUR_COMPONENT />);

      // 验证初始化
      expect(screen.getByTestId('initialized')).toBeInTheDocument();

      // 卸载组件
      unmount();

      // 验证清理
      expect(document.body.innerHTML).toBe('');
    });
  });
});

/**
 * 集成测试最佳实践：
 *
 * 1. 测试真实场景：
 *    - 模拟实际用户操作流程
 *    - 测试多个组件的协作
 *    - 验证端到端的工作流程
 *
 * 2. 避免过度Mock：
 *    - 只mock外部服务（API、数据库）
 *    - 不要mock应用内部模块
 *    - 让测试尽可能接近真实环境
 *
 * 3. 测试状态同步：
 *    - 验证状态在不同组件间的传播
 *    - 测试store/service的集成
 *    - 检查副作用的正确性
 *
 * 4. 异步处理：
 *    - 使用waitFor等待异步操作
 *    - 测试加载状态
 *    - 验证错误处理
 *
 * 5. 用户体验：
 *    - 测试完整的用户场景
 *    - 验证错误恢复
 *    - 检查性能表现
 *
 * 6. 测试隔离：
 *    - 每个测试独立运行
 *    - beforeEach/afterEach清理
 *    - 避免测试间的状态污染
 */
