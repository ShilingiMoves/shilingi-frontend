import { describe, expect, it } from 'vitest';
import { comparisonColumns, plans } from '../DashboardLandingPage';

describe('Dashboard plan presentation', () => {
    it('shows only the approved plans and monthly prices', () => {
        expect(plans.map((plan) => plan.tier)).toEqual(['Basic', 'Plus', 'Pro']);
        expect(plans.map((plan) => plan.price)).toEqual(['Free', '499', '699']);
        expect(comparisonColumns.map((column) => column.name)).toEqual(['Basic', 'Plus', 'Pro']);
        expect(comparisonColumns.map((column) => column.price)).toEqual(['Free', 'KES 499', 'KES 699']);
        expect(plans.map((plan) => plan.annualText || 'Free')).toEqual(['Free', 'KES 4,990/year - 2 months free', 'KES 6,990/year - 2 months free']);
    });
});
