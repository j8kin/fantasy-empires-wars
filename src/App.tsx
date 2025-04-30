import React from 'react';

import './App.css';
import MainFrame from './ux-components/MainFrame';
import ManaPanel from './ux-components/ManaPanel';

function App() {
  return (
    <React.Fragment>
      <ManaPanel />
      <MainFrame />
    </React.Fragment>
  );
}

export default App;
