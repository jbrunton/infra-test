import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from "react";

const newSessionId = () => (Math.random() + 1).toString(36).substring(7);

const getCounter = async (sessionId) => {
  const response = await fetch(`http://localhost:3001/counters/${sessionId}`);
  const counter = await response.json();
  return counter;
}

const incrementCounter = async (sessionId) => {
  await fetch(`http://localhost:3001/counters/${sessionId}/increment`, { method: "PUT" });
  return await getCounter(sessionId);
}

const resetCounter = async (sessionId) => {
  await fetch(`http://localhost:3001/counters/${sessionId}`, { method: "DELETE" });
  return await getCounter(sessionId);
}

function App() {
  const [sessionId] = useState(newSessionId());
  const [count, setCount] = useState(0);
  
  useEffect(async () => {
    const counter = await getCounter(sessionId);
    setCount(counter.count);
  });

  const incrementCounterClicked = async () => {
    const counter = await incrementCounter(sessionId);
    setCount(counter.count);
  };

  const resetCounterClicked = async () => {
    const counter = await resetCounter(sessionId);
    setCount(counter.count);
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Session ID: <code>{sessionId}</code>
        </p>
        <p>
          Counter: <code>{count}</code>
        </p>
        <a
          className="App-link"
          href="#"
          onClick={incrementCounterClicked}
        >
          Increment
        </a>
        <a
          className="App-link"
          href="#"
          onClick={resetCounterClicked}
        >
          Reset
        </a>
      </header>
    </div>
  );
}

export default App;
