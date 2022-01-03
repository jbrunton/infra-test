import './App.css';
import { env } from './env';
import { useState, useEffect } from "react";

const newSessionId = () => (Math.random() + 1).toString(36).substring(7);

const apiAddress = env.REACT_APP_API_ADDRESS;

const getCounter = async (sessionId) => {
  const response = await fetch(`${apiAddress}/counters/${sessionId}`);
  const counter = await response.json();
  return counter;
}

const incrementCounter = async (sessionId) => {
  await fetch(`${apiAddress}/counters/${sessionId}/increment`, { method: "PUT" });
  return await getCounter(sessionId);
}

const resetCounter = async (sessionId) => {
  await fetch(`${apiAddress}/counters/${sessionId}`, { method: "DELETE" });
  return await getCounter(sessionId);
}

const useCounter = (sessionId) => {
  const [count, setCount] = useState(0);

  const load = async () => {
    const counter = await getCounter(sessionId);
    setCount(counter.count);
  }

  const increment = async () => {
    const counter = await incrementCounter(sessionId);
    setCount(counter.count);
  }

  const reset = async () => {
    const counter = await resetCounter(sessionId);
    setCount(counter.count);
  }

  return {
    count,
    load,
    increment,
    reset,
  };
};

function App() {
  const [sessionId] = useState(newSessionId());
  const { count, load, increment, reset } = useCounter(sessionId);
  
  useEffect(load);
  
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Session ID: <code>{sessionId}</code>
        </p>
        <p id="counter">
          Counter: <code>{count}</code>
        </p>
        <a
          className="App-link"
          href="#"
          onClick={increment}
        >
          Increment
        </a>
        <a
          className="App-link"
          href="#"
          onClick={reset}
        >
          Reset
        </a>
      </header>
    </div>
  );
}

export default App;
