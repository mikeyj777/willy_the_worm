import React, { useState, useEffect } from 'react';

const WillyEditor = ({ onReturnToMenu, onTestLevel }) => {
  const GRID_WIDTH = 40;
  const GRID_HEIGHT = 25;

  // Editor state
  const [editorState, setEditorState] = useState({
    selectedTool: 'platform',
    grid: Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(' ')),
    willyStart: { x: 2, y: 22 }
  });

  // Initialize with default level template
  useEffect(() => {
    const defaultLevel = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(' '));
    
    // Add basic platform at bottom
    for (let x = 0; x < GRID_WIDTH; x++) {
      defaultLevel[23][x] = '═';
    }
    
    // Add Willy start position
    defaultLevel[22][2] = '@';
    
    setEditorState(prev => ({ 
      ...prev, 
      grid: defaultLevel,
      willyStart: { x: 2, y: 22 }
    }));
  }, []);

  // Editor functions
  const handleCellClick = (x, y) => {
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
    const emptyGrid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(' '));
    // Keep bottom platform and Willy start
    for (let x = 0; x < GRID_WIDTH; x++) {
      emptyGrid[23][x] = '═';
    }
    emptyGrid[22][2] = '@';
    
    setEditorState(prev => ({
      ...prev,
      grid: emptyGrid,
      willyStart: { x: 2, y: 22 }
    }));
  };

  const testLevel = () => {
    // Validate level before testing
    let hasWilly = false;
    let hasBell = false;
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (editorState.grid[y][x] === '@') hasWilly = true;
        if (editorState.grid[y][x] === '♪') hasBell = true;
      }
    }
    
    if (!hasWilly) {
      alert('Please place Willy (@) on the level!');
      return;
    }
    
    if (!hasBell) {
      alert('Please place a bell (♪) to complete the level!');
      return;
    }
    
    onTestLevel(editorState.grid);
  };

  const saveLevel = () => {
    // Convert grid to JSON and copy to clipboard
    const levelData = JSON.stringify(editorState.grid);
    navigator.clipboard.writeText(levelData).then(() => {
      alert('Level data copied to clipboard!');
    }).catch(() => {
      alert('Could not copy to clipboard. Level data:\n' + levelData);
    });
  };

  const loadLevel = () => {
    const levelData = prompt('Paste level data here:');
    if (levelData) {
      try {
        const parsedGrid = JSON.parse(levelData);
        if (Array.isArray(parsedGrid) && parsedGrid.length === GRID_HEIGHT) {
          // Find Willy's position
          let willyPos = { x: 2, y: 22 };
          for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
              if (parsedGrid[y][x] === '@') {
                willyPos = { x, y };
                break;
              }
            }
          }
          
          setEditorState(prev => ({
            ...prev,
            grid: parsedGrid,
            willyStart: willyPos
          }));
          alert('Level loaded successfully!');
        } else {
          alert('Invalid level data format!');
        }
      } catch (error) {
        alert('Could not parse level data!');
      }
    }
  };

  // Render editor grid
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
            title={`(${x}, ${y})`}
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

  const getToolDescription = (tool) => {
    const descriptions = {
      platform: 'Solid platforms that Willy can walk on',
      ladder: 'Ladders that Willy can climb up and down',
      present: 'Collectible presents worth 100 points each',
      ball: 'Dangerous balls that will hurt Willy',
      bell: 'The goal! Willy must reach this to complete the level',
      willy: 'Starting position for Willy the Worm',
      eraser: 'Remove objects from the grid'
    };
    return descriptions[tool] || '';
  };

  return (
    <div className="editor-screen">
      <div className="editor-area">
        <div className="editor-grid">
          {renderEditorGrid()}
        </div>
      </div>
      
      <div className="editor-toolbar">
        <div className="tool-section">
          <h4>Build Tools:</h4>
          <button 
            className={`tool-button ${editorState.selectedTool === 'platform' ? 'active' : ''}`}
            onClick={() => setEditorState(prev => ({...prev, selectedTool: 'platform'}))}
            title={getToolDescription('platform')}
          >
            Platform (═)
          </button>
          <button 
            className={`tool-button ${editorState.selectedTool === 'ladder' ? 'active' : ''}`}
            onClick={() => setEditorState(prev => ({...prev, selectedTool: 'ladder'}))}
            title={getToolDescription('ladder')}
          >
            Ladder (║)
          </button>
          <button 
            className={`tool-button ${editorState.selectedTool === 'present' ? 'active' : ''}`}
            onClick={() => setEditorState(prev => ({...prev, selectedTool: 'present'}))}
            title={getToolDescription('present')}
          >
            Present (☼)
          </button>
          <button 
            className={`tool-button ${editorState.selectedTool === 'ball' ? 'active' : ''}`}
            onClick={() => setEditorState(prev => ({...prev, selectedTool: 'ball'}))}
            title={getToolDescription('ball')}
          >
            Ball (o)
          </button>
          <button 
            className={`tool-button ${editorState.selectedTool === 'bell' ? 'active' : ''}`}
            onClick={() => setEditorState(prev => ({...prev, selectedTool: 'bell'}))}
            title={getToolDescription('bell')}
          >
            Bell (♪)
          </button>
          <button 
            className={`tool-button ${editorState.selectedTool === 'willy' ? 'active' : ''}`}
            onClick={() => setEditorState(prev => ({...prev, selectedTool: 'willy'}))}
            title={getToolDescription('willy')}
          >
            Willy (@)
          </button>
          <button 
            className={`tool-button ${editorState.selectedTool === 'eraser' ? 'active' : ''}`}
            onClick={() => setEditorState(prev => ({...prev, selectedTool: 'eraser'}))}
            title={getToolDescription('eraser')}
          >
            Eraser
          </button>
        </div>
        
        <div className="action-section">
          <h4>Actions:</h4>
          <button className="tool-button action-button" onClick={clearEditor}>
            Clear All
          </button>
          <button className="tool-button action-button" onClick={testLevel}>
            Test Level
          </button>
          <button className="tool-button action-button" onClick={saveLevel}>
            Save Level
          </button>
          <button className="tool-button action-button" onClick={loadLevel}>
            Load Level
          </button>
        </div>
      </div>
      
      <div className="editor-instructions">
        <p><strong>Selected Tool:</strong> {editorState.selectedTool.toUpperCase()} - {getToolDescription(editorState.selectedTool)}</p>
        <p>Click on the grid to place objects • Must have Willy (@) and Bell (♪) to test • Save/Load to share levels!</p>
        <p>Willy Start Position: ({editorState.willyStart.x}, {editorState.willyStart.y})</p>
      </div>
    </div>
  );
};

export default WillyEditor;