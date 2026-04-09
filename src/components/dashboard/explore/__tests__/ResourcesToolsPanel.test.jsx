import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResourcesToolsPanel from '../ResourcesToolsPanel';

const extractNumericValue = (text) => {
    const parsed = Number(String(text || '').replace(/[^\d]/g, ''));
    return Number.isNaN(parsed) ? 0 : parsed;
};

describe('ResourcesToolsPanel', () => {
    it('opens budget calculator modal and shows 50/30/20 values', async () => {
        const user = userEvent.setup();
        render(<ResourcesToolsPanel />);

        await user.click(screen.getByRole('button', { name: /budget builder/i }));

        expect(screen.getByRole('heading', { name: /budget builder/i })).toBeInTheDocument();
        expect(screen.getByText(/50\/30\/20 split/i)).toBeInTheDocument();
        expect(screen.getByText(/60,000/)).toBeInTheDocument();
        expect(screen.getByText(/36,000/)).toBeInTheDocument();
        expect(screen.getByText(/24,000/)).toBeInTheDocument();
    });

    it('updates loan calculator monthly payment after changing inputs', async () => {
        const user = userEvent.setup();
        render(<ResourcesToolsPanel />);

        await user.click(screen.getByRole('button', { name: /loan calculator/i }));

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

        await user.click(screen.getByRole('button', { name: /fire calculator/i }));
        expect(screen.getByRole('heading', { name: /fire calculator/i })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /close calculator/i }));
        expect(screen.queryByRole('heading', { name: /fire calculator/i })).not.toBeInTheDocument();
    });

    it('opens fx converter and recalculates when currency pair changes', async () => {
        const user = userEvent.setup();
        render(<ResourcesToolsPanel />);

        await user.click(screen.getByRole('button', { name: /fx converter/i }));
        expect(screen.getByRole('heading', { name: /fx converter/i })).toBeInTheDocument();

        const resultCard = screen.getByText(/converted amount/i).closest('div');
        const before = extractNumericValue(resultCard?.querySelector('p.text-2xl')?.textContent);

        fireEvent.change(screen.getByLabelText(/from currency/i), { target: { value: 'EUR' } });
        fireEvent.change(screen.getByLabelText(/to currency/i), { target: { value: 'USD' } });

        const after = extractNumericValue(resultCard?.querySelector('p.text-2xl')?.textContent);
        expect(after).not.toEqual(before);
    });

    it('opens debt payoff planner and shows debt-free timeline', async () => {
        const user = userEvent.setup();
        render(<ResourcesToolsPanel />);

        await user.click(screen.getByRole('button', { name: /debt payoff planner/i }));
        expect(screen.getByRole('heading', { name: /debt payoff planner/i })).toBeInTheDocument();
        expect(screen.getByText(/debt-free timeline/i)).toBeInTheDocument();
    });
});
