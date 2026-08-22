import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WellnessAssessmentPage from '../WellnessAssessmentPage';
import {
    completeWellnessAssessment,
    getWellnessAssessment,
    saveWellnessAssessment,
} from '../../services/wellnessAssessmentApi';

vi.mock('../../services/wellnessAssessmentApi', () => ({
    completeWellnessAssessment: vi.fn(),
    getWellnessAssessment: vi.fn(),
    restartWellnessAssessment: vi.fn(),
    saveWellnessAssessment: vi.fn(),
}));

vi.mock('../../utils/profileSetupState', () => ({ shouldShowProfileSetup: () => false }));

const blankAssessment = {
    employment_status: '', financial_stage: '', goals: [], confidence_level: '',
    current_step: 0, is_completed: false, recommendation_reasons: [],
};

describe('WellnessAssessmentPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getWellnessAssessment.mockResolvedValue(blankAssessment);
        saveWellnessAssessment.mockImplementation(async (payload) => ({ ...blankAssessment, ...payload }));
        completeWellnessAssessment.mockResolvedValue({
            ...blankAssessment,
            is_completed: true,
            wellness_score: 48,
            stage_label: 'Safety Net Builder',
            recommended_tier: 'PLUS',
            recommendation_reasons: ['Your current financial stage is Safety Net Builder.'],
        });
    });

    it('saves each step and displays the backend recommendation', async () => {
        const user = userEvent.setup();
        render(<MemoryRouter><WellnessAssessmentPage /></MemoryRouter>);

        await user.click(await screen.findByRole('button', { name: /salaried employee/i }));
        await user.click(screen.getByRole('button', { name: /^next$/i }));
        await user.click(await screen.findByRole('button', { name: /building my emergency savings/i }));
        await user.click(screen.getByRole('button', { name: /^next$/i }));
        await user.click(await screen.findByRole('button', { name: /get out of debt/i }));
        await user.click(screen.getByRole('button', { name: /^next$/i }));
        await user.click(await screen.findByRole('button', { name: /^beginner$/i }));
        await user.click(screen.getByRole('button', { name: /build my recommendation/i }));

        await waitFor(() => expect(completeWellnessAssessment).toHaveBeenCalledOnce());
        expect(await screen.findByRole('heading', { name: /shilingi plus/i })).toBeInTheDocument();
        expect(screen.getByText('48')).toBeInTheDocument();
        expect(screen.getByText('/100')).toBeInTheDocument();
        expect(saveWellnessAssessment).toHaveBeenCalledTimes(4);
    });
});
