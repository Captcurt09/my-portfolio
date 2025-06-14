import React from 'react';

const Hero = () => {
  const handleDownload = () => {
    // Create a link element
    const link = document.createElement('a');
    link.href = '/online-portfolio/resume.docx';
    link.download = 'Curtis_Dennis_Resume.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen flex items-center bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Hello, I'm <span className="text-primary">Curtis Dennis</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12">
            Full Stack Developer
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primaryDark transition-colors"
            >
              Contact Me
            </a>
            <a
              href="#projects"
              className="px-8 py-3 border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              View My Work
            </a>
            <button
              onClick={handleDownload}
              className="px-8 py-3 border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              Download Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 