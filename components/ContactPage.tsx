

import React from 'react';
import EnvelopeIcon from './icons/EnvelopeIcon';

const ContactPage: React.FC = () => {
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Thank you for your message! This is a demo form.");
    };

    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 md:px-8 py-16">
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <EnvelopeIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                        Contact Us
                    </h1>
                    <p className="mt-6 text-lg text-gray-600">
                        Have questions, feedback, or partnership inquiries? We'd love to hear from you.
                    </p>
                </div>

                <div className="max-w-xl mx-auto bg-white p-8 rounded-lg border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" id="name" required className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" id="email" required className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                            <textarea id="message" rows={5} required className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"></textarea>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-emerald-500 transition-colors"
                            >
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;