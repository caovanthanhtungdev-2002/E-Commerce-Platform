import { BrowserRouter, Routes } from 'react-router-dom';
import { AuthRoutes } from '@/routes/AuthRoutes';
import { ToastContainer } from '@/components/Toast';
import './global.css';

export default function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications - global */}
      <ToastContainer />
      
      <Routes>
  {AuthRoutes()}
</Routes>
    </BrowserRouter>
  );
}
