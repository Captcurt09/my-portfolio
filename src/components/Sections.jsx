import React from 'react';
import Hero from './Hero';
import About from './About';
import Skills from './Skills';
import Projects from './Projects';
import Contact from './Contact';

const Sections = () => {
  return (
    <div className="w-full">
      <section id="home" className="w-full min-h-screen">
        <Hero />
      </section>
      
      <section id="about" className="w-full min-h-screen bg-gray-50">
        <About />
      </section>
      
      <section id="skills" className="w-full min-h-screen">
        <Skills />
      </section>
      
      <section id="projects" className="w-full min-h-screen bg-gray-50">
        <Projects />
      </section>
      
      <section id="contact" className="w-full min-h-screen">
        <Contact />
      </section>
    </div>
  );
};

export default Sections; 