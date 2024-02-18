import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Auth from './pages/auth';
import Quizz from './pages/quiz';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" exact element={<Auth />} />
          <Route path="/quizz" exact element={<Quizz />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
