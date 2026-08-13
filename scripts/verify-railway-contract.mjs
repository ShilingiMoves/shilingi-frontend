import { readFileSync } from 'node:fs';

const loadAcceptanceEnv = (filePath) => {
    if (!filePath) return;
    const values = {};
    for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!match) continue;
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        values[match[1]] = value;
    }
    for (const name of ['FRONTEND_TEST_BASIC_PASSWORD', 'FRONTEND_TEST_PLUS_PASSWORD', 'FRONTEND_TEST_PRO_PASSWORD']) {
        if (!process.env[name] && values[name]) process.env[name] = values[name];
    }
};

loadAcceptanceEnv(process.env.SHILINGI_ACCEPTANCE_ENV_FILE);

const baseUrl = String(process.env.SHILINGI_API_URL || 'https://shilingi-backend-production.up.railway.app').replace(/\/$/, '');

const accounts = [
    { tier: 'BASIC', email: 'basic.frontend@shilingimove.test', password: process.env.FRONTEND_TEST_BASIC_PASSWORD },
    { tier: 'PLUS', email: 'plus.frontend@shilingimove.test', password: process.env.FRONTEND_TEST_PLUS_PASSWORD },
    { tier: 'PRO', email: 'pro.frontend@shilingimove.test', password: process.env.FRONTEND_TEST_PRO_PASSWORD },
];

const plannerFixtures = {
    tax: { gross_income: '120000', period: 'MONTHLY', tax_year: new Date().getFullYear(), is_resident: true },
    protection: { annual_income: '1440000', dependants: 2, income_replacement_years: '8', outstanding_debts: '250000' },
    investment: {
        goal_name: 'Acceptance goal', target_amount: '5000000', horizon_years: 8,
        risk_profile: 'BALANCED', initial_investment: '100000', monthly_contribution: '20000',
        expected_annual_return_percent: '8', annual_fee_percent: '0', inflation_percent: '0',
    },
    retirement: {
        current_age: 35, retirement_age: 60, life_expectancy: 85,
        current_retirement_savings: '250000', monthly_contribution: '15000',
        desired_monthly_income_today: '120000', pre_retirement_return_percent: '8',
        post_retirement_return_percent: '6', inflation_percent: '5',
    },
};

const accessMatrix = {
    BASIC: { tax: 200, protection: 403, investment: 403, retirement: 403 },
    PLUS: { tax: 200, protection: 200, investment: 403, retirement: 403 },
    PRO: { tax: 200, protection: 200, investment: 200, retirement: 200 },
};

const request = async (path, { method = 'GET', token, body, expected = 200 } = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
            Accept: 'application/json',
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (response.status !== expected) throw new Error(`${method} ${path}: expected ${expected}, received ${response.status}`);
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
};

const tokenSource = (payload) => payload?.data?.tokens || payload?.data || payload || {};

const verifyPlannerLifecycle = async (planner, token) => {
    const createdPayload = await request(`/api/v1/${planner}-planner/`, {
        method: 'POST', token, expected: 201,
        body: { name: `Codex acceptance ${new Date().toISOString()}`, ...plannerFixtures[planner] },
    });
    const created = createdPayload?.data || createdPayload;
    if (!created?.uuid) throw new Error(`${planner}: create response omitted uuid`);
    try {
        await request(`/api/v1/${planner}-planner/${created.uuid}/`, { token });
        await request(`/api/v1/${planner}-planner/${created.uuid}/`, {
            method: 'PATCH', token, body: { name: `Codex acceptance updated ${Date.now()}` },
        });
        await request(`/api/v1/${planner}-planner/${created.uuid}/recalculate/`, { method: 'POST', token });
    } finally {
        await request(`/api/v1/${planner}-planner/${created.uuid}/`, { method: 'DELETE', token, expected: 200 });
    }
};

const verifyAccount = async (account) => {
    if (!account.password) return { tier: account.tier, status: 'SKIPPED_MISSING_PASSWORD' };
    const login = await request('/api/v1/auth/login/', {
        method: 'POST', body: { email: account.email, password: account.password },
    });
    let { access, refresh } = tokenSource(login);
    if (!access || !refresh) throw new Error(`${account.tier}: login response omitted tokens`);
    try {
        const tierPayload = await request('/api/v1/users/me/tier/', { token: access });
        const tierInfo = tierPayload?.data || tierPayload;
        if (tierInfo?.current_tier !== account.tier) throw new Error(`${account.tier}: tier endpoint returned ${tierInfo?.current_tier}`);

        const refreshed = await request('/api/v1/auth/token/refresh/', { method: 'POST', body: { refresh } });
        const replacement = tokenSource(refreshed);
        access = replacement.access || access;
        refresh = replacement.refresh || refresh;

        const checks = {};
        for (const [planner, expected] of Object.entries(accessMatrix[account.tier])) {
            await request(`/api/v1/${planner}-planner/`, { token: access, expected });
            checks[planner] = expected;
            if (expected === 200) await verifyPlannerLifecycle(planner, access);
        }
        return { tier: account.tier, status: 'PASSED', entitlementCount: tierInfo.entitlements?.length || 0, checks };
    } finally {
        if (access && refresh) {
            await request('/api/v1/auth/logout/', { method: 'POST', token: access, body: { refresh } }).catch(() => null);
        }
        access = null;
        refresh = null;
    }
};

const health = await request('/health/ready/');
const results = [];
for (const account of accounts) {
    try {
        results.push(await verifyAccount(account));
    } catch (error) {
        results.push({ tier: account.tier, status: 'FAILED', reason: error.message });
    }
}

console.log(JSON.stringify({ api: baseUrl, health: health?.status || 'ok', results }, null, 2));
if (results.some((result) => result.status === 'FAILED')) process.exitCode = 1;
