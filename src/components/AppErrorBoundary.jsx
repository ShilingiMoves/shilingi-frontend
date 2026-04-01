import React from 'react';

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
    }

    handleReload = () => {
        window.location.reload();
    };

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
