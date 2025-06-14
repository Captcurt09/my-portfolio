import { motion } from 'framer-motion';
import { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <div
      name="contact"
      className="w-full min-h-screen bg-primary p-4 text-lightText"
    >
      <div className="flex flex-col p-4 justify-center max-w-screen-lg mx-auto h-full">
        <div className="pb-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold inline border-b-4 border-secondary"
          >
            Contact
          </motion.p>
          <p className="py-6">Submit the form below to get in touch with me</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center items-center"
        >
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full md:w-1/2"
          >
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="p-2 bg-transparent border-2 rounded-md text-lightText focus:outline-none focus:border-secondary"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="my-4 p-2 bg-transparent border-2 rounded-md text-lightText focus:outline-none focus:border-secondary"
              required
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter your message"
              rows="10"
              className="p-2 bg-transparent border-2 rounded-md text-lightText focus:outline-none focus:border-secondary"
              required
            ></textarea>

            <button
              type="submit"
              className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 my-8 mx-auto flex items-center rounded-md hover:scale-105 duration-300"
            >
              Let's talk
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact; 