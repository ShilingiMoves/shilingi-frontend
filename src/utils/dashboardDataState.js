const DASHBOARD_DATA_KEY = 'shilingi_has_dashboard_data';
const DASHBOARD_ACTIVE_SECTION_KEY = 'shilingi_active_dashboard_section';
const DASHBOARD_PILLAR_PROGRESS_KEY = 'shilingi_dashboard_pillar_progress';
const DEFAULT_DASHBOARD_SECTION = 'overview';

export function markDashboardDataExists() {
    try {
        localStorage.setItem(DASHBOARD_DATA_KEY, 'true');
        localStorage.setItem('healthRefreshTrigger', JSON.stringify({
            timestamp: Date.now(),
            source: 'dashboard-data',
        }));
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('healthRefreshRequested', {
                detail: { source: 'dashboard-data' },
            }));
        }
    } catch (error) {
        console.warn('Could not persist dashboard data flag:', error);
    }
}

export function getInitialDashboardSection() {
    try {
        return localStorage.getItem(DASHBOARD_ACTIVE_SECTION_KEY) || DEFAULT_DASHBOARD_SECTION;
    } catch (error) {
        console.warn('Could not read active dashboard section:', error);
        return DEFAULT_DASHBOARD_SECTION;
    }
}

export function persistDashboardSection(sectionId) {
    try {
        localStorage.setItem(DASHBOARD_ACTIVE_SECTION_KEY, sectionId);
    } catch (error) {
        console.warn('Could not persist active dashboard section:', error);
    }
}

export function readDashboardPillarProgress() {
    try {
        return JSON.parse(localStorage.getItem(DASHBOARD_PILLAR_PROGRESS_KEY) || '{}');
    } catch (error) {
        console.warn('Could not read dashboard pillar progress:', error);
        return {};
    }
}

export function readDashboardPillarProgressItem(sectionId) {
    return readDashboardPillarProgress()?.[sectionId] || null;
}

export function persistDashboardPillarProgress(sectionId, progress = {}) {
    try {
        const current = readDashboardPillarProgress();
        const previous = current[sectionId] || {};
        const now = new Date().toISOString();
        localStorage.setItem(DASHBOARD_PILLAR_PROGRESS_KEY, JSON.stringify({
            ...current,
            [sectionId]: {
                ...previous,
                sectionId,
                startedAt: previous.startedAt || now,
                status: progress.status || previous.status || 'started',
                updatedAt: now,
                ...progress,
            },
        }));
    } catch (error) {
        console.warn('Could not persist dashboard pillar progress:', error);
    }
}

export {
    DASHBOARD_ACTIVE_SECTION_KEY,
    DASHBOARD_DATA_KEY,
    DASHBOARD_PILLAR_PROGRESS_KEY,
    DEFAULT_DASHBOARD_SECTION,
};
