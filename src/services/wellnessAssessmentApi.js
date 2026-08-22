import apiClient from './apiClient';
import { unwrapData } from './apiContract';

const ASSESSMENT_PATH = '/api/v1/onboarding/assessment/';

export const getWellnessAssessment = async () => unwrapData(
    await apiClient.get(ASSESSMENT_PATH)
);

export const saveWellnessAssessment = async (payload) => unwrapData(
    await apiClient.patch(ASSESSMENT_PATH, payload)
);

export const completeWellnessAssessment = async () => unwrapData(
    await apiClient.post(`${ASSESSMENT_PATH}complete/`, {})
);

export const restartWellnessAssessment = async () => unwrapData(
    await apiClient.delete(ASSESSMENT_PATH)
);
