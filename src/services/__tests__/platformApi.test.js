import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../apiClient';
import { getTierCatalog, listMpesaPayments, startMpesaCheckout } from '../platformApi';

vi.mock('../apiClient', () => ({
    default: { get: vi.fn(), post: vi.fn() },
}));

describe('platform Swagger contract', () => {
    beforeEach(() => vi.clearAllMocks());

    it('loads and unwraps the public tier catalog', async () => {
        apiClient.get.mockResolvedValue({ data: { catalog_version: '2026-08', tiers: [] } });
        await expect(getTierCatalog()).resolves.toMatchObject({ catalog_version: '2026-08' });
        expect(apiClient.get).toHaveBeenCalledWith('/api/v1/tiers/');
    });

    it('maps checkout fields and sends the idempotency key as a header', async () => {
        apiClient.post.mockResolvedValue({ data: { payment: { status: 'PENDING' } } });
        await startMpesaCheckout({ plan: 'PLUS', billingPeriod: 'MONTHLY', phoneNumber: '254700000000', idempotencyKey: 'intent-1' });
        expect(apiClient.post).toHaveBeenCalledWith('/api/v1/billing/mpesa/checkout/', {
            plan: 'PLUS', billing_period: 'MONTHLY', phone_number: '254700000000',
        }, {}, { 'Idempotency-Key': 'intent-1' });
    });

    it('unwraps the nested payment list', async () => {
        apiClient.get.mockResolvedValue({ data: { count: 1, payments: [{ uuid: 'payment-1' }] } });
        await expect(listMpesaPayments()).resolves.toEqual([{ uuid: 'payment-1' }]);
    });
});
