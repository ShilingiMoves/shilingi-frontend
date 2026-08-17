import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PlannerShortcutCards } from '../DashboardOverview';

describe('PlannerShortcutCards', () => {
    it('renders Tax Planner immediately after Budget Planner', () => {
        render(<PlannerShortcutCards onSelectSection={vi.fn()} />);

        expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
            expect.stringContaining('Budget Planner'),
            expect.stringContaining('Tax Planner'),
        ]);
    });

    it('opens the existing Tax Planner pillar', async () => {
        const onSelectSection = vi.fn();
        const user = userEvent.setup();
        render(<PlannerShortcutCards onSelectSection={onSelectSection} />);

        await user.click(screen.getByRole('button', { name: /open tax planner/i }));

        expect(onSelectSection).toHaveBeenCalledWith('tax');
    });
});
