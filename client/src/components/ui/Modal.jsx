import React from 'react';
import { X } from 'lucide-react';
import { Card } from './index';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div className="w-full max-w-lg animate-in fade-in zoom-in duration-200">
                <Card className="relative shadow-2xl border-none">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                            <X size={20} className="text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                    {children}
                </Card>
            </div>
        </div>
    );
};

export default Modal;
