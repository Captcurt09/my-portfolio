import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <div className="flex space-x-6 mb-4">
            <a
              href="https://github.com/Captcurt09"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaGithub size={24} />
            </a>
            <a
              href="https://www.linkedin.com/in/curtis-dennis-"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaLinkedin size={24} />
            </a>
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Curtis Dennis. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 