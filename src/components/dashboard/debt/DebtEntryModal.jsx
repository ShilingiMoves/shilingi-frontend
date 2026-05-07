import React, { useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import DebtForm from './DebtForm';

const DebtEntryModal = ({ isOpen, initialValues, onSubmit, onClose, isSubmitting }) => {
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !isSubmitting) {
                onClose();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]"
            onClick={() => {
                if (!isSubmitting) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[90vh] w-full max-w-[30rem] flex-col overflow-hidden rounded-[1.15rem] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <div className="flex shrink-0 items-center justify-between bg-[linear-gradient(135deg,_#18765e_0%,_#1b8a64_48%,_#38a96b_100%)] px-4 py-3 text-white">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12">
                            <Plus size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-100">Debt Management</p>
                            <h2 className="text-base font-bold">
                                {initialValues ? 'Update debt' : 'Add new debt'}
                            </h2>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Close debt modal"
                    >
                        <X size={17} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                    <DebtForm
                        initialValues={initialValues}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        isSubmitting={isSubmitting}
                        variant="modal"
                    />
                </div>
            </div>
        </div>
    );
};

export default DebtEntryModal;
