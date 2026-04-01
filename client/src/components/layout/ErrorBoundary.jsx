import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, Button } from '../ui';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                    <Card className="max-w-xl w-full p-8 border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">
                                <AlertCircle size={48} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E5E5E5]">Something went wrong</h2>
                            <p className="text-gray-500 dark:text-[#9CA3AF] font-medium">
                                We encountered an unexpected error while loading this component.
                            </p>
                            
                            {/* Detailed error for dev mode / debugging */}
                            <div className="w-full mt-4 text-left p-4 bg-white dark:bg-[#121212] rounded-xl border border-red-100 dark:border-red-900/20 overflow-auto max-h-48">
                                <p className="text-sm text-red-600 dark:text-red-400 font-mono">
                                    {this.state.error && this.state.error.toString()}
                                </p>
                            </div>

                            <Button 
                                onClick={() => window.location.reload()} 
                                className="mt-6 flex items-center space-x-2 bg-red-600 hover:bg-red-700"
                            >
                                <RefreshCw size={18} />
                                <span>Reload Application</span>
                            </Button>
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children; 
    }
}

export default ErrorBoundary;
