import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TaxPlanner from '../TaxPlanner';
import {
    calculatePlan,
    getLatestPlan,
    getTaxRules,
    savePlan,
} from '../../../../services/plannerApi';

vi.mock('../../../../services/plannerApi', () => ({
    calculatePlan: vi.fn(),
    deletePlan: vi.fn(),
    getLatestPlan: vi.fn(),
    getTaxRules: vi.fn(),
    savePlan: vi.fn(),
}));

const result = {
    gross_income: '100000.00',
    total_allowable_deductions: '10000.00',
    taxable_income: '90000.00',
    estimated_paye: '19000.00',
    income_after_paye: '81000.00',
    effective_tax_rate_percent: '19.00',
    rules_version: 'KE-PAYE-2026.1',
    warnings: [],
};

describe('TaxPlanner', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getLatestPlan.mockResolvedValue(null);
        getTaxRules.mockResolvedValue({ rules_version: 'KE-PAYE-2026.1', disclaimer: 'Estimate only.' });
    });

    it('loads a saved estimate into the form and results', async () => {
        getLatestPlan.mockResolvedValue({
            uuid: 'tax-1',
            name: 'Saved PAYE',
            tax_year: 2026,
            period: 'MONTHLY',
            is_resident: true,
            gross_income: '100000.00',
            nssf_contribution: '0.00',
            pension_contribution: '0.00',
            mortgage_interest: '0.00',
            affordable_housing_levy: '0.00',
            shif_contribution: '0.00',
            post_retirement_medical_contribution: '0.00',
            insurance_premium: '0.00',
            other_allowable_deductions: '0.00',
            other_tax_reliefs: '0.00',
            calculation_result: result,
        });

        render(<TaxPlanner />);

        expect(await screen.findByDisplayValue('Saved PAYE')).toBeInTheDocument();
        expect(screen.getByText(/19,000/)).toBeInTheDocument();
    });

    it('previews through the backend without saving', async () => {
        calculatePlan.mockResolvedValue(result);
        const user = userEvent.setup();
        render(<TaxPlanner />);
        await screen.findByRole('heading', { name: /tax planner/i });

        fireEvent.change(screen.getByLabelText(/gross income/i), { target: { value: '100000' } });
        await user.click(screen.getByRole('button', { name: /calculate estimate/i }));

        await waitFor(() => expect(calculatePlan).toHaveBeenCalledWith('tax', expect.objectContaining({ gross_income: '100000' })));
        expect(savePlan).not.toHaveBeenCalled();
        expect(await screen.findByText(/live shilingi tax rules/i)).toBeInTheDocument();
    });

    it('saves the estimate through the planner lifecycle', async () => {
        savePlan.mockResolvedValue({ uuid: 'tax-2', calculation_result: result });
        const user = userEvent.setup();
        render(<TaxPlanner />);
        await screen.findByRole('heading', { name: /tax planner/i });

        fireEvent.change(screen.getByLabelText(/gross income/i), { target: { value: '100000' } });
        await user.click(screen.getByRole('button', { name: /save estimate/i }));

        await waitFor(() => expect(savePlan).toHaveBeenCalledWith('tax', expect.objectContaining({ gross_income: '100000' }), null));
        expect((await screen.findAllByText(/saved to your shilingi account/i)).length).toBeGreaterThan(0);
    });

    it('blocks empty or zero gross income before an API request', async () => {
        const user = userEvent.setup();
        render(<TaxPlanner />);
        await screen.findByRole('heading', { name: /tax planner/i });

        await user.click(screen.getByRole('button', { name: /calculate estimate/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(/greater than zero/i);
        expect(calculatePlan).not.toHaveBeenCalled();
    });
});
