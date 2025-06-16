import React, { Suspense, lazy } from 'react'
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load components
const Sections = lazy(() => import('./components/Sections'))
const PlanetTracker = lazy(() => import('./components/PlanetTracker'))
const ISSTracker = lazy(() => import('./components/ISSTracker'))

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="relative">
      <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      <div className="w-16 h-16 border-t-4 border-b-4 border-blue-300 rounded-full animate-spin absolute top-0 left-0" style={{animationDelay: '-0.3s'}}></div>
    </div>
  </div>
);

// Wrapper component to conditionally render Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  const isProjectPage = location.pathname.includes('/planet-tracker') || 
                       location.pathname.includes('/iss-tracker');

  return (
    <div className="min-h-screen flex flex-col">
      {!isProjectPage && <Navbar />}
      <main className={`flex-grow ${!isProjectPage ? 'pt-20' : ''}`}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isProjectPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Sections />} />
          <Route path="/online-portfolio" element={<Sections />} />
          <Route path="/online-portfolio/planet-tracker" element={<PlanetTracker />} />
          <Route path="/online-portfolio/iss-tracker" element={<ISSTracker />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
