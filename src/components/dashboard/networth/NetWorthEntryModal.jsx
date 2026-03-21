import React, { useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import NetWorthForm from './NetWorthForm';

const typeLabels = {
    asset: 'Asset',
    liability: 'Liability',
};

const NetWorthEntryModal = ({ isOpen, kind, categories, initialValues, onSubmit, onClose, isSubmitting, showCategoryIdNotice }) => {
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

    if (!isOpen || !kind) {
        return null;
    }

    const label = typeLabels[kind] || 'Entry';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]"
            onClick={() => {
                if (!isSubmitting) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-3xl overflow-hidden rounded-[1.15rem] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between bg-primary-700 px-4 py-3 text-white">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12">
                            <Plus size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-100">Net Worth</p>
                            <h2 className="text-base font-bold">
                                {initialValues ? `Update ${label.toLowerCase()}` : `Add new ${label.toLowerCase()}`}
                            </h2>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Close net worth modal"
                    >
                        <X size={17} />
                    </button>
                </div>

                <div className="px-4 py-4">
                    <NetWorthForm
                        kind={kind}
                        categories={categories}
                        initialValues={initialValues}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        isSubmitting={isSubmitting}
                        variant="modal"
                        showCategoryIdNotice={showCategoryIdNotice}
                    />
                </div>
            </div>
        </div>
    );
};

export default NetWorthEntryModal;
