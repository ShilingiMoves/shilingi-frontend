import { useCallback } from 'react';

export const useHealthRefresh = () => {
    const triggerHealthRefresh = useCallback((source = 'dashboard') => {
        const payload = {
            timestamp: Date.now(),
            source,
        };

        // Set a flag in localStorage to trigger refresh
        localStorage.setItem('healthRefreshTrigger', JSON.stringify(payload));

        // Dispatch custom event for immediate updates
        window.dispatchEvent(new CustomEvent('healthRefreshRequested', { detail: payload }));
    }, []);

    return { triggerHealthRefresh };
};
