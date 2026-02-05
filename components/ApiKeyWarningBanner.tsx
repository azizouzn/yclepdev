import React from 'react';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import KeyIcon from './icons/KeyIcon';

const ApiKeyWarningBanner: React.FC = () => {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <span className="font-bold">AI Features Disabled:</span> No AI provider API key is configured.
            {' '}
            <a href="#/admin/settings" className="font-medium underline text-yellow-800 hover:text-yellow-900">
              Go to Settings to add a key <KeyIcon className="w-4 h-4 inline-block ml-1"/>
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyWarningBanner;