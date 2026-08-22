import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SignInPage from '../SignInPage';
import { loginUser } from '../../services/authApi';
import { getWellnessAssessment } from '../../services/wellnessAssessmentApi';

vi.mock('../../services/authApi', () => ({
    hasStoredAccessToken: () => false,
    loginUser: vi.fn(),
    resendVerificationEmail: vi.fn(),
}));

vi.mock('../../utils/memberIdentity', () => ({
    hasAnyPreferredName: () => true,
    queuePreferredNamePrompt: vi.fn(),
}));

vi.mock('../../utils/profileSetupState', () => ({
    shouldShowProfileSetup: () => false,
}));

vi.mock('../../services/wellnessAssessmentApi', () => ({
    getWellnessAssessment: vi.fn(),
}));

describe('SignInPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        loginUser.mockResolvedValue({ data: { user: { email: 'plus.frontend@shilingimove.test' }, tokens: { access: 'test' } } });
        getWellnessAssessment.mockResolvedValue({ is_completed: true });
    });

    it('submits the exact values present in the form', async () => {
        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>,
        );

        const email = screen.getByLabelText('Email address');
        const password = screen.getByPlaceholderText('Enter your password');
        fireEvent.change(email, { target: { name: 'email', value: 'PLUS.FRONTEND@SHILINGIMOVE.TEST ' } });
        fireEvent.change(password, { target: { name: 'password', value: 'SafePass9!' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }).closest('form'));

        await waitFor(() => expect(loginUser).toHaveBeenCalledWith({
            email: 'plus.frontend@shilingimove.test',
            password: 'SafePass9!',
        }));
    });
});
