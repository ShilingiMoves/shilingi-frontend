export const PROFILE_SETUP_PENDING_KEY = 'shilingi_profile_setup_pending';
export const PROFILE_SETUP_COMPLETE_KEY = 'shilingi_profile_setup_complete';

export function markProfileSetupPending() {
    try {
        localStorage.setItem(PROFILE_SETUP_PENDING_KEY, 'true');
        localStorage.removeItem(PROFILE_SETUP_COMPLETE_KEY);
    } catch (error) {
        console.warn('Could not mark profile setup as pending:', error);
    }
}

export function shouldShowProfileSetup() {
    try {
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
    } catch (error) {
        console.warn('Could not complete profile setup:', error);
    }
}
