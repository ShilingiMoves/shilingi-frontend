import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import ComparisonHubPanel from '../ComparisonHubPanel';

describe('ComparisonHubPanel', () => {
    it('switches between main compare tabs', async () => {
        const user = userEvent.setup();
        render(<ComparisonHubPanel />);

        expect(screen.getByRole('heading', { name: /loans & credit/i })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /savings & mmfs/i }));
        expect(screen.getByRole('heading', { name: /savings & money market funds/i })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /^insurance$/i }));
        expect(screen.getByRole('heading', { name: /insurance plans/i })).toBeInTheDocument();
    });

    it('completes the wizard and shows shilingi picks', async () => {
        const user = userEvent.setup();
        render(<ComparisonHubPanel />);

        await user.click(screen.getByRole('button', { name: /start 30-sec quiz/i }));
        await user.click(screen.getByRole('button', { name: /^save$/i }));
        await user.click(screen.getByRole('button', { name: /next/i }));
        await user.click(screen.getByRole('button', { name: /under 1 year/i }));
        await user.click(screen.getByRole('button', { name: /next/i }));
        await user.click(screen.getByRole('button', { name: /conservative/i }));
        await user.click(screen.getByRole('button', { name: /next/i }));
        await user.click(screen.getByRole('button', { name: /under kes 5k/i }));
        await user.click(screen.getByRole('button', { name: /see my picks/i }));

        expect(screen.getByRole('heading', { name: /your shilingi picks/i })).toBeInTheDocument();
        expect(screen.getByText(/nabo africa mmf/i)).toBeInTheDocument();
    });

    it('updates mortgage repayment when sliders change', async () => {
        const user = userEvent.setup();
        render(<ComparisonHubPanel />);

        await user.click(screen.getByRole('button', { name: /mortgages/i }));

        const before = screen.getByText(/stanbic bank \(kmrc\)/i).closest('tr')?.textContent || '';
        fireEvent.change(screen.getByLabelText(/loan amount/i), { target: { value: '10000000' } });
        fireEvent.change(screen.getByLabelText(/mortgage term/i), { target: { value: '25' } });
        const after = screen.getByText(/stanbic bank \(kmrc\)/i).closest('tr')?.textContent || '';

        expect(after).not.toEqual(before);
    });
});
