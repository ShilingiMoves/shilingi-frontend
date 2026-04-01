const DASHBOARD_DATA_KEY = 'shilingi_has_dashboard_data';

export function markDashboardDataExists() {
    localStorage.setItem(DASHBOARD_DATA_KEY, 'true');
}

export function getInitialDashboardSection() {
    return localStorage.getItem(DASHBOARD_DATA_KEY) === 'true' ? 'networth' : 'cashflow';
}

export { DASHBOARD_DATA_KEY };
