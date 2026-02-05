
import React from 'react';
import YclepLogo from './icons/YclepLogo';

const PublicFooter: React.FC = () => {
    return (
        <footer className="bg-white border-t border-border pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                         <div className="w-24 h-auto mb-4 opacity-80 grayscale">
                            <YclepLogo className="w-full h-full" />
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                            The new standard for product research. AI-driven, unbiased, and comprehensive analysis for the modern consumer.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Platform</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><a href="/site" className="hover:text-primary transition-colors">Reviews</a></li>
                            <li><a href="/site/guides" className="hover:text-primary transition-colors">Buying Guides</a></li>
                            <li><a href="/site/blog" className="hover:text-primary transition-colors">Journal</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Company</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><a href="/site/about" className="hover:text-primary transition-colors">About Us</a></li>
                            <li><a href="/site/contact" className="hover:text-primary transition-colors">Contact</a></li>
                            <li><a href="/site/privacy" className="hover:text-primary transition-colors">Privacy & Terms</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Yclep Inc. All rights reserved.</p>
                    <div className="flex gap-4">
                        {/* Social placeholders */}
                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;