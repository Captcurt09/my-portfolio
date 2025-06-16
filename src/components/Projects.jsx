import React from 'react';
import ProjectCard from './ProjectCard';

const Projects = () => {
  const projects = [
    {
      title: "Portfolio Website",
      description: "My personal portfolio website built with React and Tailwind CSS. This project showcases my learning journey and the skills I'm developing in web development.",
      image: "./images/portfolio-project.svg",
      technologies: ["React", "Tailwind CSS", "Vite", "JavaScript"],
      demoLink: "https://captcurt09.github.io/online-portfolio/",
      githubLink: "https://github.com/Captcurt09/online-portfolio",
      features: [
        "Responsive design for all devices",
        "Interactive UI components",
        "Smooth animations and transitions",
        "Project showcase with detailed information"
      ]
    },
    {
      title: "ISS Tracker",
      description: "A real-time tracker for the International Space Station (ISS) that shows its current position on Earth. Features include live updates, interactive map, and detailed position information.",
      image: "./images/iss-tracker.svg",
      technologies: ["React", "Leaflet", "Open Notify API", "Tailwind CSS"],
      demoLink: "/online-portfolio/iss-tracker",
      githubLink: "https://github.com/Captcurt09/online-portfolio",
      features: [
        "Real-time ISS position tracking",
        "Interactive world map visualization",
        "Live position updates every 5 seconds",
        "Detailed latitude and longitude information"
      ]
    },
    {
      title: "Project 3",
      description: "Description of your third project. What problems did it solve? What did you learn?",
      image: "/images/placeholder.svg",
      technologies: ["Technology 1", "Technology 2", "Technology 3"],
      demoLink: "https://project3-demo.com",
      githubLink: "https://github.com/yourusername/project3",
      features: [
        "Feature 1 description",
        "Feature 2 description",
        "Feature 3 description"
      ]
    }
    // Add more projects as needed
  ];

  return (
    <section id="projects" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">My Projects</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Here are the projects I've been working on as I learn web development.
          Each project represents different skills and concepts I'm learning.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects; 