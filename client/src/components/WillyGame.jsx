import React, { useState, useEffect, useCallback } from 'react';

const WillyGame = ({ onReturnToMenu, customLevel }) => {
  const GRID_WIDTH = 40;
  const GRID_HEIGHT = 25;

  // Game state
  const [gameState, setGameState] = useState({
    willyPos: { x: 2, y: 22 },
    score: 0,
    bonus: 1000,
    lives: 3,
    level: 1,
    gameRunning: false,
    gameOver: false,
    levelComplete: false
  });

  // Level data
  const [currentLevel, setCurrentLevel] = useState(
    Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(' '))
  );

  // Initialize default level or use custom level
  useEffect(() => {
    if (customLevel) {
      setCurrentLevel(customLevel.map(row => [...row]));
      // Find Willy's starting position in custom level
      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          if (customLevel[y][x] === '@') {
            setGameState(prev => ({
              ...prev,
              willyPos: { x, y }
            }));
            // Remove Willy from the level grid (he's tracked separately)
            const levelCopy = customLevel.map(row => [...row]);
            levelCopy[y][x] = ' ';
            setCurrentLevel(levelCopy);
            return;
          }
        }
      }
    } else {
      // Default level
      const defaultLevel = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(' '));
      
      // Add platforms
      for (let x = 0; x < GRID_WIDTH; x++) {
        defaultLevel[23][x] = '═'; // Bottom platform
        if (x < 15 || x > 25) defaultLevel[18][x] = '═'; // Mid platforms
        if (x > 5 && x < 35) defaultLevel[13][x] = '═';
        if (x < 10 || x > 30) defaultLevel[8][x] = '═';
        if (x > 15 && x < 25) defaultLevel[3][x] = '═';
      }
      
      // Add ladders
      for (let y = 19; y < 23; y++) defaultLevel[y][10] = '║';
      for (let y = 14; y < 18; y++) defaultLevel[y][30] = '║';
      for (let y = 9; y < 13; y++) defaultLevel[y][8] = '║';
      for (let y = 4; y < 8; y++) defaultLevel[y][20] = '║';
      
      // Add presents
      defaultLevel[17][5] = '☼';
      defaultLevel[12][25] = '☼';
      defaultLevel[7][15] = '☼';
      
      // Add bell at top
      defaultLevel[2][20] = '♪';
      
      setCurrentLevel(defaultLevel);
    }
  }, [customLevel]);

  // Game logic
  const moveWilly = useCallback((direction) => {
    if (!gameState.gameRunning || gameState.gameOver) return;

    setGameState(prev => {
      const newPos = { ...prev.willyPos };
      const canMove = (x, y) => {
        if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return false;
        const cell = currentLevel[y][x];
        return cell === ' ' || cell === '☼' || cell === '♪' || cell === '║';
      };

      const hasSupport = (x, y) => {
        if (y >= GRID_HEIGHT - 1) return true; // Bottom of screen
        const cellBelow = currentLevel[y + 1][x];
        return cellBelow === '═' || cellBelow === '║';
      };

      switch (direction) {
        case 'left':
          if (canMove(newPos.x - 1, newPos.y)) {
            newPos.x--;
            // Apply gravity if no support
            if (!hasSupport(newPos.x, newPos.y) && currentLevel[newPos.y][newPos.x] !== '║') {
              while (newPos.y < GRID_HEIGHT - 1 && canMove(newPos.x, newPos.y + 1) && !hasSupport(newPos.x, newPos.y)) {
                newPos.y++;
              }
            }
          }
          break;
        case 'right':
          if (canMove(newPos.x + 1, newPos.y)) {
            newPos.x++;
            // Apply gravity if no support
            if (!hasSupport(newPos.x, newPos.y) && currentLevel[newPos.y][newPos.x] !== '║') {
              while (newPos.y < GRID_HEIGHT - 1 && canMove(newPos.x, newPos.y + 1) && !hasSupport(newPos.x, newPos.y)) {
                newPos.y++;
              }
            }
          }
          break;
        case 'up':
          if (currentLevel[newPos.y][newPos.x] === '║' && canMove(newPos.x, newPos.y - 1)) {
            newPos.y--;
          }
          break;
        case 'down':
          if (currentLevel[newPos.y][newPos.x] === '║' && canMove(newPos.x, newPos.y + 1)) {
            newPos.y++;
          }
          break;
        case 'jump':
          if (canMove(newPos.x, newPos.y - 1)) {
            newPos.y--;
          }
          break;
      }

      // Check for present collection
      let newScore = prev.score;
      if (currentLevel[newPos.y][newPos.x] === '☼') {
        newScore += 100;
        currentLevel[newPos.y][newPos.x] = ' ';
      }

      // Check for bell (level complete)
      let levelComplete = false;
      if (currentLevel[newPos.y][newPos.x] === '♪') {
        levelComplete = true;
        newScore += prev.bonus;
      }

      return {
        ...prev,
        willyPos: newPos,
        score: newScore,
        levelComplete
      };
    });
  }, [gameState.gameRunning, gameState.gameOver, currentLevel]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveWilly('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveWilly('right');
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveWilly('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveWilly('down');
          break;
        case ' ':
          e.preventDefault();
          moveWilly('jump');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveWilly]);

  // Bonus countdown
  useEffect(() => {
    if (!gameState.gameRunning || gameState.gameOver || gameState.levelComplete) return;
    
    const timer = setInterval(() => {
      setGameState(prev => {
        const newBonus = Math.max(0, prev.bonus - 10);
        if (newBonus === 0) {
          return { ...prev, bonus: newBonus, lives: prev.lives - 1, gameOver: prev.lives <= 1 };
        }
        return { ...prev, bonus: newBonus };
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameState.gameRunning, gameState.gameOver, gameState.levelComplete]);

  // Game functions
  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      bonus: 1000,
      lives: 3,
      gameRunning: true,
      gameOver: false,
      levelComplete: false
    }));
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      willyPos: customLevel ? 
        (() => {
          // Find Willy start position in custom level
          for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
              if (customLevel[y][x] === '@') return { x, y };
            }
          }
          return { x: 2, y: 22 };
        })() : 
        { x: 2, y: 22 },
      bonus: 1000,
      gameRunning: true,
      gameOver: false,
      levelComplete: false
    }));
  };

  // Render game grid
  const renderGameGrid = () => {
    const grid = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      const row = [];
      for (let x = 0; x < GRID_WIDTH; x++) {
        const isWilly = gameState.willyPos.x === x && gameState.willyPos.y === y;
        const cellContent = isWilly ? '@' : currentLevel[y][x];
        
        row.push(
          <div
            key={`${x}-${y}`}
            className="grid-cell"
            data-content={cellContent}
          >
            {cellContent === ' ' ? '\u00A0' : cellContent}
          </div>
        );
      }
      grid.push(
        <div key={y} className="grid-row">
          {row}
        </div>
      );
    }
    return grid;
  };

  return (
    <div className="game-screen">
      <div className="game-area">
        <div className="game-grid">
          {renderGameGrid()}
        </div>
        {gameState.gameOver && (
          <div className="game-overlay">
            <div className="overlay-message">
              <h3>Game Over!</h3>
              <p>Final Score: {gameState.score}</p>
              <button className="game-button" onClick={resetGame}>Try Again</button>
              <button className="game-button" onClick={onReturnToMenu}>Menu</button>
            </div>
          </div>
        )}
        {gameState.levelComplete && (
          <div className="game-overlay">
            <div className="overlay-message">
              <h3>Level Complete!</h3>
              <p>Bonus Points: {gameState.bonus}</p>
              <p>Total Score: {gameState.score}</p>
              <button className="game-button" onClick={resetGame}>Next Level</button>
              <button className="game-button" onClick={onReturnToMenu}>Menu</button>
            </div>
          </div>
        )}
      </div>
      <div className="game-hud">
        <span>Score: {gameState.score}</span>
        <span>Bonus: {gameState.bonus}</span>
        <span>Worms: {gameState.lives}</span>
      </div>
      <div className="game-controls">
        <p>Arrow keys to move • Spacebar to jump • Reach the bell!</p>
        {!gameState.gameRunning && (
          <button className="game-button" onClick={startGame}>Start Game</button>
        )}
      </div>
    </div>
  );
};

export default WillyGame;