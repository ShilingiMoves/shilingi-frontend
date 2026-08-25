import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MobileDashboardHome from '../MobileDashboardHome';
import { getMoneyCalendar, getTodayMoney } from '../../../../services/dailyMoneyApi';

vi.mock('../../../../services/dailyMoneyApi', () => ({
    getMoneyCalendar: vi.fn(),
    getTodayMoney: vi.fn(),
}));

const renderHome = (healthAccess) => render(
    <MobileDashboardHome
        currentScore={72}
        displayName="Myra"
        healthAccess={healthAccess}
        live={{ raw: { budgets: [] } }}
        onSelectSection={vi.fn()}
        palette={{ label: 'Good morning' }}
    />
);

describe('MobileDashboardHome', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getTodayMoney.mockResolvedValue({ reminders: [], streak: { current_streak: 2 } });
        getMoneyCalendar.mockResolvedValue({
            events: [
                { uuid: 'rent-1', title: 'Rent due', due_at: '2099-09-01T08:00:00Z', amount: 15000 },
                { uuid: 'payday-1', title: 'Payday', due_at: '2099-09-05T08:00:00Z' },
                { uuid: 'netflix-1', title: 'Netflix renewal', due_at: '2099-09-10T08:00:00Z', amount: 1100 },
            ],
        });
    });

    it('hides Financial Health for Basic members and renders account calendar events', async () => {
        renderHome({ allowed: false, currentTier: 'BASIC', minimumTier: 'PLUS' });

        expect(screen.queryByText('Financial Health')).not.toBeInTheDocument();
        expect(await screen.findByText('Rent due')).toBeInTheDocument();
        expect(screen.getByText('Payday')).toBeInTheDocument();
        expect(screen.getByText('Netflix renewal')).toBeInTheDocument();
        expect(screen.getByText('KES 15,000')).toBeInTheDocument();
        expect(screen.getByText('KES 1,100')).toBeInTheDocument();
        expect(screen.getByText('Community')).toBeInTheDocument();
        expect(screen.getByText("See what's inside each hub")).toBeInTheDocument();
    });

    it('shows Financial Health for Plus and Pro access', async () => {
        renderHome({ allowed: true, currentTier: 'PLUS', minimumTier: 'PLUS' });

        expect(screen.getByText('Financial Health')).toBeInTheDocument();
        expect(screen.getByText('72')).toBeInTheDocument();
        expect(await screen.findByText('Rent due')).toBeInTheDocument();
    });
});
