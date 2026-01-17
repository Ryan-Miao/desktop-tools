import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading, { FullscreenLoading, SmallLoading, DotsLoading } from '../Loading/Loading';

describe('Loading Component', () => {
  describe('Basic Rendering', () => {
    it('renders spinner type by default', () => {
      const { container } = render(<Loading />);
      const loadingElement = container.querySelector('.loading');
      expect(loadingElement).toBeInTheDocument();
      expect(loadingElement).toHaveClass('loading-spinner');
    });

    it('renders dots type correctly', () => {
      const { container } = render(<Loading type="dots" />);
      const loadingElement = container.querySelector('.loading');
      expect(loadingElement).toBeInTheDocument();
      expect(loadingElement).toHaveClass('loading-dots');
      const dots = container.querySelectorAll('.dot');
      expect(dots).toHaveLength(3);
    });

    it('renders pulse type correctly', () => {
      const { container } = render(<Loading type="pulse" />);
      const loadingElement = container.querySelector('.loading');
      expect(loadingElement).toBeInTheDocument();
      expect(loadingElement).toHaveClass('loading-pulse');
      const rings = container.querySelectorAll('.pulse-ring');
      expect(rings).toHaveLength(3);
    });

    it('renders bar type correctly', () => {
      const { container } = render(<Loading type="bar" />);
      const loadingElement = container.querySelector('.loading');
      expect(loadingElement).toBeInTheDocument();
      expect(loadingElement).toHaveClass('loading-bar');
      const bar = container.querySelector('.bar-track');
      expect(bar).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders medium size by default', () => {
      const { container } = render(<Loading />);
      const loadingElement = container.querySelector('.loading');
      expect(loadingElement).toHaveClass('loading-medium');
    });

    it('renders small size when specified', () => {
      const { container } = render(<Loading size="small" />);
      const loadingElement = container.querySelector('.loading');
      expect(loadingElement).toHaveClass('loading-small');
    });

    it('renders large size when specified', () => {
      const { container } = render(<Loading size="large" />);
      const loadingElement = container.querySelector('.loading');
      expect(loadingElement).toHaveClass('loading-large');
    });
  });

  describe('Text Display', () => {
    it('displays custom text', () => {
      render(<Loading type="spinner" text="Loading..." />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('does not display text element when not provided', () => {
      const { container } = render(<Loading type="spinner" />);
      const textElement = container.querySelector('.loading-text');
      expect(textElement).not.toBeInTheDocument();
    });

    it('displays empty text when empty string provided', () => {
      const { container } = render(<Loading type="spinner" text="" />);
      const textElement = container.querySelector('.loading-text');
      expect(textElement).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<Loading className="custom-class" />);
      const loadingElement = container.querySelector('.loading');
      expect(loadingElement).toHaveClass('custom-class');
    });

    it('applies custom color to spinner rings', () => {
      const color = '#ff0000';
      const { container } = render(<Loading type="spinner" color={color} />);
      const rings = container.querySelectorAll('.spinner-ring');
      rings.forEach(ring => {
        expect(ring).toHaveStyle({ borderColor: color });
      });
    });

    it('applies custom color to dots', () => {
      const color = '#00ff00';
      const { container } = render(<Loading type="dots" color={color} />);
      const dots = container.querySelectorAll('.dot');
      dots.forEach(dot => {
        expect(dot).toHaveStyle({ backgroundColor: color });
      });
    });
  });

  describe('Fullscreen Mode', () => {
    it('renders fullscreen wrapper when fullscreen prop is true', () => {
      const { container } = render(<Loading fullscreen />);
      const fullscreenElement = container.querySelector('.loading-fullscreen');
      expect(fullscreenElement).toBeInTheDocument();
    });

    it('renders overlay when fullscreen and overlay props are true', () => {
      const { container } = render(<Loading fullscreen overlay />);
      const overlayElement = container.querySelector('.loading-overlay');
      expect(overlayElement).toBeInTheDocument();
    });

    it('does not render overlay when overlay prop is false', () => {
      const { container } = render(<Loading fullscreen overlay={false} />);
      const overlayElement = container.querySelector('.loading-overlay');
      expect(overlayElement).not.toBeInTheDocument();
    });
  });

  describe('Shortcut Components', () => {
    it('FullscreenLoading renders with fullscreen and overlay', () => {
      const { container } = render(<FullscreenLoading type="spinner" />);
      const fullscreenElement = container.querySelector('.loading-fullscreen');
      const overlayElement = container.querySelector('.loading-overlay');
      expect(fullscreenElement).toBeInTheDocument();
      expect(overlayElement).toBeInTheDocument();
    });

    it('SmallLoading renders with small size', () => {
      const { container } = render(<SmallLoading />);
      const loadingElement = container.querySelector('.loading');
      expect(loadingElement).toHaveClass('loading-small');
    });

    it('DotsLoading renders with dots type', () => {
      const { container } = render(<DotsLoading />);
      const loadingElement = container.querySelector('.loading');
      expect(loadingElement).toHaveClass('loading-dots');
    });

    it('shortcut components accept additional props', () => {
      render(<SmallLoading text="Small loading..." />);
      expect(screen.getByText('Small loading...')).toBeInTheDocument();
    });
  });

  describe('Spinner Structure', () => {
    it('renders 4 spinner rings for spinner type', () => {
      const { container } = render(<Loading type="spinner" />);
      const rings = container.querySelectorAll('.spinner-ring');
      expect(rings).toHaveLength(4);
    });
  });

  describe('Combined Props', () => {
    it('combines size, type, and custom class correctly', () => {
      const { container } = render(<Loading type="dots" size="large" className="my-loading" />);
      const loadingElement = container.querySelector('.loading');
      expect(loadingElement).toHaveClass('loading', 'loading-large', 'loading-dots', 'my-loading');
    });

    it('renders fullscreen with text and custom color', () => {
      const color = '#0000ff';
      render(<FullscreenLoading type="pulse" text="Loading data..." color={color} />);
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
      const rings = document.querySelectorAll('.pulse-ring');
      rings.forEach(ring => {
        expect(ring).toHaveStyle({ borderColor: color });
      });
    });
  });
});
