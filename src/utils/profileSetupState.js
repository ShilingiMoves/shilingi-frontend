export const PROFILE_SETUP_PENDING_KEY = 'shilingi_profile_setup_pending';
export const PROFILE_SETUP_PENDING_EMAIL_KEY = 'shilingi_profile_setup_pending_email';
export const PROFILE_SETUP_COMPLETE_KEY = 'shilingi_profile_setup_complete';

export function markProfileSetupPending(email = '') {
    try {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        localStorage.setItem(PROFILE_SETUP_PENDING_KEY, 'true');
        if (normalizedEmail) {
            localStorage.setItem(PROFILE_SETUP_PENDING_EMAIL_KEY, normalizedEmail);
        }
        localStorage.removeItem(PROFILE_SETUP_COMPLETE_KEY);
    } catch (error) {
        console.warn('Could not mark profile setup as pending:', error);
    }
}

export function shouldShowProfileSetup(email = '') {
    try {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const pendingEmail = localStorage.getItem(PROFILE_SETUP_PENDING_EMAIL_KEY) || '';
        if (pendingEmail && normalizedEmail && pendingEmail !== normalizedEmail) {
            return false;
        }

        return localStorage.getItem(PROFILE_SETUP_PENDING_KEY) === 'true'
            && localStorage.getItem(PROFILE_SETUP_COMPLETE_KEY) !== 'true';
    } catch {
        return false;
    }
}

export function completeProfileSetup() {
    try {
        localStorage.setItem(PROFILE_SETUP_COMPLETE_KEY, 'true');
        localStorage.removeItem(PROFILE_SETUP_PENDING_KEY);
        localStorage.removeItem(PROFILE_SETUP_PENDING_EMAIL_KEY);
    } catch (error) {
        console.warn('Could not complete profile setup:', error);
    }
}
