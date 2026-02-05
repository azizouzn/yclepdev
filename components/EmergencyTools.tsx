
import React, { useState } from 'react';
import WrenchScrewdriverIcon from './icons/WrenchScrewdriverIcon';
import ServerStackIcon from './icons/ServerStackIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import TrashIcon from './icons/TrashIcon';

const EmergencyTools: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const runAction = async (actionName: string, apiCall: () => Promise<any>) => {
        setIsLoading(true);
        setStatus(`${actionName}...`);
        try {
            const res = await apiCall();
            const data = await res.json();
            setStatus(res.ok ? `✅ Success: ${data.message || 'Done'}` : `❌ Error: ${data.message}`);
        } catch (e) {
            setStatus(`❌ Network Error`);
        } finally {
            setIsLoading(false);
            setTimeout(() => setStatus(null), 3000);
        }
    };

    const handleUnlinkGit = () => runAction('Unlinking Git', () => 
        fetch('/api/system/git', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'unlink' }) 
        })
    );

    const handleResetDb = () => runAction('Initializing DB', () => 
        fetch('/api/system/setup', { method: 'POST' })
    );

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 left-4 z-[9999] bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-all border-2 border-white"
                title="Emergency Tools"
            >
                <WrenchScrewdriverIcon className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="bg-red-600 p-4 flex justify-between items-center">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <WrenchScrewdriverIcon className="w-5 h-5" />
                        Emergency Toolkit
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">✕</button>
                </div>
                
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-500 mb-4">Use these tools if the dashboard is stuck or broken.</p>
                    
                    <button 
                        onClick={handleUnlinkGit}
                        disabled={isLoading}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                    >
                        <span className="flex items-center gap-2 font-medium text-gray-700">
                            <TrashIcon className="w-5 h-5 text-orange-500" />
                            Unlink Broken Git Repo
                        </span>
                        {isLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <span>→</span>}
                    </button>

                    <button 
                        onClick={handleResetDb}
                        disabled={isLoading}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                    >
                        <span className="flex items-center gap-2 font-medium text-gray-700">
                            <ServerStackIcon className="w-5 h-5 text-blue-500" />
                            Force Init Database
                        </span>
                        {isLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <span>→</span>}
                    </button>

                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full flex items-center justify-center p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold mt-4"
                    >
                        Reload App
                    </button>

                    {status && (
                        <div className={`mt-4 p-3 rounded text-sm text-center font-bold ${status.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmergencyTools;
