import React from 'react';

import './App.css';
import MainFrame from './ux-components/MainFrame';
import ManaPanel from './ux-components/ManaPanel';

function App() {
  return (
    <React.Fragment>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <ManaPanel />
        <MainFrame />
      </div>
    </React.Fragment>
  );
}

export default App;
