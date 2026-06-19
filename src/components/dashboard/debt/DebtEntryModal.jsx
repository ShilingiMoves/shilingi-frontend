import React, { useEffect } from 'react';
import { X } from 'lucide-react';
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
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 px-2 pb-7 pt-16 backdrop-blur-[1px] md:items-center md:px-4 md:py-6"
            onClick={() => {
                if (!isSubmitting) {
                    onClose();
                }
            }}
        >
            <div className="relative flex max-h-[76vh] w-full max-w-[343px] flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.24)] md:max-h-[90vh] md:max-w-[30rem]" onClick={(event) => event.stopPropagation()}>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#e3e7ed] bg-[#f7f8fa] text-[#9aa3af] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Close debt modal"
                    >
                        <X size={13} />
                    </button>
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
