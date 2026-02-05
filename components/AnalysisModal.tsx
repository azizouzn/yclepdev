import React, { useEffect, useState, useRef } from 'react';
import type { Task, AgentName, ExecutionStep } from '../types';
import { ANALYSIS_STAGES } from '../constants';
import CheckCircleIcon from './icons/CheckCircleIcon';
import ClockIcon from './icons/ClockIcon';
import XCircleIcon from './icons/XCircleIcon';
import ServerIcon from './icons/ServerIcon';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  productName: string;
}

const StageStatusIcon: React.FC<{ status: 'completed' | 'running' | 'failed' | 'pending' }> = ({ status }) => {
    switch (status) {
        case 'completed': return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
        case 'running': return <ServerIcon className="w-6 h-6 text-primary animate-pulse" />;
        case 'failed': return <XCircleIcon className="w-6 h-6 text-destructive" />;
        case 'pending': return <ClockIcon className="w-6 h-6 text-muted-foreground" />;
        default: return null;
    }
};

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, task, productName }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      
      // Focus trap logic
      if (e.key === 'Tab') {
        const modalElement = modalRef.current;
        if (!modalElement) return;

        const focusableElements = modalElement.querySelectorAll<HTMLElement>('a[href], button, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);

    // Set initial focus
    const timer = setTimeout(() => {
        modalRef.current?.focus();
    }, 100);

    return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const stagesToRender = task.plan 
    ? task.plan.flatMap(step => step.agents.map(a => ({ ...a, stepTitle: step.title })))
    : ANALYSIS_STAGES.map(s => ({ ...s, stepTitle: 'Analysis Pipeline' }));

  const currentStepInfo = task.plan?.find(step => step.agents.some(a => a.agent === task.currentStage));
  const currentStageIndex = stagesToRender.findIndex(s => s.agent === task.currentStage);

  const getStageStatus = (stageAgent: AgentName, index: number) => {
      if (currentStageIndex === -1 && task.currentStage === 'Initializing') return 'pending';

      if (task.status === 'failed' && stageAgent === task.currentStage) return 'failed';
      if (task.status === 'running' && stageAgent === task.currentStage) return 'running';
      if (currentStageIndex > index || task.status === 'succeeded') return 'completed';
      
      return 'pending';
  };
  
  const currentStageTitle = currentStepInfo?.title || 
                            stagesToRender.find(s => s.agent === task.currentStage)?.title ||
                            task.currentStage;


  return (
    <div 
        className="dialog-overlay"
        onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="dialog-content max-w-md"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="analysis-modal-title"
        tabIndex={-1}
      >
        <div className="text-center p-6 border-b border-border">
            <h2 id="analysis-modal-title" className="text-2xl font-bold text-foreground mb-1">AI Mastermind: Online</h2>
            <p className="text-sm text-muted-foreground">Analyzing: <span className="font-semibold text-primary">{productName}</span></p>
        </div>
        
        <div className="px-6 py-4 space-y-3 overflow-y-auto">
          {stagesToRender.map(({ agent, title }, index) => {
            const status = getStageStatus(agent, index);
            const isRunning = status === 'running';
            const isCompleted = status === 'completed';

            return (
                <div key={`${agent}-${index}`} className={`flex items-center space-x-4 p-3 rounded-lg transition-all duration-300 ${isRunning ? 'bg-secondary' : ''}`}>
                    <div className={`flex-shrink-0 transition-all duration-300 ${isRunning ? 'scale-110' : ''}`}>
                        <StageStatusIcon status={status} />
                    </div>
                    <div className="flex-grow">
                        <p className={`font-medium transition-colors duration-300 ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{title}</p>
                    </div>
                </div>
            );
          })}
        </div>
        
        <div className="p-6 border-t border-border h-24 flex flex-col items-center justify-center text-center bg-secondary/50 rounded-b-lg">
            {task.status === 'succeeded' && (
                 <p className="text-green-500 font-semibold flex items-center"><CheckCircleIcon className="w-5 h-5 mr-2" /> Analysis complete. Finalizing...</p>
            )}
            {task.status === 'failed' && task.error && (
                <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
                    <p className="font-bold">Error in stage: {currentStageTitle}</p>
                    <p>{task.error.message}</p>
                    {task.error.actionTaken && <p className="text-xs mt-1">Action: {task.error.actionTaken}</p>}
                </div>
            )}
            {task.status === 'running' && (
                <p className="text-primary animate-pulse text-sm">Executing: {currentStageTitle}</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;