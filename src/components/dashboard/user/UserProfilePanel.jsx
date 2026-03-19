import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import UserAccountForm from './UserAccountForm';
import UserPasswordForm from './UserPasswordForm';
import UserPreferencesForm from './UserPreferencesForm';
import UserTierCard from './UserTierCard';
import {
    changeUserPassword,
    getUserAccount,
    getUserTier,
    updateUserAccount,
    updateUserPreferences,
} from '../../../services/userApi';

const UserProfilePanel = () => {
    const [user, setUser] = useState(null);
    const [tier, setTier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [savingAccount, setSavingAccount] = useState(false);
    const [savingPreferences, setSavingPreferences] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        const loadUserWorkspace = async () => {
            try {
                setLoading(true);
                setError('');
                const [userResponse, tierResponse] = await Promise.allSettled([
                    getUserAccount(),
                    getUserTier(),
                ]);

                if (userResponse.status === 'fulfilled') {
                    setUser(userResponse.value);
                } else {
                    throw userResponse.reason;
                }

                if (tierResponse.status === 'fulfilled') {
                    setTier(tierResponse.value);
                }
            } catch (err) {
                setError(err.message || 'We could not load your account workspace right now.');
            } finally {
                setLoading(false);
            }
        };

        loadUserWorkspace();
    }, []);

    const handleAccountSave = async (formValues) => {
        try {
            setSavingAccount(true);
            setSuccess('');
            setError('');
            const updatedUser = await updateUserAccount(formValues);
            setUser((current) => ({
                ...current,
                ...updatedUser,
            }));
            setSuccess('Your account details have been updated.');
        } catch (err) {
            setError(err.message || 'We could not save your account details right now.');
        } finally {
            setSavingAccount(false);
        }
    };

    const handlePreferencesSave = async (formValues) => {
        try {
            setSavingPreferences(true);
            setSuccess('');
            setError('');
            const updatedProfile = await updateUserPreferences(formValues);
            setUser((current) => ({
                ...current,
                profile: {
                    ...current?.profile,
                    ...updatedProfile,
                },
            }));
            setSuccess('Your financial preferences have been updated.');
        } catch (err) {
            setError(err.message || 'We could not save your preferences right now.');
        } finally {
            setSavingPreferences(false);
        }
    };

    const handlePasswordSave = async (formValues) => {
        if (formValues.new_password !== formValues.new_password_confirm) {
            setError('Your new passwords do not match.');
            return;
        }

        try {
            setSavingPassword(true);
            setSuccess('');
            setError('');
            await changeUserPassword(formValues);
            setSuccess('Your password has been updated successfully.');
        } catch (err) {
            setError(err.message || 'We could not update your password right now.');
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[260px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
                    <p className="mt-4 text-sm font-medium text-slate-600">Loading your account workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">We could not finish that account update.</p>
                            <p className="mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800 shadow-sm">
                    {success}
                </div>
            )}

            <UserTierCard user={user} tier={tier} />

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-6">
                    <UserAccountForm user={user} onSubmit={handleAccountSave} isSubmitting={savingAccount} />
                    <UserPreferencesForm profile={user?.profile} onSubmit={handlePreferencesSave} isSubmitting={savingPreferences} />
                </div>

                <UserPasswordForm onSubmit={handlePasswordSave} isSubmitting={savingPassword} />
            </div>
        </div>
    );
};

export default UserProfilePanel;
