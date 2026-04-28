
import './App.css'
import { BrowserRouter, Routes } from 'react-router-dom';
import { AuthRoutes } from './routes/AuthRoutes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
  {AuthRoutes()}   
</Routes>
    </BrowserRouter>
  );
}

export default App
