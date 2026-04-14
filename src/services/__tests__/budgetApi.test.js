import { beforeEach, describe, expect, it, vi } from 'vitest';

const { postMock, patchMock } = vi.hoisted(() => ({
    postMock: vi.fn(),
    patchMock: vi.fn(),
}));

vi.mock('../apiClient', () => ({
    default: {
        post: postMock,
        patch: patchMock,
    },
}));

import { createExpense, updateExpense } from '../budgetApi';

describe('budgetApi expense payload mapping', () => {
    beforeEach(() => {
        postMock.mockReset();
        patchMock.mockReset();
    });

    it('maps MOBILE_MONEY to MPESA when creating an expense', async () => {
        postMock.mockResolvedValue({ data: { ok: true } });

        await createExpense({
            category: '12',
            amount: '1500',
            payment_method: 'MOBILE_MONEY',
        });

        expect(postMock).toHaveBeenCalledWith(
            '/api/v1/budgets/expenses/',
            expect.objectContaining({
                category: 12,
                amount: '1500',
                payment_method: 'MPESA',
            })
        );
    });

    it('maps MOBILE_MONEY to MPESA when updating an expense', async () => {
        patchMock.mockResolvedValue({ data: { ok: true } });

        await updateExpense('expense-123', {
            payment_method: 'MOBILE_MONEY',
            merchant: 'Naivas',
        });

        expect(patchMock).toHaveBeenCalledWith(
            '/api/v1/budgets/expenses/expense-123/',
            expect.objectContaining({
                payment_method: 'MPESA',
                merchant: 'Naivas',
            })
        );
    });
});
