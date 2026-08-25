import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MobileDashboardNav } from '../DashboardPage';

const renderNav = (healthAccess) => {
    const onOpenMore = vi.fn();
    const onSelectSection = vi.fn();
    render(
        <MobileDashboardNav
            activeSection="overview"
            activeCatalogView={null}
            healthAccess={healthAccess}
            onOpenCatalog={vi.fn()}
            onOpenMore={onOpenMore}
            onSelectSection={onSelectSection}
        />
    );
    return { onOpenMore, onSelectSection };
};

describe('MobileDashboardNav', () => {
    it('shows More for Basic members and opens the mobile menu', async () => {
        const user = userEvent.setup();
        const { onOpenMore, onSelectSection } = renderNav({ allowed: false, currentTier: 'BASIC', minimumTier: 'PLUS' });

        expect(screen.queryByRole('button', { name: 'Tracker' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'More' }));

        expect(onOpenMore).toHaveBeenCalledTimes(1);
        expect(onSelectSection).not.toHaveBeenCalled();
    });

    it('shows a working Tracker for Plus and Pro access', async () => {
        const user = userEvent.setup();
        const { onOpenMore, onSelectSection } = renderNav({ allowed: true, currentTier: 'PLUS', minimumTier: 'PLUS' });

        expect(screen.queryByRole('button', { name: 'More' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Tracker' }));

        expect(onSelectSection).toHaveBeenCalledWith('health');
        expect(onOpenMore).not.toHaveBeenCalled();
    });
});
