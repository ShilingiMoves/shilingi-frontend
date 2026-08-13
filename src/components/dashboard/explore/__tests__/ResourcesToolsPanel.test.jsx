import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ResourcesToolsPanel from '../ResourcesToolsPanel';

const extractNumericValue = (text) => {
    const parsed = Number(String(text || '').replace(/[^\d]/g, ''));
    return Number.isNaN(parsed) ? 0 : parsed;
};

const getLatestHeading = (name) => screen.getAllByRole('heading', { name }).at(-1);

describe('ResourcesToolsPanel', () => {
    it('shows the approved cumulative calculator list for Basic, Plus, and Pro', () => {
        const basic = render(<ResourcesToolsPanel currentTier="BASIC" />);
        expect(screen.getByRole('button', { name: /savings calculator/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /emergency fund calculator/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /paye \/ tax calculator/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /debt repayment calculator/i })).not.toBeInTheDocument();
        basic.unmount();

        const plus = render(<ResourcesToolsPanel currentTier="PLUS" />);
        expect(screen.getByRole('button', { name: /debt repayment calculator/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /debt snowball calculator/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /insurance needs analysis/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /credit card repayment calculator/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /retirement calculator/i })).not.toBeInTheDocument();
        plus.unmount();

        render(<ResourcesToolsPanel currentTier="PRO" />);
        expect(screen.getByRole('button', { name: /retirement calculator/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /investment return calculator/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /compound interest calculator/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /portfolio allocator/i })).toBeInTheDocument();
    });

    it('opens the savings calculator and shows monthly and annual targets', async () => {
        const user = userEvent.setup();
        render(<ResourcesToolsPanel />);

        await user.click(screen.getByRole('button', { name: /savings calculator/i }));

        expect(getLatestHeading(/savings calculator/i)).toBeInTheDocument();
        expect(screen.getByText(/suggested savings target/i)).toBeInTheDocument();
        expect(screen.getByText(/24,000/)).toBeInTheDocument();
        expect(screen.getByText(/288,000/)).toBeInTheDocument();
    });

    it('updates debt repayment calculator after changing inputs', async () => {
        const user = userEvent.setup();
        render(<ResourcesToolsPanel />);

        await user.click(screen.getByRole('button', { name: /debt repayment calculator/i }));

        const resultCard = screen.getByText(/estimated monthly payment/i).closest('div');
        const initialValue = extractNumericValue(resultCard?.querySelector('p.text-2xl')?.textContent);

        const amountInput = screen.getByLabelText(/loan amount/i);
        fireEvent.change(amountInput, { target: { value: '1000000' } });

        const monthsInput = screen.getByLabelText(/repayment months/i);
        fireEvent.change(monthsInput, { target: { value: '12' } });

        expect(screen.getByText(/estimated monthly payment/i)).toBeInTheDocument();
        const updatedValue = extractNumericValue(resultCard?.querySelector('p.text-2xl')?.textContent);
        expect(updatedValue).toBeGreaterThan(50000);
        expect(updatedValue).not.toEqual(initialValue);
    });

    it('closes modal when close button is clicked', async () => {
        const user = userEvent.setup();
        render(<ResourcesToolsPanel />);

        await user.click(screen.getByRole('button', { name: /retirement calculator/i }));
        expect(getLatestHeading(/retirement calculator/i)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /close calculator/i }));
        expect(screen.getAllByRole('heading', { name: /retirement calculator/i })).toHaveLength(1);
    });

    it('opens portfolio allocator and recalculates when risk style changes', async () => {
        const user = userEvent.setup();
        render(<ResourcesToolsPanel />);

        await user.click(screen.getByRole('button', { name: /portfolio allocator/i }));
        expect(getLatestHeading(/portfolio allocator/i)).toBeInTheDocument();

        expect(screen.getByText(/illustrative allocation/i)).toBeInTheDocument();
        expect(screen.getAllByText(/225,000/)).toHaveLength(2);

        fireEvent.change(screen.getByLabelText(/risk style/i), { target: { value: 'growth' } });
        expect(screen.getByText(/350,000/)).toBeInTheDocument();
    });

    it('opens debt snowball calculator and shows debt-free timeline', async () => {
        const user = userEvent.setup();
        render(<ResourcesToolsPanel />);

        await user.click(screen.getByRole('button', { name: /debt snowball calculator/i }));
        expect(getLatestHeading(/debt snowball calculator/i)).toBeInTheDocument();
        expect(screen.getByText(/debt-free timeline/i)).toBeInTheDocument();
    });

    it('switches into books and learning hub tabs', async () => {
        const user = userEvent.setup();
        render(<ResourcesToolsPanel />);

        await user.click(screen.getAllByRole('button', { name: /^books$/i })[0]);
        expect(screen.getByRole('heading', { name: /curated financial books/i })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /learning hub/i }));
        expect(screen.getByRole('heading', { name: /^learning hub$/i })).toBeInTheDocument();
        expect(screen.getByText(/structured financial education/i)).toBeInTheDocument();
    });

    it('filters calculators and routes ecosystem cards through dashboard navigation', async () => {
        const user = userEvent.setup();
        const onSelectSection = vi.fn();
        render(<ResourcesToolsPanel onSelectSection={onSelectSection} />);

        await user.click(screen.getByRole('button', { name: /^tax$/i }));
        expect(screen.getByRole('button', { name: /paye \/ tax calculator/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /debt repayment calculator/i })).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /debt manager/i }));
        expect(onSelectSection).toHaveBeenCalledWith('debt');
    });
});
