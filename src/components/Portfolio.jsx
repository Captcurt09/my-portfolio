import { motion } from 'framer-motion';

const Portfolio = () => {
  const portfolios = [
    {
      id: 1,
      title: "E-commerce Website",
      description: "A full-stack e-commerce platform built with React and Node.js",
      src: "/portfolio1.jpg",
      demo: "https://demo-link-1.com",
      code: "https://github.com/yourusername/project1"
    },
    {
      id: 2,
      title: "Task Management App",
      description: "A React-based task management application with drag-and-drop functionality",
      src: "/portfolio2.jpg",
      demo: "https://demo-link-2.com",
      code: "https://github.com/yourusername/project2"
    },
    {
      id: 3,
      title: "Social Media Dashboard",
      description: "A responsive dashboard for social media analytics",
      src: "/portfolio3.jpg",
      demo: "https://demo-link-3.com",
      code: "https://github.com/yourusername/project3"
    },
  ];

  return (
    <div
      name="portfolio"
      className="bg-primary w-full min-h-screen text-lightText"
    >
      <div className="max-w-screen-lg p-4 mx-auto flex flex-col justify-center w-full h-full">
        <div className="pb-8">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold inline border-b-4 border-secondary"
          >
            Portfolio
          </motion.p>
          <p className="py-6">Check out some of my work</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 px-12 sm:px-0">
          {portfolios.map(({ id, title, description, src, demo, code }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: id * 0.2 }}
              className="shadow-md shadow-gray-600 rounded-lg overflow-hidden"
            >
              <img
                src={src}
                alt={title}
                className="rounded-md duration-200 hover:scale-105 w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2 text-secondary">{title}</h3>
                <p className="text-sm mb-4">{description}</p>
                <div className="flex items-center justify-center">
                  <a
                    href={demo}
                    target="_blank"
                    rel="noreferrer"
                    className="w-1/2 px-6 py-2 m-2 duration-200 hover:scale-105 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md text-center"
                  >
                    Demo
                  </a>
                  <a
                    href={code}
                    target="_blank"
                    rel="noreferrer"
                    className="w-1/2 px-6 py-2 m-2 duration-200 hover:scale-105 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md text-center"
                  >
                    Code
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio; 