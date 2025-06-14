import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { LoginScreen } from "./components/LoginScreen";
import { MainApp } from "./components/MainApp";

function AppContent() {
  const { state } = useApp();

  return (
    <div className="app">
      {!state.isAuthenticated ? <MainApp /> : <LoginScreen />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}

export default App;
