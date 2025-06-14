import React, { useState } from 'react';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ProjectCard = ({ title, description, image, technologies, demoLink, githubLink, features }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error(`Failed to load image: ${image}`);
    setImageError(true);
  };

  const isInternalLink = demoLink && demoLink.startsWith('/');

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 bg-gray-100">
        <img
          src={imageError ? './images/placeholder.svg' : image}
          alt={title}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Technologies Used:</h4>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Features:</h4>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        <div className="flex gap-4 mt-6">
          {demoLink ? (
            isInternalLink ? (
              <Link
                to={demoLink}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaExternalLinkAlt />
                Live Demo
              </Link>
            ) : (
              <a
                href={demoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaExternalLinkAlt />
                Live Demo
              </a>
            )
          ) : (
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
            >
              <FaExternalLinkAlt />
              Coming Soon
            </button>
          )}
          <a
            href={githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            <FaGithub />
            View Code
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 