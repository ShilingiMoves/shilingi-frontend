import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MarketWatchPanel from '../MarketWatchPanel';

describe('MarketWatchPanel', () => {
    it('clearly identifies its fixed figures as sample data', () => {
        render(<MarketWatchPanel />);

        expect(screen.getByRole('note', { name: 'Market data notice' })).toHaveTextContent('Sample market data — not live');
        expect(screen.getByText(/figures on this page are fixed examples/i)).toBeInTheDocument();
        expect(screen.getByText(/values displayed above are fixed sample data/i)).toBeInTheDocument();
    });
});
