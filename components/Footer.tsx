import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800 animate-fade-in">
            <div className="container mx-auto px-4 text-center">
                <p className="mb-2">&copy; {new Date().getFullYear()} New Lucky Pharma. All rights reserved.</p>
                <p className="text-sm">Serving the Hanwara community with pride.</p>
            </div>
        </footer>
    );
};

export default Footer;