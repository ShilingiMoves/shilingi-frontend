import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BudgetOverview from '../BudgetOverview';

const { createExpenseMock, getCategoriesMock } = vi.hoisted(() => ({
    createExpenseMock: vi.fn(),
    getCategoriesMock: vi.fn(),
}));

vi.mock('../../../../services/budgetApi', () => ({
    createExpense: createExpenseMock,
    getCategories: getCategoriesMock,
}));

const baseProps = {
    summary: {
        currency: 'KES',
        total_budget: 65000,
        total_spent: 50250,
        total_remaining: 14750,
        active_budgets_count: 3,
    },
    budgets: [
        {
            uuid: 'budget-housing',
            category_id: 1,
            category_name: 'Housing',
            amount: 30000,
            total_spent: 0,
            remaining: 30000,
            status: 'ON_TRACK',
            spent_percentage: 0,
            currency: 'KES',
            expense_count: 0,
        },
        {
            uuid: 'budget-savings',
            category_id: 2,
            category_name: 'Savings',
            amount: 18000,
            total_spent: 18000,
            remaining: 0,
            status: 'ON_TRACK',
            spent_percentage: 100,
            currency: 'KES',
            expense_count: 1,
        },
        {
            uuid: 'budget-entertainment',
            category_id: 3,
            category_name: 'Entertainment',
            amount: 5000,
            total_spent: 6200,
            remaining: -1200,
            status: 'OVER_BUDGET',
            spent_percentage: 124,
            currency: 'KES',
            expense_count: 2,
        },
    ],
    expenses: [
        {
            uuid: 'expense-1',
            description: 'Lunch at Java',
            category_name: 'Housing',
            amount: 1500,
            payment_method: 'MPESA',
            expense_date: '2026-04-16',
            currency: 'KES',
        },
    ],
    goals: [
        {
            uuid: 'goal-1',
            name: 'Emergency Fund',
            target_amount: 100000,
            current_amount: 74000,
            goal_type: 'SHORT_TERM',
            target_date: '2026-06-01',
            progress_percentage: 74,
        },
    ],
    goalSummary: {
        total_saved: 18000,
    },
    expenseTotal: 1500,
    totalIncome: 120000,
    budgetHealth: {
        healthy: 2,
        warning: 0,
        over: 1,
    },
    onNavigate: vi.fn(),
    onSelectSection: vi.fn(),
    onQuickExpenseAdded: vi.fn(),
};

describe('BudgetOverview', () => {
    beforeEach(() => {
        createExpenseMock.mockReset();
        getCategoriesMock.mockReset();
        getCategoriesMock.mockResolvedValue([
            { id: 1, uuid: 'cat-housing', value: '1', name: 'Housing' },
            { id: 2, uuid: 'cat-savings', value: '2', name: 'Savings' },
        ]);
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    it('opens the compare section when change type is clicked', async () => {
        const user = userEvent.setup();
        render(<BudgetOverview {...baseProps} />);

        await user.click(screen.getByRole('button', { name: /change type/i }));

        expect(screen.getByText(/compare budget models/i)).toBeInTheDocument();
    });

    it('submits the quick add expense form and refreshes the budget view', async () => {
        const user = userEvent.setup();
        createExpenseMock.mockResolvedValue({ ok: true });

        render(<BudgetOverview {...baseProps} />);

        await user.click(screen.getByRole('button', { name: /expense tracker/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/amount \(kes\)/i)).toBeInTheDocument();
        });

        await user.type(screen.getByLabelText(/amount \(kes\)/i), '2500');
        await user.type(screen.getByLabelText(/description/i), 'Lunch at Java House');
        await user.selectOptions(screen.getByLabelText(/^category$/i), '1');
        await user.selectOptions(screen.getByLabelText(/payment method/i), 'MPESA');
        await user.click(screen.getByRole('button', { name: /\+ add expense/i }));

        await waitFor(() => {
            expect(createExpenseMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    amount: '2500',
                    description: 'Lunch at Java House',
                    category: '1',
                    payment_method: 'MPESA',
                    currency: 'KES',
                })
            );
        });
        expect(baseProps.onQuickExpenseAdded).toHaveBeenCalled();
    });

    it('records pay now bills as expenses using the matched backend category id', async () => {
        const user = userEvent.setup();
        createExpenseMock.mockResolvedValue({ ok: true });

        render(<BudgetOverview {...baseProps} />);

        await user.click(screen.getByRole('button', { name: /^bills$/i }));
        await user.click(screen.getByRole('button', { name: /pay now/i }));

        await waitFor(() => {
            expect(createExpenseMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: 'Housing bill payment',
                    category: '1',
                    payment_method: 'MPESA',
                    amount: 30000,
                })
            );
        });
        expect(baseProps.onQuickExpenseAdded).toHaveBeenCalled();
    });
});
