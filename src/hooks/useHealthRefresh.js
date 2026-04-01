import { useCallback } from 'react';

export const useHealthRefresh = () => {
    const triggerHealthRefresh = useCallback(() => {
        // Set a flag in localStorage to trigger refresh
        localStorage.setItem('healthRefreshTrigger', Date.now().toString());
        
        // Dispatch custom event for immediate updates
        window.dispatchEvent(new CustomEvent('healthRefreshRequested'));
    }, []);

    return { triggerHealthRefresh };
};