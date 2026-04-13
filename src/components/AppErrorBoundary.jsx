import React from 'react';

const CHUNK_RELOAD_KEY = 'sm_chunk_reload_once';

class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, message: '' };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            message: error?.message || 'Unexpected application error',
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error('AppErrorBoundary caught an error:', error, errorInfo);

        const message = String(error?.message || '');
        const isChunkLoadFailure =
            message.includes('Failed to fetch dynamically imported module') ||
            message.includes('Importing a module script failed') ||
            message.includes('Loading chunk');

        if (isChunkLoadFailure) {
            try {
                const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1';
                if (!alreadyReloaded) {
                    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
                    window.location.reload();
                    return;
                }
            } catch (storageError) {
                console.warn('Chunk reload recovery state unavailable:', storageError);
            }
        }
    }

    handleReload = () => {
        try {
            sessionStorage.removeItem(CHUNK_RELOAD_KEY);
        } catch (error) {
            console.warn('Could not clear chunk reload state:', error);
        }
        window.location.reload();
    };

    componentDidMount() {
        try {
            sessionStorage.removeItem(CHUNK_RELOAD_KEY);
        } catch (error) {
            console.warn('Could not reset chunk reload state:', error);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-white px-4 py-12">
                    <div className="mx-auto max-w-xl rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
                        <h1 className="text-2xl font-extrabold text-rose-900">We hit a loading issue</h1>
                        <p className="mt-2 text-sm text-rose-800">
                            Something broke while opening your dashboard. Please refresh and try again.
                        </p>
                        <p className="mt-2 text-xs text-rose-700">
                            Error: {this.state.message}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={this.handleReload}
                                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                            >
                                Reload page
                            </button>
                            <a
                                href="/signin"
                                className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-900 hover:bg-rose-100"
                            >
                                Back to sign in
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AppErrorBoundary;
