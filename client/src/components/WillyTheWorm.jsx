import React, { useState, useEffect, useCallback } from 'react';

const WillyTheWorm = () => {
  const GRID_WIDTH = 40;
  const GRID_HEIGHT = 25;
  
  const [currentMode, setCurrentMode] = useState('menu');
  
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

  // Editor state
  const [editorState, setEditorState] = useState({
    selectedTool: 'platform',
    grid: Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(' ')),
    willyStart: { x: 2, y: 22 }
  });

  // Level data
  const [currentLevel, setCurrentLevel] = useState(
    Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(' '))
  );

  // Initialize default level
  useEffect(() => {
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
    setEditorState(prev => ({ ...prev, grid: defaultLevel.map(row => [...row]) }));
  }, []);

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

      switch (direction) {
        case 'left':
          if (canMove(newPos.x - 1, newPos.y)) newPos.x--;
          break;
        case 'right':
          if (canMove(newPos.x + 1, newPos.y)) newPos.x++;
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
      if (currentMode !== 'game') return;
      
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
  }, [currentMode, moveWilly]);

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
    setGameState({
      willyPos: { x: 2, y: 22 },
      score: 0,
      bonus: 1000,
      lives: 3,
      level: 1,
      gameRunning: true,
      gameOver: false,
      levelComplete: false
    });
    setCurrentMode('game');
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      willyPos: { x: 2, y: 22 },
      bonus: 1000,
      gameRunning: true,
      gameOver: false,
      levelComplete: false
    }));
  };

  // Editor functions
  const handleCellClick = (x, y) => {
    if (currentMode !== 'editor') return;

    setEditorState(prev => {
      const newGrid = prev.grid.map(row => [...row]);
      
      if (prev.selectedTool === 'eraser') {
        newGrid[y][x] = ' ';
      } else if (prev.selectedTool === 'willy') {
        // Clear previous Willy position
        for (let row = 0; row < GRID_HEIGHT; row++) {
          for (let col = 0; col < GRID_WIDTH; col++) {
            if (newGrid[row][col] === '@') newGrid[row][col] = ' ';
          }
        }
        newGrid[y][x] = '@';
        return { ...prev, grid: newGrid, willyStart: { x, y } };
      } else {
        const toolChars = {
          platform: '═',
          ladder: '║',
          present: '☼',
          ball: 'o',
          bell: '♪'
        };
        newGrid[y][x] = toolChars[prev.selectedTool] || ' ';
      }
      
      return { ...prev, grid: newGrid };
    });
  };

  const clearEditor = () => {
    setEditorState(prev => ({
      ...prev,
      grid: Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(' ')),
      willyStart: { x: 2, y: 22 }
    }));
  };

  const testLevel = () => {
    setCurrentLevel(editorState.grid.map(row => [...row]));
    setGameState({
      willyPos: { ...editorState.willyStart },
      score: 0,
      bonus: 1000,
      lives: 3,
      level: 1,
      gameRunning: true,
      gameOver: false,
      levelComplete: false
    });
    setCurrentMode('game');
  };

  // Render functions
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

  const renderEditorGrid = () => {
    const grid = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      const row = [];
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cellContent = editorState.grid[y][x];
        
        row.push(
          <div
            key={`${x}-${y}`}
            className="grid-cell editor-cell"
            data-content={cellContent}
            onClick={() => handleCellClick(x, y)}
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

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
  };

  const GamePlay = () => (
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
              <button className="game-button" onClick={() => setCurrentMode('menu')}>Menu</button>
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
              <button className="game-button" onClick={() => setCurrentMode('menu')}>Menu</button>
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

  const GameEditor = () => (
    <div className="editor-screen">
      <div className="editor-area">
        <div className="editor-grid">
          {renderEditorGrid()}
        </div>
      </div>
      <div className="editor-toolbar">
        <button 
          className={`tool-button ${editorState.selectedTool === 'platform' ? 'active' : ''}`}
          onClick={() => setEditorState(prev => ({...prev, selectedTool: 'platform'}))}
        >
          Platform
        </button>
        <button 
          className={`tool-button ${editorState.selectedTool === 'ladder' ? 'active' : ''}`}
          onClick={() => setEditorState(prev => ({...prev, selectedTool: 'ladder'}))}
        >
          Ladder
        </button>
        <button 
          className={`tool-button ${editorState.selectedTool === 'present' ? 'active' : ''}`}
          onClick={() => setEditorState(prev => ({...prev, selectedTool: 'present'}))}
        >
          Present
        </button>
        <button 
          className={`tool-button ${editorState.selectedTool === 'ball' ? 'active' : ''}`}
          onClick={() => setEditorState(prev => ({...prev, selectedTool: 'ball'}))}
        >
          Ball
        </button>
        <button 
          className={`tool-button ${editorState.selectedTool === 'bell' ? 'active' : ''}`}
          onClick={() => setEditorState(prev => ({...prev, selectedTool: 'bell'}))}
        >
          Bell
        </button>
        <button 
          className={`tool-button ${editorState.selectedTool === 'willy' ? 'active' : ''}`}
          onClick={() => setEditorState(prev => ({...prev, selectedTool: 'willy'}))}
        >
          Willy
        </button>
        <button 
          className={`tool-button ${editorState.selectedTool === 'eraser' ? 'active' : ''}`}
          onClick={() => setEditorState(prev => ({...prev, selectedTool: 'eraser'}))}
        >
          Eraser
        </button>
        <button className="tool-button action-button" onClick={clearEditor}>
          Clear All
        </button>
        <button className="tool-button action-button" onClick={testLevel}>
          Test Level
        </button>
      </div>
      <div className="editor-instructions">
        <p>Click on the grid to place objects • Select tool first • Test your level when ready!</p>
      </div>
    </div>
  );

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
        {currentMode === 'game' && <GamePlay />}
        {currentMode === 'editor' && <GameEditor />}
      </main>
    </div>
  );
};

export default WillyTheWorm;