import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="h-screen bg-app-bg text-app-text">
      <Navbar />
      <Outlet />
    </div>
  );
}
