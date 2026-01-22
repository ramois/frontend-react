import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage, UserPage } from '../pages/public';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to='/login' />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user" element={<UserPage />} />
      </Routes>
    </BrowserRouter>
  );
};
