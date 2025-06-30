import { Navigate, useLocation } from 'react-router-dom';

export default function AuthGuard({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  return token ? children : (
    <Navigate 
      to="/login" 
      state={{ from: location }} 
      replace 
    />
  );
}