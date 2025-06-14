import React from 'react';

const SkillBar = ({ skill, level, color = "primary" }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700 font-medium">{skill}</span>
        <span className="text-sm text-gray-500">Learning Progress</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div 
          className={`h-full bg-${color} rounded-full transition-all duration-500`}
          style={{ width: `${level}%` }}
        ></div>
      </div>
    </div>
  );
};

const SkillCard = ({ title, skills, icon }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-4">
          {icon}
        </div>
        <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <SkillBar key={index} {...skill} />
        ))}
      </div>
    </div>
  );
};

const Skills = () => {
  const skillCategories = [
    {
      title: "Web Fundamentals",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 5h16v2H4zm0 6h16v2H4zm0 6h16v2H4z"/>
        </svg>
      ),
      skills: [
        { skill: "HTML5", level: 45 },
        { skill: "CSS3", level: 40 },
        { skill: "JavaScript Basics", level: 35 },
        { skill: "Responsive Design", level: 30 }
      ]
    },
    {
      title: "Development Tools",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H4V5h16v14z"/>
        </svg>
      ),
      skills: [
        { skill: "VS Code", level: 50 },
        { skill: "Git Basics", level: 35 },
        { skill: "Command Line", level: 30 },
        { skill: "Chrome DevTools", level: 40 }
      ]
    },
    {
      title: "Frameworks & Libraries",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 6c-.55 0-1 .45-1 1v13c0 1.1.9 2 2 2h13c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1-.45-1-1V7c0-.55-.45-1-1-1zm17-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
        </svg>
      ),
      skills: [
        { skill: "React.js Basics", level: 25 },
        { skill: "Tailwind CSS", level: 30 },
        { skill: "Bootstrap", level: 35 },
        { skill: "Node.js Basics", level: 20 }
      ]
    }
  ];

  const currentlyLearning = [
    {
      topic: "JavaScript Fundamentals",
      resources: ["FreeCodeCamp", "JavaScript.info", "Codecademy"]
    },
    {
      topic: "React Basics",
      resources: ["React Documentation", "React Tutorial"]
    },
    {
      topic: "Web Development Concepts",
      resources: ["MDN Web Docs", "W3Schools"]
    }
  ];

  const learningGoals = [
    "Build responsive websites",
    "Create interactive web applications",
    "Learn modern JavaScript",
    "Master React fundamentals",
    "Understand API integration",
    "Version control with Git"
  ];

  return (
    <section id="skills" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Learning Journey</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            I'm at the beginning of my web development journey, actively learning and building my skills.
            Here's a snapshot of what I'm working on and where I'm headed.
          </p>
        </div>

        {/* Current Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {skillCategories.map((category, index) => (
            <SkillCard key={index} {...category} />
          ))}
        </div>

        {/* Currently Learning */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Currently Learning
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentlyLearning.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">{item.topic}</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {item.resources.map((resource, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                      {resource}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Goals */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Learning Goals
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {learningGoals.map((goal, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium"
              >
                {goal}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills; 