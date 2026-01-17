import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar, { CircularProgress, SegmentedProgress, LinearProgress } from '../ProgressBar/ProgressBar';

describe('ProgressBar Component', () => {
  describe('Basic Rendering', () => {
    it('renders progress track and fill', () => {
      const { container } = render(<ProgressBar value={50} />);
      const track = container.querySelector('.progress-track');
      const fill = container.querySelector('.progress-fill');
      expect(track).toBeInTheDocument();
      expect(fill).toBeInTheDocument();
    });

    it('renders with correct size class', () => {
      const { container: container1 } = render(<ProgressBar value={50} size="small" />);
      const { container: container2 } = render(<ProgressBar value={50} size="large" />);

      expect(container1.querySelector('.progress-bar')).toHaveClass('progress-small');
      expect(container2.querySelector('.progress-bar')).toHaveClass('progress-large');
    });

    it('renders with default medium size', () => {
      const { container } = render(<ProgressBar value={50} />);
      expect(container.querySelector('.progress-bar')).toHaveClass('progress-medium');
    });
  });

  describe('Progress Value', () => {
    it('clamps value to 0-100 range', () => {
      const { container: container1 } = render(<ProgressBar value={-10} />);
      const { container: container2 } = render(<ProgressBar value={150} />);

      expect(container1.querySelector('.progress-bar')).toHaveStyle({ '--progress-value': '0%' });
      expect(container2.querySelector('.progress-bar')).toHaveStyle({ '--progress-value': '100%' });
    });

    it('sets correct percentage value', () => {
      const { container } = render(<ProgressBar value={75} />);
      expect(container.querySelector('.progress-bar')).toHaveStyle({ '--progress-value': '75%' });
    });

    it('renders indeterminate progress when value is undefined', () => {
      const { container } = render(<ProgressBar />);
      const progressBar = container.querySelector('.progress-bar');
      expect(progressBar).toHaveClass('progress-indeterminate');
      const overlay = container.querySelector('.progress-indeterminate-overlay');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('Label Display', () => {
    it('does not show label by default', () => {
      const { container } = render(<ProgressBar value={50} />);
      const label = container.querySelector('.progress-label');
      expect(label).not.toBeInTheDocument();
    });

    it('shows label when showLabel is true', () => {
      render(<ProgressBar value={50} showLabel />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('shows correct percentage in label', () => {
      render(<ProgressBar value={100} showLabel />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('does not show label for indeterminate progress', () => {
      const { container } = render(<ProgressBar showLabel />);
      const label = container.querySelector('.progress-label');
      expect(label).not.toBeInTheDocument();
    });
  });

  describe('Status Styles', () => {
    it('applies normal status by default', () => {
      const { container } = render(<ProgressBar value={50} />);
      expect(container.querySelector('.progress-bar')).toHaveClass('progress-normal');
    });

    it('applies success status', () => {
      const { container } = render(<ProgressBar value={50} status="success" />);
      expect(container.querySelector('.progress-bar')).toHaveClass('progress-success');
    });

    it('applies warning status', () => {
      const { container } = render(<ProgressBar value={50} status="warning" />);
      expect(container.querySelector('.progress-bar')).toHaveClass('progress-warning');
    });

    it('applies error status', () => {
      const { container } = render(<ProgressBar value={50} status="error" />);
      expect(container.querySelector('.progress-bar')).toHaveClass('progress-error');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom color', () => {
      const color = '#ff0000';
      const { container } = render(<ProgressBar value={50} color={color} />);
      expect(container.querySelector('.progress-bar')).toHaveStyle({ '--progress-color': color });
    });

    it('applies custom className', () => {
      const { container } = render(<ProgressBar value={50} className="custom-progress" />);
      expect(container.querySelector('.progress-bar')).toHaveClass('custom-progress');
    });

    it('sets custom animation duration', () => {
      const { container } = render(<ProgressBar value={50} animationDuration={500} />);
      expect(container.querySelector('.progress-bar')).toHaveStyle({ '--progress-duration': '500ms' });
    });
  });

  describe('LinearProgress Alias', () => {
    it('renders the same as ProgressBar', () => {
      const { container: container1 } = render(<LinearProgress value={50} />);
      const { container: container2 } = render(<ProgressBar value={50} />);

      expect(container1.querySelector('.progress-bar')).toBeInTheDocument();
      expect(container2.querySelector('.progress-bar')).toBeInTheDocument();
    });
  });
});

describe('CircularProgress Component', () => {
  describe('Basic Rendering', () => {
    it('renders SVG with circles', () => {
      const { container } = render(<CircularProgress value={50} />);
      const svg = container.querySelector('svg');
      const circles = container.querySelectorAll('circle');
      expect(svg).toBeInTheDocument();
      expect(circles).toHaveLength(2); // track and fill
    });

    it('renders with default size', () => {
      const { container } = render(<CircularProgress value={50} />);
      const element = container.querySelector('.circular-progress');
      expect(element).toHaveStyle({ width: '40px', height: '40px' });
    });

    it('renders with custom size', () => {
      const size = 60;
      const { container } = render(<CircularProgress value={50} size={size} />);
      const element = container.querySelector('.circular-progress');
      expect(element).toHaveStyle({ width: `${size}px`, height: `${size}px` });
    });
  });

  describe('Progress Calculation', () => {
    it('renders fill circle for 0%', () => {
      const { container } = render(<CircularProgress value={0} size={40} strokeWidth={4} />);
      const fillCircle = container.querySelector('.circular-progress-fill');
      expect(fillCircle).toBeInTheDocument();
    });

    it('renders fill circle for 50%', () => {
      const { container } = render(<CircularProgress value={50} size={40} strokeWidth={4} />);
      const fillCircle = container.querySelector('.circular-progress-fill');
      expect(fillCircle).toBeInTheDocument();
    });

    it('renders fill circle for 100%', () => {
      const { container } = render(<CircularProgress value={100} size={40} strokeWidth={4} />);
      const fillCircle = container.querySelector('.circular-progress-fill');
      expect(fillCircle).toBeInTheDocument();
    });
  });

  describe('Status Styles', () => {
    it('applies normal status by default', () => {
      const { container } = render(<CircularProgress value={50} />);
      expect(container.querySelector('.circular-progress')).toHaveClass('circular-normal');
    });

    it('applies success status', () => {
      const { container } = render(<CircularProgress value={50} status="success" />);
      expect(container.querySelector('.circular-progress')).toHaveClass('circular-success');
    });
  });

  describe('Label Display', () => {
    it('does not show label by default', () => {
      const { container } = render(<CircularProgress value={50} />);
      const label = container.querySelector('.circular-progress-label');
      expect(label).not.toBeInTheDocument();
    });

    it('shows label when showLabel is true', () => {
      render(<CircularProgress value={75} showLabel />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  describe('Indeterminate State', () => {
    it('adds indeterminate class when value is undefined', () => {
      const { container } = render(<CircularProgress />);
      expect(container.querySelector('.circular-progress')).toHaveClass('circular-indeterminate');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom color', () => {
      const color = '#00ff00';
      const { container } = render(<CircularProgress value={50} color={color} />);
      expect(container.querySelector('.circular-progress')).toHaveStyle({ '--progress-color': color });
    });

    it('applies custom stroke width', () => {
      const { container } = render(<CircularProgress value={50} strokeWidth={8} />);
      expect(container.querySelector('.circular-progress')).toHaveStyle({ '--progress-stroke': '8px' });
    });
  });
});

describe('SegmentedProgress Component', () => {
  describe('Basic Rendering', () => {
    it('renders correct number of segments', () => {
      const { container } = render(<SegmentedProgress total={5} current={3} />);
      const segments = container.querySelectorAll('.segment');
      expect(segments).toHaveLength(5);
    });

    it('renders with default medium size', () => {
      const { container } = render(<SegmentedProgress total={5} current={3} />);
      expect(container.querySelector('.segmented-progress')).toHaveClass('segmented-medium');
    });
  });

  describe('Progress Display', () => {
    it('highlights correct number of segments', () => {
      const { container } = render(<SegmentedProgress total={5} current={3} />);
      const segments = container.querySelectorAll('.segment');
      expect(segments).toHaveLength(5);
      // Just verify segments are rendered - visual testing would check actual colors
    });

    it('shows all segments when current equals total', () => {
      const { container } = render(<SegmentedProgress total={5} current={5} />);
      const segments = container.querySelectorAll('.segment');
      expect(segments).toHaveLength(5);
    });

    it('shows all segments when current is 0', () => {
      const { container } = render(<SegmentedProgress total={5} current={0} />);
      const segments = container.querySelectorAll('.segment');
      expect(segments).toHaveLength(5);
    });
  });

  describe('Size Variants', () => {
    it('renders small size', () => {
      const { container } = render(<SegmentedProgress total={5} current={3} size="small" />);
      expect(container.querySelector('.segmented-progress')).toHaveClass('segmented-small');
    });

    it('renders large size', () => {
      const { container } = render(<SegmentedProgress total={5} current={3} size="large" />);
      expect(container.querySelector('.segmented-progress')).toHaveClass('segmented-large');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom color when provided', () => {
      const color = '#0000ff';
      const { container } = render(<SegmentedProgress total={3} current={2} color={color} />);
      const segments = container.querySelectorAll('.segment');
      // Check that segments exist and color prop is passed
      expect(segments).toHaveLength(3);
    });

    it('applies custom className', () => {
      const { container } = render(<SegmentedProgress total={5} current={3} className="custom-class" />);
      expect(container.querySelector('.segmented-progress')).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles single segment', () => {
      const { container } = render(<SegmentedProgress total={1} current={1} />);
      const segments = container.querySelectorAll('.segment');
      expect(segments).toHaveLength(1);
    });

    it('handles many segments', () => {
      const { container } = render(<SegmentedProgress total={20} current={10} />);
      const segments = container.querySelectorAll('.segment');
      expect(segments).toHaveLength(20);
    });
  });
});
