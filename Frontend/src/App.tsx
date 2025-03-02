// src/App.tsx
import './App.css'
import Landing from './pages/Landing';
import ComingSoon from './components/ComingSoon/ComingSoon';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ActiveSectionContextProvider from './context/active-section-context';
import Auth from './pages/Auth';

function App() {
  return (
    <ActiveSectionContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </Router>n
    </ActiveSectionContextProvider>
  );
}

export default App