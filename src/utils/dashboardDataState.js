const DASHBOARD_DATA_KEY = 'shilingi_has_dashboard_data';
const DASHBOARD_ACTIVE_SECTION_KEY = 'shilingi_active_dashboard_section';
const DEFAULT_DASHBOARD_SECTION = 'overview';

export function markDashboardDataExists() {
    try {
        localStorage.setItem(DASHBOARD_DATA_KEY, 'true');
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

export { DASHBOARD_ACTIVE_SECTION_KEY, DASHBOARD_DATA_KEY, DEFAULT_DASHBOARD_SECTION };
