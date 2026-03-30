import apiClient from './apiClient';

const API_VERSION = '/api/v1';

function toNumber(value) {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
}

function normaliseDebt(rawDebt, index = 0) {
    const currentBalance = toNumber(
        rawDebt?.current_balance ?? rawDebt?.currentBalance ?? rawDebt?.balance ?? rawDebt?.amount
    );

    return {
        id: rawDebt?.uuid ?? rawDebt?.id ?? `debt-${index}`,
        uuid: rawDebt?.uuid ?? rawDebt?.id ?? `debt-${index}`,
        name: rawDebt?.name ?? rawDebt?.title ?? rawDebt?.creditor_name ?? 'Untitled debt',
        creditor: rawDebt?.creditor_name ?? rawDebt?.creditor ?? rawDebt?.name ?? 'Unknown creditor',
        balance: currentBalance,
        interestRate: toNumber(rawDebt?.interestRate ?? rawDebt?.interest_rate ?? rawDebt?.apr),
        minimumPayment: toNumber(rawDebt?.minimumPayment ?? rawDebt?.minimum_payment),
        dueDate: rawDebt?.dueDate ?? rawDebt?.due_date ?? '',
        status: rawDebt?.status ?? (currentBalance > 0 ? 'ACTIVE' : 'PAID_OFF'),
        notes: rawDebt?.notes ?? rawDebt?.description ?? '',
        debtType: rawDebt?.debt_type ?? rawDebt?.debtType ?? 'PERSONAL_LOAN',
        paymentFrequency: rawDebt?.payment_frequency ?? rawDebt?.paymentFrequency ?? 'MONTHLY',
        startDate: rawDebt?.start_date ?? rawDebt?.startDate ?? '',
        isPriority: rawDebt?.is_priority ?? rawDebt?.isPriority ?? false,
        accountNumber: rawDebt?.account_number ?? rawDebt?.accountNumber ?? '',
        currency: rawDebt?.currency ?? 'KES',
    };
}

function extractDebtCollection(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data?.debts)) return payload.data.debts;
    if (Array.isArray(payload?.data?.results)) return payload.data.results;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.debts)) return payload.debts;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
}

function prepareDebtPayload(formValues) {
    const balance = toNumber(formValues.balance);
    const minimumPayment = toNumber(formValues.minimumPayment);
    const interestRate = formValues.interestRate === '' ? null : toNumber(formValues.interestRate);

    return {
        name: formValues.name,
        creditor_name: formValues.creditor || formValues.name,
        original_amount: balance.toString(),
        current_balance: balance.toString(),
        interest_rate: interestRate === null ? null : interestRate.toString(),
        minimum_payment: minimumPayment.toString(),
        due_date: formValues.dueDate || null,
        status: formValues.status || 'ACTIVE',
        notes: formValues.notes,
        currency: formValues.currency || 'KES',
        debt_type: formValues.debtType || 'PERSONAL_LOAN',
        payment_frequency: formValues.paymentFrequency || 'MONTHLY',
        start_date: formValues.startDate || null,
        is_priority: formValues.isPriority ?? false,
        account_number: formValues.accountNumber || '',
    };
}

export async function getDebts() {
    const response = await apiClient.get(`${API_VERSION}/debts/`);
    return extractDebtCollection(response).map((debt, index) => normaliseDebt(debt, index));
}

export async function createDebt(formValues) {
    const response = await apiClient.post(`${API_VERSION}/debts/`, prepareDebtPayload(formValues));
    return normaliseDebt(response?.data ?? response?.debt ?? response);
}

export async function updateDebt(debtId, formValues) {
    const response = await apiClient.patch(`${API_VERSION}/debts/${debtId}/`, prepareDebtPayload(formValues));
    return normaliseDebt(response?.data ?? response?.debt ?? response);
}

export async function deleteDebt(debtId) {
    await apiClient.delete(`${API_VERSION}/debts/${debtId}/`);
    return debtId;
}

export function calculateDebtSummary(debts) {
    const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const weightedInterest = totalBalance
        ? debts.reduce((sum, debt) => sum + (debt.balance * debt.interestRate), 0) / totalBalance
        : 0;

    return {
        totalBalance,
        totalMinimumPayment,
        weightedInterest,
        activeDebts: debts.filter((debt) => debt.status !== 'PAID_OFF').length,
    };
}