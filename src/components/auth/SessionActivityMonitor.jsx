import { useEffect, useRef } from 'react';
import { refreshSession } from '../../services/authApi';
import {
    getAccessToken,
    handleUnauthorizedSession,
    isSessionIdle,
    markSessionActivity,
    shouldRefreshSession,
} from '../../services/sessionManager';

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
const ACTIVITY_THROTTLE_MS = 15 * 1000;
const SESSION_CHECK_MS = 60 * 1000;

const SessionActivityMonitor = () => {
    const lastRecordedActivityRef = useRef(0);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const recordActivity = () => {
            const now = Date.now();
            if (now - lastRecordedActivityRef.current < ACTIVITY_THROTTLE_MS) {
                return;
            }

            lastRecordedActivityRef.current = now;
            if (getAccessToken()) {
                markSessionActivity(now);
            }
        };

        const checkSession = async () => {
            if (!getAccessToken()) {
                return;
            }

            if (isSessionIdle()) {
                handleUnauthorizedSession();
                return;
            }

            if (shouldRefreshSession()) {
                await refreshSession();
            }
        };

        recordActivity();
        ACTIVITY_EVENTS.forEach((eventName) => {
            window.addEventListener(eventName, recordActivity, { passive: true });
        });
        document.addEventListener('visibilitychange', checkSession);

        const intervalId = window.setInterval(checkSession, SESSION_CHECK_MS);

        return () => {
            ACTIVITY_EVENTS.forEach((eventName) => {
                window.removeEventListener(eventName, recordActivity);
            });
            document.removeEventListener('visibilitychange', checkSession);
            window.clearInterval(intervalId);
        };
    }, []);

    return null;
};

export default SessionActivityMonitor;
