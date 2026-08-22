import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../apiClient';
import {
    completeWellnessAssessment,
    getWellnessAssessment,
    restartWellnessAssessment,
    saveWellnessAssessment,
} from '../wellnessAssessmentApi';

vi.mock('../apiClient', () => ({
    default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('wellnessAssessmentApi', () => {
    beforeEach(() => vi.clearAllMocks());

    it('uses the authenticated assessment endpoints and unwraps responses', async () => {
        apiClient.get.mockResolvedValue({ data: { current_step: 1 } });
        apiClient.patch.mockResolvedValue({ data: { employment_status: 'SALARIED' } });
        apiClient.post.mockResolvedValue({ data: { recommended_tier: 'PLUS' } });
        apiClient.delete.mockResolvedValue({ data: { current_step: 0 } });

        await expect(getWellnessAssessment()).resolves.toEqual({ current_step: 1 });
        await expect(saveWellnessAssessment({ employment_status: 'SALARIED' })).resolves.toEqual({ employment_status: 'SALARIED' });
        await expect(completeWellnessAssessment()).resolves.toEqual({ recommended_tier: 'PLUS' });
        await expect(restartWellnessAssessment()).resolves.toEqual({ current_step: 0 });

        expect(apiClient.get).toHaveBeenCalledWith('/api/v1/onboarding/assessment/');
        expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/onboarding/assessment/', { employment_status: 'SALARIED' });
        expect(apiClient.post).toHaveBeenCalledWith('/api/v1/onboarding/assessment/complete/', {});
        expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/onboarding/assessment/');
    });
});
