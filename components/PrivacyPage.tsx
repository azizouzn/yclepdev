

import React from 'react';

const PrivacyPage: React.FC = () => {
    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 md:px-8 py-16 max-w-4xl">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                        Privacy Policy
                    </h1>
                    <p className="mt-4 text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
                </header>

                <div className="prose lg:prose-lg max-w-none text-gray-600 space-y-6">
                    <p>Welcome to Yclep. This Privacy Policy is meant to help you understand what information we collect, why we collect it, and how you can update, manage, export, and delete your information. This is a placeholder document and does not reflect the actual data practices of this demonstration application.</p>
                    
                    <section>
                        <h2>Information We Collect</h2>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                    </section>
                    
                    <section>
                        <h2>How We Use Information</h2>
                        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.</p>
                    </section>

                    <section>
                        <h2>Sharing Your Information</h2>
                        <p>Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi.</p>
                    </section>
                    
                     <section>
                        <h2>Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us through the information provided on our contact page.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;