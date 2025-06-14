import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Link } from 'react-scroll';

const Navbar = () => {
  const [nav, setNav] = useState(false);
  
  const links = [
    {
      id: 1,
      link: 'home'
    },
    {
      id: 2,
      link: 'about'
    },
    {
      id: 3,
      link: 'skills'
    },
    {
      id: 4,
      link: 'projects'
    },
    {
      id: 5,
      link: 'contact'
    }
  ];

  return (
    <div className="fixed w-full h-20 z-50">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="flex justify-between items-center w-full h-full px-4 2xl:px-16">
          <div>
            <h1 className="text-3xl font-bold text-primary">Curtis Dennis</h1>
          </div>

          <ul className="hidden md:flex items-center space-x-4">
            {links.map(({ id, link }) => (
              <li key={id}>
                <Link
                  to={link}
                  smooth
                  duration={500}
                  className="px-4 py-2 border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>

          <div
            onClick={() => setNav(!nav)}
            className="md:hidden cursor-pointer z-10"
          >
            {nav ? (
              <FaTimes className="text-primary" size={25} />
            ) : (
              <FaBars className="text-primary" size={25} />
            )}
          </div>

          {nav && (
            <ul className="absolute top-0 left-0 w-full h-screen bg-white/10 backdrop-blur-md flex flex-col justify-center items-center">
              {links.map(({ id, link }) => (
                <li
                  key={id}
                  className="py-6"
                >
                  <Link
                    onClick={() => setNav(!nav)}
                    to={link}
                    smooth
                    duration={500}
                    className="px-6 py-3 border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-colors duration-300"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar; 