import React from 'react';

import './App.css';
import MainMap from './components/MainMap';
import ManaPanel from './components/ManaPanel';

function App() {
  return (
    <React.Fragment>
      <ManaPanel />
      <MainMap />
    </React.Fragment>
  );
}

export default App;
