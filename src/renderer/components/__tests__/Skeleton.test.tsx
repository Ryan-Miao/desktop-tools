import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Skeleton, {
  TextSkeleton,
  CardSkeleton,
  ListItemSkeleton,
  PluginCardSkeleton
} from '../Skeleton/Skeleton';

describe('Skeleton Component', () => {
  describe('Basic Rendering', () => {
    it('renders text variant by default', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('skeleton-text');
    });

    it('renders circle variant', () => {
      const { container } = render(<Skeleton variant="circle" />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveClass('skeleton-circle');
    });

    it('renders rect variant', () => {
      const { container } = render(<Skeleton variant="rect" />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveClass('skeleton-rect');
    });

    it('renders card variant', () => {
      const { container } = render(<Skeleton variant="card" />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveClass('skeleton-card');
    });

    it('renders list variant', () => {
      const { container } = render(<Skeleton variant="list" />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveClass('skeleton-list');
    });
  });

  describe('Animation', () => {
    it('has animation class by default', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveClass('skeleton-animate');
    });

    it('can disable animation', () => {
      const { container } = render(<Skeleton animate={false} />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).not.toHaveClass('skeleton-animate');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom width', () => {
      const { container } = render(<Skeleton width="200px" />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveStyle({ width: '200px' });
    });

    it('applies custom height', () => {
      const { container } = render(<Skeleton height="100px" />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveStyle({ height: '100px' });
    });

    it('applies custom borderRadius', () => {
      const { container } = render(<Skeleton borderRadius="8px" />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveStyle({ borderRadius: '8px' });
    });

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="custom-skeleton" />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveClass('custom-skeleton');
    });

    it('applies custom style', () => {
      const { container } = render(<Skeleton style={{ margin: '10px', padding: '5px' }} />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveStyle({ margin: '10px', padding: '5px' });
    });
  });

  describe('Complex Variants with Children', () => {
    it('card variant renders children', () => {
      const { container } = render(
        <Skeleton variant="card">
          <div className="test-child">Child content</div>
        </Skeleton>
      );
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('list variant renders children', () => {
      const { container } = render(
        <Skeleton variant="list">
          <div className="test-child">List item</div>
        </Skeleton>
      );
      expect(screen.getByText('List item')).toBeInTheDocument();
    });

    it('text variant does not render children', () => {
      const { container } = render(
        <Skeleton variant="text">
          <div>Should not render</div>
        </Skeleton>
      );
      expect(screen.queryByText('Should not render')).not.toBeInTheDocument();
    });
  });
});

describe('TextSkeleton Component', () => {
  it('renders default 3 lines', () => {
    const { container } = render(<TextSkeleton />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('renders custom number of lines', () => {
    const { container } = render(<TextSkeleton lines={5} />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons).toHaveLength(5);
  });

  it('last line has 60% width', () => {
    const { container } = render(<TextSkeleton lines={3} />);
    const skeletons = container.querySelectorAll('.skeleton');
    const lastSkeleton = skeletons[skeletons.length - 1];
    expect(lastSkeleton).toHaveStyle({ width: '60%' });
  });

  it('other lines have 100% width', () => {
    const { container } = render(<TextSkeleton lines={3} />);
    const skeletons = container.querySelectorAll('.skeleton');
    const firstSkeleton = skeletons[0];
    expect(firstSkeleton).toHaveStyle({ width: '100%' });
  });

  it('applies custom className', () => {
    const { container } = render(<TextSkeleton className="custom-text" />);
    const textGroup = container.querySelector('.skeleton-text-group');
    expect(textGroup).toHaveClass('custom-text');
  });

  it('renders single line', () => {
    const { container } = render(<TextSkeleton lines={1} />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons).toHaveLength(1);
  });
});

describe('CardSkeleton Component', () => {
  it('renders card structure', () => {
    const { container } = render(<CardSkeleton />);
    const card = container.querySelector('.skeleton-card');
    const header = container.querySelector('.skeleton-card-header');
    const body = container.querySelector('.skeleton-card-body');
    expect(card).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(body).toBeInTheDocument();
  });

  it('renders avatar circle', () => {
    const { container } = render(<CardSkeleton />);
    const circle = container.querySelector('.skeleton-circle');
    expect(circle).toBeInTheDocument();
  });

  it('renders title section with 2 text lines', () => {
    const { container } = render(<CardSkeleton />);
    const titleSection = container.querySelector('.skeleton-card-title');
    const textLines = titleSection?.querySelectorAll('.skeleton');
    expect(textLines).toHaveLength(2);
  });

  it('renders body with rect skeleton', () => {
    const { container } = render(<CardSkeleton />);
    const rect = container.querySelector('.skeleton-card-body .skeleton-rect');
    expect(rect).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<CardSkeleton className="custom-card" />);
    const card = container.querySelector('.skeleton-card');
    expect(card).toHaveClass('custom-card');
  });
});

describe('ListItemSkeleton Component', () => {
  it('renders list item structure', () => {
    const { container } = render(<ListItemSkeleton />);
    const listItem = container.querySelector('.skeleton-list-item');
    const content = container.querySelector('.skeleton-list-content');
    expect(listItem).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it('renders avatar circle with 48px size', () => {
    const { container } = render(<ListItemSkeleton />);
    const circle = container.querySelector('.skeleton-list-item .skeleton-circle');
    expect(circle).toHaveStyle({ width: '48px', height: '48px' });
  });

  it('renders content with 2 text lines', () => {
    const { container } = render(<ListItemSkeleton />);
    const textLines = container.querySelectorAll('.skeleton-list-content .skeleton');
    expect(textLines).toHaveLength(2);
  });

  it('first text line has 70% width', () => {
    const { container } = render(<ListItemSkeleton />);
    const textLines = container.querySelectorAll('.skeleton-list-content .skeleton');
    const firstLine = textLines[0];
    expect(firstLine).toHaveStyle({ width: '70%' });
  });

  it('second text line has 40% width', () => {
    const { container } = render(<ListItemSkeleton />);
    const textLines = container.querySelectorAll('.skeleton-list-content .skeleton');
    const secondLine = textLines[1];
    expect(secondLine).toHaveStyle({ width: '40%' });
  });

  it('applies custom className', () => {
    const { container } = render(<ListItemSkeleton className="custom-list" />);
    const listItem = container.querySelector('.skeleton-list-item');
    expect(listItem).toHaveClass('custom-list');
  });
});

describe('PluginCardSkeleton Component', () => {
  it('renders plugin card structure', () => {
    const { container } = render(<PluginCardSkeleton />);
    const card = container.querySelector('.skeleton-plugin-card');
    expect(card).toBeInTheDocument();
  });

  it('renders 3 text skeletons', () => {
    const { container } = render(<PluginCardSkeleton />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('first skeleton has 100% width and 80px height', () => {
    const { container } = render(<PluginCardSkeleton />);
    const skeletons = container.querySelectorAll('.skeleton');
    const firstSkeleton = skeletons[0];
    expect(firstSkeleton).toHaveStyle({ width: '100%', height: '80px' });
  });

  it('second skeleton has 80% width and 16px height', () => {
    const { container } = render(<PluginCardSkeleton />);
    const skeletons = container.querySelectorAll('.skeleton');
    const secondSkeleton = skeletons[1];
    expect(secondSkeleton).toHaveStyle({ width: '80%', height: '16px' });
  });

  it('third skeleton has 60% width and 14px height', () => {
    const { container } = render(<PluginCardSkeleton />);
    const skeletons = container.querySelectorAll('.skeleton');
    const thirdSkeleton = skeletons[2];
    expect(thirdSkeleton).toHaveStyle({ width: '60%', height: '14px' });
  });

  it('applies custom className', () => {
    const { container } = render(<PluginCardSkeleton className="custom-plugin" />);
    const card = container.querySelector('.skeleton-plugin-card');
    expect(card).toHaveClass('custom-plugin');
  });
});
