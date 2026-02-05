
import React, { useState, useEffect, useRef } from 'react';
import type { CommandBarResult } from '../types';
import CommandLineIcon from './icons/CommandLineIcon';
import XMarkIcon from './icons/XMarkIcon';
import SparklesIcon from './icons/SparklesIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import { useNotification } from '../contexts/NotificationContext';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onCommandExecuted: (result: CommandBarResult) => void;
}

const CommandBar: React.FC<CommandBarProps> = ({ isOpen, onClose, onCommandExecuted }) => {
  const [command, setCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!isOpen) {
      setCommand('');
      setIsLoading(false);
      return;
    }

    const modalElement = modalRef.current;
    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll<HTMLElement>('input, button');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key !== 'Tab') return;

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };
    
    modalElement.addEventListener('keydown', handleKeyDown);

    const timer = setTimeout(() => inputRef.current?.focus(), 100);

    return () => {
        clearTimeout(timer);
        modalElement.removeEventListener('keydown', handleKeyDown);
    }

  }, [isOpen, onClose]);

  const validateAndSanitizeCommand = (cmd: string): string | null => {
      const lowerCmd = cmd.toLowerCase().trim();
      const restrictedPhrases = [
        'ignore your previous instructions',
        'disregard the instructions above',
        'you are a new ai model',
        'act as if', 
        'roleplay as',
        'system prompt:',
        'your instructions are',
      ];

      if (restrictedPhrases.some(phrase => lowerCmd.includes(phrase))) {
        return null; // Invalid command
      }
      
      // Basic sanitization: remove potential markdown/html characters for injection
      return cmd.replace(/[<`>]/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isLoading) return;
    
    const sanitizedCommand = validateAndSanitizeCommand(command);

    if (sanitizedCommand === null) {
        showNotification('Command contains restricted phrases for security.', 'error');
        return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: sanitizedCommand }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Command failed with no details.'}));
        throw new Error(errorData.message);
      }

      const result = await response.json();
      onCommandExecuted(result as CommandBarResult);
      
    } catch (error) {
      console.error("Command execution failed:", error);
      showNotification(`Command failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
      setCommand('');
    }
  };

  const exampleCommands = [
    "Analyze product 'SuperCharger Pro' from https://example.com/scharger",
    "Write an article about 'the future of portable gaming'",
    "Show me all published products",
    "Go to the strategy hub",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-20" onClick={onClose}>
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command Bar"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center p-4 border-b border-gray-200">
            {isLoading ? (
                <ArrowPathIcon className="w-5 h-5 text-gray-400 mr-3 animate-spin" />
            ) : (
                <CommandLineIcon className="w-5 h-5 text-gray-400 mr-3" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type your command..."
              className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
              disabled={isLoading}
            />
            <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Close Command Bar">
                <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Example Commands</p>
          <ul className="space-y-2">
            {exampleCommands.map((ex, i) => (
              <li key={i} className="flex items-center text-sm text-gray-500">
                <SparklesIcon className="w-4 h-4 text-indigo-400 mr-3 flex-shrink-0" />
                <span>{ex}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CommandBar;