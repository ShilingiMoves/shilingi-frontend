import { afterEach, describe, expect, it } from 'vitest';
import {
    DEFAULT_DASHBOARD_SECTION,
    getInitialDashboardSection,
    persistDashboardSection,
} from '../dashboardDataState';

describe('dashboardDataState', () => {
    afterEach(() => {
        window.localStorage.clear();
    });

    it('returns the default section when nothing has been stored yet', () => {
        expect(getInitialDashboardSection()).toBe(DEFAULT_DASHBOARD_SECTION);
    });

    it('returns the persisted section after storing it', () => {
        persistDashboardSection('budget');

        expect(getInitialDashboardSection()).toBe('budget');
    });
});
