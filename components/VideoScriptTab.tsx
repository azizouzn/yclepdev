
import React from 'react';
import type { Product } from '../types';
import VideoCameraIcon from './icons/VideoCameraIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import { useNotification } from '../contexts/NotificationContext';
import MegaphoneIcon from './icons/MegaphoneIcon';
import FilmIcon from './icons/FilmIcon';

interface VideoScriptTabProps {
    product: Product;
    onGenerate: (product: Product) => Promise<void>;
}

const ScriptPartCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}> = ({ icon, title, children }) => {
    return (
        <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <h5 className="flex items-center text-md font-bold text-foreground mb-2">
                {icon}
                {title}
            </h5>
            <div className="text-muted-foreground text-sm pl-8">
                {children}
            </div>
        </div>
    );
};


const VideoScriptTab: React.FC<VideoScriptTabProps> = ({ product, onGenerate }) => {
    const { showNotification } = useNotification();
    const { videoScript, scriptLoading } = product;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Script copied to clipboard!', 'success');
        });
    };

    const formatScriptForCopy = () => {
        if (!videoScript) return '';
        let fullScript = `Title: ${videoScript.title}\n\n`;
        videoScript.scenes.forEach(scene => {
            fullScript += `Scene ${scene.scene_number}:\nVisual: ${scene.visual}\nDialogue: ${scene.dialogue}\n\n`;
        });
        fullScript += `CTA: ${videoScript.call_to_action}`;
        return fullScript;
    };

    return (
        <div className="p-6 h-full">
            <div className="bg-secondary/30 p-6 rounded-lg border border-border h-full flex flex-col">
                <div className="flex-shrink-0">
                    <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center">
                        <VideoCameraIcon className="w-6 h-6 mr-3 text-primary" />
                        Short-form Video Script
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        Generate a concise script for platforms like YouTube Shorts or TikTok based on the product analysis.
                    </p>
                </div>

                {!videoScript && !scriptLoading && (
                    <div className="flex-grow flex items-center justify-center">
                        <button
                            onClick={() => onGenerate(product)}
                            className="btn btn-primary"
                        >
                            Generate Video Script
                        </button>
                    </div>
                )}
                
                {scriptLoading && (
                    <div className="flex-grow flex flex-col items-center justify-center text-primary">
                         <ArrowPathIcon className="w-12 h-12 mx-auto animate-spin mb-4" />
                         <p className="font-semibold">Agent is writing the script...</p>
                    </div>
                )}

                {videoScript && (
                    <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                        <div className="flex justify-between items-center mb-4">
                             <h4 className="text-xl font-bold text-foreground">{videoScript.title}</h4>
                             <button onClick={() => copyToClipboard(formatScriptForCopy())} className="flex items-center gap-2 text-sm btn btn-secondary">
                                 <ClipboardIcon className="w-4 h-4" /> Copy Script
                             </button>
                        </div>
                        
                        <div className="space-y-4">
                            {videoScript.scenes.map(scene => (
                               <ScriptPartCard
                                    key={scene.scene_number}
                                    icon={<FilmIcon className="w-5 h-5 mr-3 text-muted-foreground" />}
                                    title={`Scene ${scene.scene_number}`}
                                >
                                    <div className="space-y-2">
                                        <p><strong className="font-semibold text-foreground/80">Visual:</strong> {scene.visual}</p>
                                        <p><strong className="font-semibold text-foreground/80">Dialogue:</strong> <span className="italic">"{scene.dialogue}"</span></p>
                                    </div>
                                </ScriptPartCard>
                            ))}

                            <ScriptPartCard
                                icon={<MegaphoneIcon className="w-5 h-5 mr-3 text-green-400" />}
                                title="Call to Action"
                            >
                               <p className="italic">"{videoScript.call_to_action}"</p>
                            </ScriptPartCard>
                        </div>


                         <button
                            onClick={() => onGenerate(product)}
                            className="w-full mt-6 btn btn-secondary"
                        >
                            Regenerate Script
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoScriptTab;