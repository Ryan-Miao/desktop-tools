import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Toast, { ToastContainer, useToast } from '../Toast/Toast';

describe('Toast Component', () => {
  describe('Basic Rendering', () => {
    it('renders toast message', () => {
      render(<Toast message="Test message" />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders with title when provided', () => {
      render(<Toast message="Test message" title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders info type by default', () => {
      const { container } = render(<Toast message="Test" />);
      const toast = container.querySelector('.toast');
      expect(toast).toHaveClass('toast-info');
    });

    it('renders success type correctly', () => {
      const { container } = render(<Toast type="success" message="Success!" />);
      const toast = container.querySelector('.toast');
      expect(toast).toHaveClass('toast-success');
    });

    it('renders error type correctly', () => {
      const { container } = render(<Toast type="error" message="Error!" />);
      const toast = container.querySelector('.toast');
      expect(toast).toHaveClass('toast-error');
    });

    it('renders warning type correctly', () => {
      const { container } = render(<Toast type="warning" message="Warning!" />);
      const toast = container.querySelector('.toast');
      expect(toast).toHaveClass('toast-warning');
    });
  });

  describe('Icons', () => {
    it('shows icon by default', () => {
      const { container } = render(<Toast type="success" message="Test" />);
      const icon = container.querySelector('.toast-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent('✓');
    });

    it('does not show icon when showIcon is false', () => {
      const { container } = render(<Toast message="Test" showIcon={false} />);
      const icon = container.querySelector('.toast-icon');
      expect(icon).not.toBeInTheDocument();
    });

    it('shows correct icon for each type', () => {
      const { container: container1 } = render(<Toast type="success" message="Test" />);
      expect(container1.querySelector('.toast-icon')).toHaveTextContent('✓');

      const { container: container2 } = render(<Toast type="error" message="Test" />);
      expect(container2.querySelector('.toast-icon')).toHaveTextContent('✕');

      const { container: container3 } = render(<Toast type="warning" message="Test" />);
      expect(container3.querySelector('.toast-icon')).toHaveTextContent('⚠');

      const { container: container4 } = render(<Toast type="info" message="Test" />);
      expect(container4.querySelector('.toast-icon')).toHaveTextContent('ℹ');
    });
  });

  describe('Auto Close', () => {
    it('auto closes after duration', async () => {
      const onClose = vi.fn();
      render(<Toast message="Test" duration={100} onClose={onClose} />);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      }, { timeout: 500 });
    });

    it('does not auto close when duration is 0', async () => {
      const onClose = vi.fn();
      render(<Toast message="Test" duration={0} onClose={onClose} />);

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('uses default duration of 3000ms', async () => {
      const onClose = vi.fn();
      render(<Toast message="Test" onClose={onClose} />);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      }, { timeout: 3500 });
    });
  });

  describe('Manual Close', () => {
    it('closes when close button is clicked', async () => {
      const onClose = vi.fn();
      const { container } = render(<Toast message="Test" onClose={onClose} />);

      const closeButton = container.querySelector('.toast-close');
      expect(closeButton).toBeInTheDocument();

      fireEvent.click(closeButton!);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      }, { timeout: 500 });
    });
  });

  describe('Action Button', () => {
    it('renders action button when provided', () => {
      const action = {
        label: 'Undo',
        onClick: vi.fn()
      };
      const { container } = render(<Toast message="Test" action={action} />);

      const actionButton = container.querySelector('.toast-action');
      expect(actionButton).toBeInTheDocument();
      expect(actionButton).toHaveTextContent('Undo');
    });

    it('calls action handler when clicked', async () => {
      const action = {
        label: 'Undo',
        onClick: vi.fn()
      };
      const onClose = vi.fn();
      const { container } = render(<Toast message="Test" action={action} onClose={onClose} />);

      const actionButton = container.querySelector('.toast-action')!;
      fireEvent.click(actionButton);

      expect(action.onClick).toHaveBeenCalled();

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      }, { timeout: 500 });
    });
  });

  describe('ToastContainer', () => {
    it('renders multiple toasts', () => {
      const toasts = [
        { id: '1', type: 'success' as const, message: 'Success message' },
        { id: '2', type: 'error' as const, message: 'Error message' },
        { id: '3', type: 'info' as const, message: 'Info message' }
      ];
      const onRemove = vi.fn();

      render(<ToastContainer toasts={toasts} onRemove={onRemove} />);

      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });

    it('renders empty container when no toasts', () => {
      const { container } = render(<ToastContainer toasts={[]} onRemove={vi.fn()} />);
      const toastContainer = container.querySelector('.toast-container');
      expect(toastContainer).toBeInTheDocument();
      expect(toastContainer?.children.length).toBe(0);
    });
  });

  describe('useToast Hook', () => {
    it('shows toast with show method', () => {
      const TestComponent = () => {
        const { show, toasts } = useToast();

        return (
          <div>
            <button onClick={() => show('Test message')}>Show Toast</button>
            <ToastContainer toasts={toasts} onRemove={vi.fn()} />
          </div>
        );
      };

      render(<TestComponent />);

      fireEvent.click(screen.getByText('Show Toast'));

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('shows success toast with success method', () => {
      const TestComponent = () => {
        const { success, toasts } = useToast();

        return (
          <div>
            <button onClick={() => success('Success message')}>Show Success</button>
            <ToastContainer toasts={toasts} onRemove={vi.fn()} />
          </div>
        );
      };

      render(<TestComponent />);

      fireEvent.click(screen.getByText('Show Success'));

      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('shows error toast with error method', () => {
      const TestComponent = () => {
        const { error, toasts } = useToast();

        return (
          <div>
            <button onClick={() => error('Error message')}>Show Error</button>
            <ToastContainer toasts={toasts} onRemove={vi.fn()} />
          </div>
        );
      };

      render(<TestComponent />);

      fireEvent.click(screen.getByText('Show Error'));

      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });
});
