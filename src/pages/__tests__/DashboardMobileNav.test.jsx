import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MobileDashboardNav } from '../DashboardPage';

const renderNav = () => {
    const onOpenMore = vi.fn();
    const onOpenTracker = vi.fn();
    const onSelectSection = vi.fn();
    render(
        <MobileDashboardNav
            activeSection="overview"
            activeCatalogView={null}
            onOpenCatalog={vi.fn()}
            onOpenMore={onOpenMore}
            onOpenTracker={onOpenTracker}
            onSelectSection={onSelectSection}
        />
    );
    return { onOpenMore, onOpenTracker, onSelectSection };
};

describe('MobileDashboardNav', () => {
    it('places Tracker before More and keeps both actions working', async () => {
        const user = userEvent.setup();
        const { onOpenMore, onOpenTracker, onSelectSection } = renderNav();

        const buttons = screen.getAllByRole('button');
        expect(buttons.map((button) => button.textContent)).toEqual(['🏠Home', '📊Planners', '🧭Hubs', '💬Community', '📈Tracker', '•••More']);
        await user.click(screen.getByRole('button', { name: 'Tracker' }));
        await user.click(screen.getByRole('button', { name: 'More' }));

        expect(onOpenTracker).toHaveBeenCalledTimes(1);
        expect(onOpenMore).toHaveBeenCalledTimes(1);
        expect(onSelectSection).not.toHaveBeenCalled();
    });
});
