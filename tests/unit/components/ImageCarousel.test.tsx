import { describe, it, expect } from 'bun:test';
import { render } from '@testing-library/react';
import ImageCarousel from '@/components/auction/ImageCarousel';

describe('ImageCarousel', () => {
    it('renders placeholder when no images are provided', () => {
        const { getByText } = render(<ImageCarousel images={[]} />);
        expect(getByText('No Image')).toBeInTheDocument();
    });

    it('renders a single image correctly with priority', () => {
        const images = ['http://example.com/image1.jpg'];
        const { getByRole } = render(<ImageCarousel images={images} />);
        const img = getByRole('img');

        expect(img.tagName).toBe('IMG');
        expect(img).toHaveAttribute('src', images[0]);
        expect(img).toHaveAttribute('alt', 'Product');
        expect(img).toHaveAttribute('data-fill', 'true');
        expect(img).toHaveAttribute('data-priority', 'true');
    });

    it('renders multiple images correctly', () => {
        const images = ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'];
        const { getAllByRole } = render(<ImageCarousel images={images} />);
        const imgs = getAllByRole('img');

        expect(imgs).toHaveLength(2);

        // First image should have priority
        expect(imgs[0]).toHaveAttribute('src', images[0]);
        expect(imgs[0]).toHaveAttribute('data-priority', 'true');

        // Second image should not have priority
        expect(imgs[1]).toHaveAttribute('src', images[1]);
        expect(imgs[1]).not.toHaveAttribute('data-priority');
    });
});
