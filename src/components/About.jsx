import React from 'react';

const About = () => {
  return (
    <div id="about" className="w-full min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">About Me</h2>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">My Journey</h3>
            <p className="text-lg text-gray-700 mb-6">
              I'm Curtis Dennis, a passionate Full Stack Developer with a keen interest in creating 
              innovative web solutions. My journey in web development began with a curiosity about 
              how modern web applications work, which led me to dive deep into both front-end and 
              back-end technologies.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              I specialize in building responsive, user-friendly applications using modern technologies 
              like React, Node.js, and various cloud services. My approach combines technical expertise 
              with a strong focus on user experience and clean, maintainable code.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">What I Do</h3>
            <ul className="list-disc list-inside text-lg text-gray-700 space-y-3">
              <li>Develop responsive and interactive web applications</li>
              <li>Create efficient and scalable backend solutions</li>
              <li>Implement modern UI/UX designs</li>
              <li>Integrate third-party APIs and services</li>
              <li>Optimize application performance and security</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Beyond Coding</h3>
            <p className="text-lg text-gray-700">
              When I'm not coding, I'm constantly learning and exploring new technologies. 
              I enjoy contributing to open-source projects and sharing knowledge with the 
              developer community. My goal is to create meaningful applications that make 
              a positive impact while continuously growing as a developer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 