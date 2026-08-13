import apiClient from './apiClient';
import { API_PATHS, unwrapData, unwrapList } from './apiContract';

export const getTierCatalog = async () => unwrapData(await apiClient.get(API_PATHS.tiers));
export const getDisclosures = async () => unwrapData(await apiClient.get(API_PATHS.disclosures));
export const getCurrentSubscription = async () => unwrapData(await apiClient.get(API_PATHS.billing.subscription));

export const startMpesaCheckout = async ({ plan, billingPeriod, phoneNumber, idempotencyKey }) => unwrapData(
    await apiClient.post(
        API_PATHS.billing.checkout,
        { plan, billing_period: billingPeriod, phone_number: phoneNumber },
        {},
        idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    )
);

export const listMpesaPayments = async () => {
    const response = await apiClient.get(API_PATHS.billing.payments);
    return unwrapList(response, 'payments');
};

export const getMpesaPayment = async (uuid) => unwrapData(
    await apiClient.get(`${API_PATHS.billing.payments}${uuid}/`)
);
