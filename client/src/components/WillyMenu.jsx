import React, { useState } from 'react';
import WillyGame from './WillyGame';
import WillyEditor from './WillyEditor';

const WillyMenu = () => {
  const [currentMode, setCurrentMode] = useState('menu');
  const [currentLevel, setCurrentLevel] = useState(null);

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
  };

  const handleLevelLoad = (levelData) => {
    setCurrentLevel(levelData);
    setCurrentMode('game');
  };

  const startGame = () => {
    setCurrentMode('game');
  };

  const MainMenu = () => (
    <div className="menu-screen">
      <div className="title-section">
        <h1 className="game-title">Willy the Worm</h1>
        <div className="subtitle">A Classic Arcade Adventure</div>
      </div>
      <div className="menu-description">
        <p>Meet Willy the Worm! Willy is a fun-loving invertebrate who likes to climb ladders & bounce & spring & leap & jump and find hidden presents! But more than anything, Willy loves to ring bells!</p>
        <p>You can press the arrow keys ↑ ↓ → ← to make Willy run and climb, or the spacebar to make him jump. Anything else will make Willy stop and wait.</p>
        <p>Good luck, and don't let Willy step on a tack!</p>
      </div>
      <div className="menu-actions">
        <button className="menu-button" onClick={startGame}>Start New Game</button>
        <button className="menu-button" onClick={() => setCurrentMode('editor')}>Level Editor</button>
      </div>
    </div>
  );

  return (
    <div className="willy-container">
      <header className="game-header">
        <div className="header-title">
          <h2>Willy the Worm</h2>
          <div className="header-subtitle">Recreation of the 1985 Classic</div>
        </div>
        <nav className="header-nav">
          <button 
            className={`nav-button ${currentMode === 'menu' ? 'active' : ''}`}
            onClick={() => handleModeChange('menu')}
          >
            Menu
          </button>
          <button 
            className={`nav-button ${currentMode === 'game' ? 'active' : ''}`}
            onClick={() => handleModeChange('game')}
          >
            Play Game
          </button>
          <button 
            className={`nav-button ${currentMode === 'editor' ? 'active' : ''}`}
            onClick={() => handleModeChange('editor')}
          >
            Level Editor
          </button>
        </nav>
      </header>

      <main className="game-main">
        {currentMode === 'menu' && <MainMenu />}
        {currentMode === 'game' && (
          <WillyGame 
            onReturnToMenu={() => setCurrentMode('menu')}
            customLevel={currentLevel}
          />
        )}
        {currentMode === 'editor' && (
          <WillyEditor 
            onReturnToMenu={() => setCurrentMode('menu')}
            onTestLevel={handleLevelLoad}
          />
        )}
      </main>
    </div>
  );
};

export default WillyMenu;