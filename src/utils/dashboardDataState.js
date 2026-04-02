const DASHBOARD_DATA_KEY = 'shilingi_has_dashboard_data';

export function markDashboardDataExists() {
    try {
        localStorage.setItem(DASHBOARD_DATA_KEY, 'true');
    } catch (error) {
        console.warn('Could not persist dashboard data flag:', error);
    }
}

export function getInitialDashboardSection() {
    return 'overview';
}

export { DASHBOARD_DATA_KEY };
