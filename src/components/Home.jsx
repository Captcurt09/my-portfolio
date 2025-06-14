import { HiArrowRight } from 'react-icons/hi';
import { Link } from 'react-scroll';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';

const Home = () => {
  return (
    <div
      name="home"
      className="h-screen w-full bg-primary"
    >
      <div className="max-w-screen-lg mx-auto flex flex-col items-center justify-center h-full px-4 md:flex-row">
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center h-full"
        >
          <h2 className="text-4xl sm:text-7xl font-bold text-lightText">
            I'm a{' '}
            <TypeAnimation
              sequence={[
                'Full Stack Developer',
                2000,
                'React Developer',
                2000,
                'Node.js Developer',
                2000,
                'MongoDB Expert',
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="text-gradient bg-gradient-to-r from-cyan-500 to-blue-500"
            />
          </h2>
          <p className="text-darkText py-4 max-w-md">
            I have experience building and designing software.
            Currently, I love to work on web applications using
            technologies like React, Tailwind, Node.js, and MongoDB.
          </p>

          <div>
            <Link
              to="portfolio"
              smooth
              duration={500}
              className="group text-white w-fit px-6 py-3 my-2 flex items-center rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 cursor-pointer"
            >
              Portfolio
              <span className="group-hover:rotate-90 duration-300">
                <HiArrowRight size={25} className="ml-1" />
              </span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full overflow-hidden shadow-xl">
            {/* Add your profile image here */}
            <img
              src="/profile-placeholder.jpg"
              alt="my profile"
              className="rounded-2xl mx-auto w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home; 