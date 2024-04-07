import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Home from "./components/Home";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>Bus tracker</div>
      </header>
      <body>
        <Home />
      </body>
    </div>
  );
}

export default App;
