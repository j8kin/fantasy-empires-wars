import React from 'react';

import logo from './logo.svg';
import './App.css';
import MainMap from './components/MainMap';
import ManaPanel from './components/ManaPanel';

function App() {
  return (
    <React.Fragment>
      <ManaPanel />
      <body className="App-header">
        <MainMap />
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
      </body>
    </React.Fragment>
  );
}

export default App;
