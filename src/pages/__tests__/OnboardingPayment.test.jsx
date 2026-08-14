import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PaymentScreen } from '../OnboardingPage';
import { getMpesaPayment, startMpesaCheckout } from '../../services/platformApi';

vi.mock('../../services/platformApi', () => ({
    getMpesaPayment: vi.fn(),
    startMpesaCheckout: vi.fn(),
}));

const plan = {
    name: 'Shilingi Plus',
    price: 499,
    annualPrice: 4990,
    priceLabel: 'KES 499',
    shortName: 'Plus',
};

const renderPayment = (overrides = {}) => render(
    <MemoryRouter>
        <PaymentScreen
            billingCycle="monthly"
            isAuthenticated
            onBack={vi.fn()}
            onPaymentSuccess={vi.fn()}
            onRequireAccount={vi.fn()}
            plan={plan}
            planKey="plus"
            {...overrides}
        />
    </MemoryRouter>
);

describe('Onboarding M-Pesa payment', () => {
    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    it('requires an account before showing the secured checkout form', () => {
        renderPayment({ isAuthenticated: false });

        expect(screen.getByRole('button', { name: 'Sign in or create account' })).toBeInTheDocument();
        expect(screen.queryByLabelText('M-Pesa phone number')).not.toBeInTheDocument();
    });

    it('sends the backend plan fields and checks the payment result', async () => {
        const user = userEvent.setup();
        startMpesaCheckout.mockResolvedValue({
            payment: { uuid: 'payment-uuid', status: 'PENDING' },
            customer_message: 'Check your phone.',
        });
        getMpesaPayment.mockResolvedValue({
            uuid: 'payment-uuid',
            status: 'FAILED',
            result_description: 'Payment cancelled.',
        });
        renderPayment({ pollIntervalMs: 1 });

        await user.type(screen.getByLabelText('M-Pesa phone number'), '0712345678');
        await user.click(screen.getByRole('button', { name: 'Send M-Pesa request' }));

        await waitFor(() => expect(startMpesaCheckout).toHaveBeenCalledWith(expect.objectContaining({
            plan: 'PLUS',
            billingPeriod: 'MONTHLY',
            phoneNumber: '0712345678',
        })));
        expect(startMpesaCheckout.mock.calls[0][0].idempotencyKey.length).toBeGreaterThanOrEqual(8);
        await waitFor(() => expect(getMpesaPayment).toHaveBeenCalledWith('payment-uuid'));
        expect(await screen.findByRole('alert')).toHaveTextContent('Payment cancelled.');
    });
});
