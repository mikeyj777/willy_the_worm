import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import './App.css';
import './styles/global.css';
import WillyTheWorm from './components/WillyMenu.jsx';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/willy" element={<WillyTheWorm />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;