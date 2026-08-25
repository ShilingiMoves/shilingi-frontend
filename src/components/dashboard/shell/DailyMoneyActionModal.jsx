import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { getCategories } from '../../../services/budgetApi';
import {
    checkAffordability,
    createReminder,
    saveDailyPlan,
    saveShoppingList,
} from '../../../services/dailyMoneyApi';

const actionMeta = {
    plan: { emoji: '🗓️', title: 'Plan Your Day', submit: 'Save my plan' },
    shop: { emoji: '🛒', title: 'Shopping List', submit: 'Save shopping list' },
    remind: { emoji: '🔔', title: 'Set a Reminder', submit: 'Save reminder' },
    afford: { emoji: '🤔', title: 'Can I Afford It?', submit: 'Check now' },
};

const inputClass = 'w-full rounded-xl border border-[#dfe6e2] bg-white px-3 py-2.5 text-sm text-[#16302b] outline-none focus:border-[#0c6060] focus:ring-2 focus:ring-[#0c6060]/10';

const getErrorMessage = (error) => {
    const value = error?.errors || error?.payload?.errors || error?.message;
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') return Object.values(value).flat().join(' ');
    return 'We could not save this right now. Please try again.';
};

const localDateTimeValue = () => {
    const date = new Date(Date.now() + 60 * 60 * 1000);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

const DailyMoneyActionModal = ({ action, today, onClose, onSaved }) => {
    const meta = actionMeta[action];
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [form, setForm] = useState({
        target: today?.daily_target || '',
        planItem: today?.plan?.items?.[0]?.label || '',
        planCost: today?.plan?.items?.[0]?.estimated_cost || '',
        notes: today?.plan?.notes || '',
        listName: today?.shopping?.name || 'My shopping list',
        itemName: '',
        quantity: '1',
        itemPrice: '',
        reminderTitle: '',
        dueAt: localDateTimeValue(),
        amount: '',
        recurrence: 'NONE',
        affordItem: '',
        affordPrice: '',
        category: '',
    });

    const needsCategories = action === 'afford';

    useEffect(() => {
        if (!needsCategories) return undefined;
        let active = true;
        getCategories()
            .then((rows) => active && setCategories(rows))
            .catch(() => active && setError('Add a budget category before running an affordability check.'));
        return () => { active = false; };
    }, [needsCategories]);

    const selectedCategory = useMemo(
        () => categories.find((item) => String(item.value) === String(form.category)),
        [categories, form.category]
    );

    const update = (event) => {
        const { name, value } = event.target;
        setError('');
        setForm((current) => ({ ...current, [name]: value }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        setResult(null);
        try {
            let saved;
            if (action === 'plan') {
                saved = await saveDailyPlan({
                    plan_date: today?.date || new Date().toISOString().slice(0, 10),
                    status: 'ACTIVE',
                    spending_target: form.target,
                    notes: form.notes,
                    items: form.planItem ? [{
                        label: form.planItem,
                        estimated_cost: form.planCost || '0',
                        sort_order: 0,
                    }] : [],
                }, today?.plan?.uuid);
            } else if (action === 'shop') {
                saved = await saveShoppingList({
                    name: form.listName,
                    status: 'ACTIVE',
                    items: [...(today?.shopping?.items || []), {
                        name: form.itemName,
                        quantity: Number(form.quantity || 1),
                        estimated_unit_price: form.itemPrice || '0',
                    }].map((item) => ({
                        name: item.name,
                        quantity: item.quantity,
                        estimated_unit_price: item.estimated_unit_price,
                        is_purchased: item.is_purchased || false,
                    })),
                }, today?.shopping?.uuid);
            } else if (action === 'remind') {
                saved = await createReminder({
                    title: form.reminderTitle,
                    due_at: new Date(form.dueAt).toISOString(),
                    amount: form.amount,
                    recurrence: form.recurrence,
                });
            } else {
                saved = await checkAffordability({
                    item_name: form.affordItem,
                    price: form.affordPrice,
                    category: selectedCategory?.uuid || form.category,
                    idempotency_key: globalThis.crypto?.randomUUID?.() || `${Date.now()}`,
                });
                setResult(saved);
                setSubmitting(false);
                return;
            }
            onSaved?.(saved);
        } catch (submitError) {
            setError(getErrorMessage(submitError));
        } finally {
            setSubmitting(false);
        }
    };

    if (!meta) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={onClose}>
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[26px] bg-[#f8faf9] shadow-2xl sm:rounded-[26px]" onMouseDown={(event) => event.stopPropagation()}>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e4e9e6] bg-[#f8faf9]/95 px-5 py-4 backdrop-blur">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4f0ee] text-lg">{meta.emoji}</span>
                        <div><h3 className="font-extrabold text-[#16302b]">{meta.title}</h3><p className="text-[11px] text-[#68736f]">Saved securely to your Shilingi account</p></div>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 text-[#68736f] hover:bg-[#e9eeeb]" aria-label="Close"><X size={19} /></button>
                </div>

                <form onSubmit={submit} className="space-y-4 p-5">
                    {action === 'plan' && <>
                        <Field label="Today's spending target (KES)"><input required min="0" step="0.01" type="number" name="target" value={form.target} onChange={update} className={inputClass} placeholder="2,000" /></Field>
                        <Field label="Main thing to do"><input name="planItem" value={form.planItem} onChange={update} className={inputClass} placeholder="e.g. Buy groceries after work" /></Field>
                        <Field label="Estimated cost (KES)"><input min="0" step="0.01" type="number" name="planCost" value={form.planCost} onChange={update} className={inputClass} placeholder="0" /></Field>
                        <Field label="Notes"><textarea name="notes" value={form.notes} onChange={update} className={`${inputClass} min-h-20 resize-none`} placeholder="Anything you want to remember today" /></Field>
                    </>}

                    {action === 'shop' && <>
                        <Field label="List name"><input required name="listName" value={form.listName} onChange={update} className={inputClass} /></Field>
                        <Field label="Item"><input required name="itemName" value={form.itemName} onChange={update} className={inputClass} placeholder="e.g. Maize flour" /></Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Quantity"><input required min="1" type="number" name="quantity" value={form.quantity} onChange={update} className={inputClass} /></Field>
                            <Field label="Price each (KES)"><input min="0" step="0.01" type="number" name="itemPrice" value={form.itemPrice} onChange={update} className={inputClass} placeholder="0" /></Field>
                        </div>
                    </>}

                    {action === 'remind' && <>
                        <Field label="Reminder"><input required name="reminderTitle" value={form.reminderTitle} onChange={update} className={inputClass} placeholder="e.g. Pay electricity bill" /></Field>
                        <Field label="Date and time"><input required type="datetime-local" name="dueAt" value={form.dueAt} onChange={update} className={inputClass} /></Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Amount (KES)"><input min="0" step="0.01" type="number" name="amount" value={form.amount} onChange={update} className={inputClass} placeholder="Optional" /></Field>
                            <Field label="Repeat"><select name="recurrence" value={form.recurrence} onChange={update} className={inputClass}><option value="NONE">Never</option><option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option></select></Field>
                        </div>
                    </>}

                    {action === 'afford' && <>
                        <Field label="What do you want to buy?"><input required name="affordItem" value={form.affordItem} onChange={update} className={inputClass} placeholder="e.g. New phone" /></Field>
                        <Field label="Price (KES)"><input required min="0.01" step="0.01" type="number" name="affordPrice" value={form.affordPrice} onChange={update} className={inputClass} placeholder="0" /></Field>
                        <Field label="Budget category"><select required name="category" value={form.category} onChange={update} className={inputClass}><option value="">Choose category</option>{categories.map((item) => <option key={item.uuid || item.id} value={item.value}>{item.name}</option>)}</select></Field>
                    </>}

                    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">{error}</p>}

                    {result && <div className="rounded-2xl border border-[#b9dfd1] bg-[#e7f6f0] p-4 text-[#174c3b]"><p className="text-sm font-extrabold">{result.verdict?.replaceAll('_', ' ')}</p><p className="mt-1 text-xs leading-relaxed">{result.rationale}</p><button type="button" onClick={() => onSaved?.(result)} className="mt-3 text-xs font-bold text-[#0c6060]">Done</button></div>}

                    {!result && <button type="submit" disabled={submitting || (needsCategories && categories.length === 0)} className="w-full rounded-xl bg-[#0c6060] px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#0c6060]/15 transition hover:bg-[#094c4c] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? 'Saving...' : meta.submit}</button>}
                </form>
            </div>
        </div>
    );
};

const Field = ({ label, children }) => <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#45534e]">{label}</span>{children}</label>;

export default DailyMoneyActionModal;
