import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../apiClient';
import {
    checkAffordability,
    createReminder,
    getMoneyCalendar,
    getTodayMoney,
    saveDailyPlan,
    saveShoppingList,
} from '../dailyMoneyApi';

vi.mock('../apiClient', () => ({
    default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

describe('dailyMoneyApi contract', () => {
    beforeEach(() => vi.clearAllMocks());

    it('loads and unwraps the signed-in user daily overview', async () => {
        apiClient.get.mockResolvedValue({ data: { date: '2026-08-25', streak: { current_streak: 3 } } });
        await expect(getTodayMoney()).resolves.toMatchObject({ date: '2026-08-25' });
        expect(apiClient.get).toHaveBeenCalledWith('/api/v1/daily-money/today/');
    });

    it('creates a plan and patches an existing plan by UUID', async () => {
        apiClient.post.mockResolvedValue({ data: { uuid: 'plan-1' } });
        apiClient.patch.mockResolvedValue({ data: { uuid: 'plan-1', notes: 'Updated' } });
        await saveDailyPlan({ plan_date: '2026-08-25', notes: '' });
        expect(apiClient.post).toHaveBeenCalledWith('/api/v1/daily-money/plans/', { plan_date: '2026-08-25' });
        await saveDailyPlan({ notes: 'Updated' }, 'plan-1');
        expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/daily-money/plans/plan-1/', { notes: 'Updated' });
    });

    it('uses the shopping, reminder, affordability and calendar endpoints', async () => {
        apiClient.post.mockResolvedValue({ data: {} });
        apiClient.get.mockResolvedValue({ data: { events: [] } });
        await saveShoppingList({ name: 'Groceries' });
        await createReminder({ title: 'Pay rent', due_at: '2026-09-01T08:00:00Z' });
        await checkAffordability({ item_name: 'Phone', price: '25000', category: 'category-1' });
        await getMoneyCalendar({ start_date: '2026-08-25' });
        expect(apiClient.post).toHaveBeenNthCalledWith(1, '/api/v1/daily-money/shopping-lists/', { name: 'Groceries' });
        expect(apiClient.post).toHaveBeenNthCalledWith(2, '/api/v1/daily-money/reminders/', { title: 'Pay rent', due_at: '2026-09-01T08:00:00Z' });
        expect(apiClient.post).toHaveBeenNthCalledWith(3, '/api/v1/daily-money/affordability/check/', { item_name: 'Phone', price: '25000', category: 'category-1' });
        expect(apiClient.get).toHaveBeenCalledWith('/api/v1/daily-money/calendar/', { start_date: '2026-08-25' });
    });
});
