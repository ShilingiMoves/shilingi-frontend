import { beforeEach, describe, expect, it } from 'vitest';
import { getDashboardDisplayName, getMemberInitials } from '../memberIdentity';

describe('dashboard member identity', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('uses backend names when the account has profile information', () => {
        expect(getDashboardDisplayName({ first_name: 'Bernard', last_name: 'Sanya' })).toBe('Bernard');
        expect(getMemberInitials({ first_name: 'Bernard', last_name: 'Sanya' })).toBe('B');
    });

    it('turns a test account email into a useful home-page identity', () => {
        const user = { email: 'basic.frontend.try@shilingimove.test' };

        expect(getDashboardDisplayName(user)).toBe('Basic Frontend Try');
        expect(getMemberInitials(user)).toBe('B');
    });
});
