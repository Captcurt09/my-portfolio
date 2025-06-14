import React from 'react';
import ProjectCard from './ProjectCard';
import { Link } from 'react-router-dom';

const Projects = () => {
  const projects = [
    {
      title: "Portfolio Website",
      description: "A modern, responsive portfolio website showcasing my journey as a developer. Built with React and Tailwind CSS, featuring smooth animations, interactive components, and a clean, professional design. The site demonstrates my ability to create engaging user experiences while maintaining performance and accessibility.",
      image: "./images/portfolio-project.svg",
      technologies: ["React", "Tailwind CSS", "Vite", "JavaScript", "Responsive Design"],
      demoLink: "/online-portfolio",
      githubLink: "https://github.com/Captcurt09/online-portfolio",
      features: [
        "Responsive design for all devices",
        "Smooth scrolling and animations",
        "Interactive project showcase",
        "Contact form with validation",
        "SEO optimized"
      ]
    },
    {
      title: "ISS Tracker & Space Dashboard",
      description: "An interactive space dashboard that provides real-time tracking of the International Space Station. Features include live orbital visualization, detailed space station information, and historical data analysis. Built with modern web technologies and integrated with NASA's APIs for accurate space data.",
      image: "./images/space-tracker.svg",
      technologies: ["React", "Plotly.js", "NASA APIs", "Real-time Data", "WebSocket"],
      demoLink: "/online-portfolio/space-tracker",
      githubLink: "https://github.com/Captcurt09/space-tracker",
      features: [
        "Real-time ISS tracking",
        "Interactive 3D visualization",
        "Historical data analysis",
        "Responsive dashboard layout",
        "Live data updates"
      ]
    },
    {
      title: "Solar System Planet Tracker",
      description: "An educational tool for visualizing and tracking planets in our solar system. Features include real-time orbital positions, detailed planetary information, and interactive 3D visualization of planetary movements. Perfect for astronomy enthusiasts and educational purposes.",
      image: "./images/planet-tracker.svg",
      technologies: ["React", "Three.js", "Orbital Mechanics", "Real-time Data", "3D Visualization"],
      demoLink: "/online-portfolio/planet-tracker",
      githubLink: "https://github.com/Captcurt09/space-tracker",
      features: [
        "Real-time planet tracking",
        "3D orbital visualization",
        "Detailed planetary information",
        "Interactive controls",
        "Educational content"
      ]
    }
  ];

  return (
    <section id="projects" className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">My Projects</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Explore my portfolio of web development projects. Each project demonstrates different aspects 
          of my skills and learning journey, from front-end development to full-stack applications.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects; 