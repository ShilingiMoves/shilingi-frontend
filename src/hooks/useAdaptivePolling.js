import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_MIN_INTERVAL_MS = 5 * 60 * 1000;
const DEFAULT_MAX_INTERVAL_MS = 20 * 60 * 1000;
const DEFAULT_BACKOFF_FACTOR = 1.6;
const DEFAULT_STALE_REFRESH_MS = 2 * 60 * 1000;

function getVisibilityState() {
    if (typeof document === 'undefined') {
        return 'visible';
    }

    return document.visibilityState || (document.hidden ? 'hidden' : 'visible');
}

function getOnlineState() {
    if (typeof navigator === 'undefined' || typeof navigator.onLine !== 'boolean') {
        return true;
    }

    return navigator.onLine;
}

function getPayloadSignature(payload) {
    if (payload === undefined) {
        return null;
    }

    try {
        return JSON.stringify(payload);
    } catch {
        return String(Date.now());
    }
}

export function useAdaptivePolling({
    enabled = true,
    poll,
    minIntervalMs = DEFAULT_MIN_INTERVAL_MS,
    maxIntervalMs = DEFAULT_MAX_INTERVAL_MS,
    backoffFactor = DEFAULT_BACKOFF_FACTOR,
    staleRefreshMs = DEFAULT_STALE_REFRESH_MS,
} = {}) {
    const pollRef = useRef(poll);
    const timeoutRef = useRef(null);
    const intervalRef = useRef(minIntervalMs);
    const signatureRef = useRef(null);
    const lastRunAtRef = useRef(null);
    const inFlightRef = useRef(false);
    const [status, setStatus] = useState({
        isVisible: getVisibilityState() === 'visible',
        isOnline: getOnlineState(),
        isPolling: false,
        nextRunInMs: enabled ? minIntervalMs : null,
        currentIntervalMs: minIntervalMs,
        lastRunAt: null,
        lastChangedAt: null,
        lastError: null,
        pausedReason: enabled ? null : 'disabled',
    });

    useEffect(() => {
        pollRef.current = poll;
    }, [poll]);

    const clearScheduledPoll = useCallback(() => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const updatePausedState = useCallback(() => {
        const isVisible = getVisibilityState() === 'visible';
        const isOnline = getOnlineState();
        const pausedReason = !enabled ? 'disabled' : !isOnline ? 'offline' : !isVisible ? 'hidden' : null;

        setStatus((previous) => ({
            ...previous,
            isVisible,
            isOnline,
            isPolling: pausedReason ? false : previous.isPolling,
            nextRunInMs: pausedReason ? null : previous.nextRunInMs,
            pausedReason,
        }));

        return { isVisible, isOnline, pausedReason };
    }, [enabled]);

    const schedulePoll = useCallback((delayMs) => {
        clearScheduledPoll();

        if (!enabled) {
            updatePausedState();
            return;
        }

        const { pausedReason } = updatePausedState();
        if (pausedReason) {
            return;
        }

        const safeDelay = Math.max(0, delayMs);
        setStatus((previous) => ({
            ...previous,
            nextRunInMs: safeDelay,
            currentIntervalMs: intervalRef.current,
        }));

        timeoutRef.current = window.setTimeout(async () => {
            if (inFlightRef.current || !pollRef.current) {
                schedulePoll(intervalRef.current);
                return;
            }

            const currentState = updatePausedState();
            if (currentState.pausedReason) {
                return;
            }

            inFlightRef.current = true;
            setStatus((previous) => ({
                ...previous,
                isPolling: true,
                nextRunInMs: null,
                lastError: null,
            }));

            try {
                const payload = await pollRef.current();
                const nextSignature = getPayloadSignature(payload);
                const changed = nextSignature !== null && nextSignature !== signatureRef.current;
                const now = Date.now();

                if (changed) {
                    signatureRef.current = nextSignature;
                    intervalRef.current = minIntervalMs;
                } else {
                    intervalRef.current = Math.min(
                        maxIntervalMs,
                        Math.ceil(intervalRef.current * backoffFactor)
                    );
                }

                lastRunAtRef.current = now;
                setStatus((previous) => ({
                    ...previous,
                    isPolling: false,
                    lastRunAt: now,
                    lastChangedAt: changed ? now : previous.lastChangedAt,
                    currentIntervalMs: intervalRef.current,
                    lastError: null,
                }));
            } catch (error) {
                intervalRef.current = Math.min(
                    maxIntervalMs,
                    Math.ceil(intervalRef.current * backoffFactor)
                );

                setStatus((previous) => ({
                    ...previous,
                    isPolling: false,
                    currentIntervalMs: intervalRef.current,
                    lastError: error?.message || 'Refresh failed',
                }));
            } finally {
                inFlightRef.current = false;
                schedulePoll(intervalRef.current);
            }
        }, safeDelay);
    }, [backoffFactor, clearScheduledPoll, enabled, maxIntervalMs, minIntervalMs, updatePausedState]);

    const refreshNow = useCallback(() => {
        intervalRef.current = minIntervalMs;
        schedulePoll(0);
    }, [minIntervalMs, schedulePoll]);

    useEffect(() => {
        if (!enabled || !poll) {
            clearScheduledPoll();
            updatePausedState();
            return undefined;
        }

        schedulePoll(intervalRef.current);

        const handleVisibilityChange = () => {
            const { pausedReason } = updatePausedState();
            if (!pausedReason) {
                const lastRunAt = lastRunAtRef.current;
                const shouldRefreshNow = !lastRunAt || Date.now() - lastRunAt > staleRefreshMs;
                schedulePoll(shouldRefreshNow ? 0 : intervalRef.current);
            } else {
                clearScheduledPoll();
            }
        };

        const handleOnline = () => {
            updatePausedState();
            schedulePoll(0);
        };

        const handleOffline = () => {
            clearScheduledPoll();
            updatePausedState();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearScheduledPoll();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [clearScheduledPoll, enabled, poll, schedulePoll, staleRefreshMs, updatePausedState]);

    return {
        ...status,
        refreshNow,
    };
}
