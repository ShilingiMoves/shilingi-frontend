import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../apiClient';
import { calculatePlan, createPlan, deletePlan, listPlans, savePlan, updatePlan } from '../plannerApi';

vi.mock('../apiClient', () => ({
    default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('plannerApi Swagger contract', () => {
    beforeEach(() => vi.clearAllMocks());

    it('normalizes the backend plans response envelope', async () => {
        apiClient.get.mockResolvedValue({ data: { count: 1, plans: [{ uuid: 'plan-1' }] } });
        await expect(listPlans('retirement')).resolves.toEqual([{ uuid: 'plan-1' }]);
        expect(apiClient.get).toHaveBeenCalledWith('/api/v1/retirement-planner/', {});
    });

    it('uses dedicated create and calculate endpoints', async () => {
        apiClient.post.mockResolvedValue({ data: { uuid: 'plan-1' } });
        await createPlan('protection', { annual_income: '1200000', unused: '' });
        expect(apiClient.post).toHaveBeenCalledWith('/api/v1/protection-planner/', { annual_income: '1200000' });
        await calculatePlan('investment', {
            goal_name: 'Home', target_amount: '5000000', horizon_years: 8,
            expected_annual_return_percent: '8', annual_fee_percent: '0', inflation_percent: '0',
        });
        expect(apiClient.post).toHaveBeenLastCalledWith('/api/v1/investment-planner/calculate/', {
            goal_name: 'Home', target_amount: '5000000', horizon_years: 8,
            expected_annual_return_percent: '8', annual_fee_percent: '0', inflation_percent: '0',
        });
    });

    it('patches a user-owned plan by UUID', async () => {
        apiClient.patch.mockResolvedValue({ data: { uuid: 'plan-1', name: 'Updated' } });
        await updatePlan('tax', 'plan-1', { name: 'Updated' });
        expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/tax-planner/plan-1/', { name: 'Updated' });
    });

    it('updates and recalculates an existing plan instead of creating a duplicate', async () => {
        apiClient.patch.mockResolvedValue({ data: { uuid: 'existing-plan' } });
        apiClient.post.mockResolvedValue({ data: { uuid: 'existing-plan', calculation_version: '2.0' } });
        await expect(savePlan('retirement', { current_age: 35 }, { uuid: 'existing-plan' })).resolves.toMatchObject({
            uuid: 'existing-plan', calculation_version: '2.0',
        });
        expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/retirement-planner/existing-plan/', { current_age: 35 });
        expect(apiClient.post).toHaveBeenCalledWith('/api/v1/retirement-planner/existing-plan/recalculate/');
    });

    it('deletes only the selected planner UUID', async () => {
        apiClient.delete.mockResolvedValue(null);
        await deletePlan('protection', 'plan-to-delete');
        expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/protection-planner/plan-to-delete/');
    });
});
