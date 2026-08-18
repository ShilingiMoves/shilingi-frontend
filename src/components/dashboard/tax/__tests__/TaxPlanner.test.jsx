import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TaxPlanner, { TAX_ONBOARDING_STORAGE_PREFIX } from '../TaxPlanner';
import {
    calculatePlan,
    calculateSalary,
    deletePlan,
    getLatestPlan,
    getTaxRules,
    savePlan,
} from '../../../../services/plannerApi';

vi.mock('../../../../services/plannerApi', () => ({
    calculatePlan: vi.fn(),
    calculateSalary: vi.fn(),
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
        window.localStorage.clear();
        window.localStorage.setItem(`${TAX_ONBOARDING_STORAGE_PREFIX}_guest`, 'true');
        getLatestPlan.mockResolvedValue(null);
        getTaxRules.mockResolvedValue({ rules_version: 'KE-PAYE-2026.1', disclaimer: 'Estimate only.' });
    });

    it('shows the Basic Tax Planner journey for a new member', async () => {
        window.localStorage.removeItem(`${TAX_ONBOARDING_STORAGE_PREFIX}_guest`);
        const user = userEvent.setup();
        render(<TaxPlanner />);

        expect(await screen.findByRole('heading', { name: /understand your taxes/i })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /first job/i }));
        await user.click(screen.getByRole('button', { name: /^continue$/i }));
        await user.click(screen.getByRole('button', { name: /get started/i }));
        await user.click(screen.getByRole('button', { name: /yes, continue/i }));

        expect(await screen.findByText(/question 1 of 5/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /receive a payslip/i })).toBeInTheDocument();
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
        expect(screen.getAllByText(/19,000/).length).toBeGreaterThan(0);
    });

    it('renders the Figma tax dashboard cards for a Basic member', async () => {
        render(<TaxPlanner />);

        expect(await screen.findByRole('heading', { name: /^tax planner$/i })).toBeInTheDocument();
        expect(screen.getByText(/tax confidence/i)).toBeInTheDocument();
        expect(screen.getAllByRole('heading', { name: /my tax status/i }).length).toBeGreaterThan(0);
        expect(screen.getByRole('heading', { name: /my tax milestones/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /my learning hub/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /my tax resources/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /unlock more with shilingi plus/i })).toBeInTheDocument();
    });

    it('shows live payroll results in the Figma salary breakdown', async () => {
        calculateSalary.mockResolvedValue({
            gross_income: '100000.00',
            estimated_paye: '16908.35',
            estimated_take_home_pay: '70441.65',
            statutory_deductions: {
                affordable_housing_levy: '1500.00',
                nssf_employee: '6000.00',
                shif: '2750.00',
            },
            paye_breakdown: result,
        });
        const user = userEvent.setup();
        render(<TaxPlanner />);

        await user.click(await screen.findByRole('button', { name: /tax calculator/i }));
        await user.type(screen.getByLabelText(/estimated monthly income/i), '100000');
        await user.click(screen.getByRole('button', { name: /^continue$/i }));

        await waitFor(() => expect(calculateSalary).toHaveBeenCalledWith(expect.objectContaining({ gross_income: '100000' })));
        expect((await screen.findAllByRole('heading', { name: /salary breakdown/i })).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/70,442/).length).toBeGreaterThan(0);
    });

    it('uses the manual tax estimate for the freelancer Figma experience', async () => {
        window.localStorage.setItem(`${TAX_ONBOARDING_STORAGE_PREFIX}_guest_profile`, JSON.stringify({
            persona: 'freelancer',
            answers: { accounts: ['kra'] },
        }));
        calculatePlan.mockResolvedValue(result);
        const user = userEvent.setup();
        render(<TaxPlanner />);

        await user.click(await screen.findByRole('button', { name: /tax calculator/i }));
        await user.type(screen.getByLabelText(/estimated monthly income/i), '100000');
        await user.click(screen.getByRole('button', { name: /^continue$/i }));

        await waitFor(() => expect(calculatePlan).toHaveBeenCalledWith('tax', expect.objectContaining({
            gross_income: '100000',
            nssf_contribution: '0',
            affordable_housing_levy: '0',
            shif_contribution: '0',
        })));
        expect(calculateSalary).not.toHaveBeenCalled();
        expect(await screen.findByText(/estimated tax position is ready/i)).toBeInTheDocument();
        expect(screen.getAllByText(/tax basics for freelancers/i).length).toBeGreaterThan(0);
    });

    it('previews through the backend without saving', async () => {
        calculatePlan.mockResolvedValue(result);
        const user = userEvent.setup();
        render(<TaxPlanner />);
        await screen.findByRole('heading', { name: /tax planner/i });
        await user.click(screen.getByText(/advanced tax details/i));

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
        await user.click(screen.getByText(/advanced tax details/i));

        fireEvent.change(screen.getByLabelText(/gross income/i), { target: { value: '100000' } });
        await user.click(screen.getByRole('button', { name: /save estimate/i }));

        await waitFor(() => expect(savePlan).toHaveBeenCalledWith('tax', expect.objectContaining({ gross_income: '100000' }), null));
        expect((await screen.findAllByText(/saved to your shilingi account/i)).length).toBeGreaterThan(0);
    });

    it('restarts the journey and removes only the saved tax setup', async () => {
        window.localStorage.setItem(`${TAX_ONBOARDING_STORAGE_PREFIX}_guest_profile`, JSON.stringify({
            persona: 'salaried',
            answers: { resident: 'yes' },
        }));
        getLatestPlan.mockResolvedValue({
            uuid: 'tax-1',
            name: 'Saved PAYE',
            tax_year: 2026,
            period: 'MONTHLY',
            is_resident: true,
            gross_income: '100000.00',
            calculation_result: result,
        });
        deletePlan.mockResolvedValue({});
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        const user = userEvent.setup();
        render(<TaxPlanner />);

        await user.click(await screen.findByText(/advanced tax details/i));
        await user.click(screen.getByRole('button', { name: /restart tax planner/i }));

        await waitFor(() => expect(deletePlan).toHaveBeenCalledWith('tax', 'tax-1'));
        expect(window.localStorage.getItem(`${TAX_ONBOARDING_STORAGE_PREFIX}_guest`)).toBeNull();
        expect(window.localStorage.getItem(`${TAX_ONBOARDING_STORAGE_PREFIX}_guest_profile`)).toBeNull();
        expect(await screen.findByRole('heading', { name: /understand your taxes/i })).toBeInTheDocument();
    });

    it('blocks empty or zero gross income before an API request', async () => {
        const user = userEvent.setup();
        render(<TaxPlanner />);
        await screen.findByRole('heading', { name: /tax planner/i });
        await user.click(screen.getByText(/advanced tax details/i));

        await user.click(screen.getByRole('button', { name: /calculate estimate/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(/greater than zero/i);
        expect(calculatePlan).not.toHaveBeenCalled();
    });
});
