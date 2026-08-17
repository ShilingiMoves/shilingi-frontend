import { describe, expect, it } from 'vitest';
import { buildDashboardAccess, buildDashboardNavigationGroups, filterItemsForTier, tierAllows } from '../tierAccess';

const catalog = {
    frontend_navigation: [
        { code: 'MAIN', title: 'Main', items: [{ code: 'DASHBOARD', title: 'Dashboard', minimum_tier: 'BASIC', backend_status: 'AVAILABLE' }] },
        { code: 'PLANNING_TOOLS', title: 'Planning Tools', items: [
            { code: 'BUDGET_PLANNER', title: 'Budget Planner', minimum_tier: 'BASIC', backend_status: 'AVAILABLE' },
            { code: 'DEBT_MANAGER', title: 'Debt Manager', minimum_tier: 'PLUS', backend_status: 'AVAILABLE' },
            { code: 'PROTECTION_PLANNER', title: 'Protection Planner', minimum_tier: 'PLUS', backend_status: 'AVAILABLE' },
            { code: 'INVESTMENT_PLANNER', title: 'Investment Planner', minimum_tier: 'PRO', backend_status: 'AVAILABLE' },
            { code: 'RETIREMENT_PLANNER', title: 'Retirement Planner', minimum_tier: 'PRO', backend_status: 'AVAILABLE' },
            { code: 'TAX_PLANNER', title: 'Tax Planner', minimum_tier: 'BASIC', backend_status: 'AVAILABLE' },
        ] },
    ],
};

describe('Swagger-driven tier access', () => {
    it('treats tiers cumulatively', () => {
        expect(tierAllows('PRO', 'PLUS')).toBe(true);
        expect(tierAllows('BASIC', 'PLUS')).toBe(false);
    });

    it('filters cumulative hub content by minimum tier', () => {
        const items = [
            { id: 'budget', minimumTier: 'BASIC' },
            { id: 'debt', minimumTier: 'PLUS' },
            { id: 'investing', minimumTier: 'PRO' },
        ];

        expect(filterItemsForTier(items, 'BASIC').map((item) => item.id)).toEqual(['budget']);
        expect(filterItemsForTier(items, 'PLUS').map((item) => item.id)).toEqual(['budget', 'debt']);
        expect(filterItemsForTier(items, 'PRO').map((item) => item.id)).toEqual(['budget', 'debt', 'investing']);
    });

    it('uses backend entitlements as the final frontend access list', () => {
        const access = buildDashboardAccess(catalog, {
            current_tier: 'PLUS',
            entitlements: ['BUDGET_PLANNER', 'DEBT_MANAGER', 'PROTECTION_PLANNER'],
        });
        expect(access.budget.allowed).toBe(true);
        expect(access.debt.allowed).toBe(true);
        expect(access.protection.allowed).toBe(true);
        expect(access.investments.allowed).toBe(false);
        expect(access.retirement.allowed).toBe(false);
    });

    it('restricts the catalog-only Market Watch preview to Pro', () => {
        expect(buildDashboardAccess(catalog, { current_tier: 'BASIC' }).marketwatch.allowed).toBe(false);
        expect(buildDashboardAccess(catalog, { current_tier: 'PLUS' }).marketwatch.allowed).toBe(false);
        expect(buildDashboardAccess(catalog, { current_tier: 'PRO' }).marketwatch.allowed).toBe(true);
        expect(buildDashboardAccess(catalog, { current_tier: 'PRO' }).marketwatch.minimumTier).toBe('PRO');
    });

    it('orders main and planning navigation from the live catalog, including Tax Planner', () => {
        const groups = buildDashboardNavigationGroups(catalog, [{ id: 'explore', label: 'Explore', items: ['comparehub'] }]);
        expect(groups[0]).toMatchObject({ id: 'main', items: ['overview'] });
        expect(groups[1].items).toEqual(['budget', 'tax', 'debt', 'protection', 'investments', 'retirement']);
        expect(groups[2].id).toBe('explore');
    });

    it('keeps every available Basic feature open when backend entitlements are incomplete', () => {
        const access = buildDashboardAccess(catalog, {
            current_tier: 'BASIC',
            entitlements: ['DASHBOARD', 'PROFILE', 'BUDGET_PLANNER'],
        });

        expect(access.budget.allowed).toBe(true);
        expect(access.tax.allowed).toBe(true);
        expect(access.tax.minimumTier).toBe('BASIC');
        expect(access.debt.allowed).toBe(false);
    });

    it('places Tax Planner directly after Budget Planner even if the catalog order is wrong', () => {
        const reorderedCatalog = {
            ...catalog,
            frontend_navigation: catalog.frontend_navigation.map((group) => group.code === 'PLANNING_TOOLS'
                ? { ...group, items: [...group.items].reverse() }
                : group),
        };

        const planning = buildDashboardNavigationGroups(reorderedCatalog, [])
            .find((group) => group.id === 'planning');

        expect(planning.items.slice(0, 2)).toEqual(['budget', 'tax']);
    });
});
