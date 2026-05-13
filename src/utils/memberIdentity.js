export const PREFERRED_NAME_KEY = 'shilingi_preferred_profile_name';
export const PREFERRED_NAME_UPDATED_EVENT = 'shilingi-preferred-name-updated';
export const PROFILE_NAME_PROMPT_KEY = 'shilingi_show_preferred_name_prompt';
export const PROFILE_NAME_PROMPT_REASON_KEY = 'shilingi_preferred_name_prompt_reason';

const MEMBER_NUMBER_PREFIX = '154';
const MEMBER_NUMBER_SUFFIX_LENGTH = 4;
const DEFAULT_MEMBER_NUMBER_SUFFIX = '2217';

const toStableOffset = (value) => {
    const source = String(value || 'shilingi-member').trim().toLowerCase();
    let hash = 0;

    for (let index = 0; index < source.length; index += 1) {
        hash = ((hash << 5) - hash) + source.charCodeAt(index);
        hash |= 0;
    }

    return Math.abs(hash) % (10 ** MEMBER_NUMBER_SUFFIX_LENGTH);
};

const getGeneratedMemberNumber = (user = {}) => {
    const numericId = Number(user?.id || user?.profile?.user_id);

    if (Number.isFinite(numericId) && numericId > 0) {
        const suffix = String(Math.floor(numericId) % (10 ** MEMBER_NUMBER_SUFFIX_LENGTH)).padStart(MEMBER_NUMBER_SUFFIX_LENGTH, '0');
        return `${MEMBER_NUMBER_PREFIX}${suffix}`;
    }

    const stableSeed = user?.uuid || user?.email;
    if (!stableSeed) {
        return `${MEMBER_NUMBER_PREFIX}${DEFAULT_MEMBER_NUMBER_SUFFIX}`;
    }

    const suffix = String(toStableOffset(stableSeed)).padStart(MEMBER_NUMBER_SUFFIX_LENGTH, '0');
    return `${MEMBER_NUMBER_PREFIX}${suffix}`;
};

export const getMemberNumber = (user = {}) => {
    const explicitNumber = user?.member_number
        || user?.memberNumber
        || user?.customer_number
        || user?.account_number
        || user?.profile?.member_number
        || user?.profile?.memberNumber;

    if (explicitNumber) {
        const digits = String(explicitNumber).replace(/^member\s*(no\.?|number)?\s*/i, '').replace(/\D/g, '');
        if (digits) {
            const suffix = digits.startsWith(MEMBER_NUMBER_PREFIX)
                ? digits.slice(MEMBER_NUMBER_PREFIX.length).slice(-MEMBER_NUMBER_SUFFIX_LENGTH)
                : digits.slice(-MEMBER_NUMBER_SUFFIX_LENGTH);

            return `MN ${MEMBER_NUMBER_PREFIX}${suffix.padStart(MEMBER_NUMBER_SUFFIX_LENGTH, '0')}`;
        }
    }

    return `MN ${getGeneratedMemberNumber(user)}`;
};

export const getMemberLabel = (user = {}) => `Member Number ${getMemberNumber(user)}`;

export const getMemberInitials = (user = {}) => {
    const firstInitial = String(user?.first_name || '').trim().charAt(0);
    const lastInitial = String(user?.last_name || '').trim().charAt(0);
    const initials = `${firstInitial}${lastInitial}`.trim();

    if (initials) {
        return initials.toUpperCase();
    }

    return 'SM';
};

export const getStoredPreferredName = () => {
    if (typeof window === 'undefined') return '';

    try {
        return window.localStorage.getItem(PREFERRED_NAME_KEY) || '';
    } catch {
        return '';
    }
};

export const getDashboardDisplayName = (user = {}) => {
    const storedPreferredName = getStoredPreferredName().trim();
    if (storedPreferredName) return storedPreferredName;

    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
    return fullName || user?.name || 'My Profile';
};

export const setStoredPreferredName = (name) => {
    if (typeof window === 'undefined') return;

    try {
        const nextName = String(name || '').trim();
        if (nextName) {
            window.localStorage.setItem(PREFERRED_NAME_KEY, nextName);
            window.dispatchEvent(new CustomEvent(PREFERRED_NAME_UPDATED_EVENT, { detail: { preferredName: nextName } }));
            return;
        }

        window.localStorage.removeItem(PREFERRED_NAME_KEY);
        window.dispatchEvent(new CustomEvent(PREFERRED_NAME_UPDATED_EVENT, { detail: { preferredName: '' } }));
    } catch {
        // Local storage may be blocked. The profile can still work without it.
    }
};

export const queuePreferredNamePrompt = (reason = 'returning') => {
    if (typeof window === 'undefined') return;

    try {
        if (getStoredPreferredName().trim()) {
            return;
        }

        window.sessionStorage.setItem(PROFILE_NAME_PROMPT_KEY, '1');
        window.sessionStorage.setItem(PROFILE_NAME_PROMPT_REASON_KEY, reason);
    } catch {
        // Session storage may be blocked. Skipping the prompt is safer than blocking login.
    }
};

export const readQueuedPreferredNamePrompt = () => {
    if (typeof window === 'undefined') {
        return { shouldShow: false, reason: 'returning' };
    }

    try {
        return {
            shouldShow: window.sessionStorage.getItem(PROFILE_NAME_PROMPT_KEY) === '1',
            reason: window.sessionStorage.getItem(PROFILE_NAME_PROMPT_REASON_KEY) || 'returning',
        };
    } catch {
        return { shouldShow: false, reason: 'returning' };
    }
};

export const clearQueuedPreferredNamePrompt = () => {
    if (typeof window === 'undefined') return;

    try {
        window.sessionStorage.removeItem(PROFILE_NAME_PROMPT_KEY);
        window.sessionStorage.removeItem(PROFILE_NAME_PROMPT_REASON_KEY);
    } catch {
        // Nothing to clean up if storage is unavailable.
    }
};
