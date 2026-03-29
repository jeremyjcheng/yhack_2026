import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import GlobalChatWidget from './GlobalChatWidget';

export default function Layout() {
  return (
    <div className="h-screen bg-app-bg text-app-text">
      <Navbar />
      <Outlet />
      <GlobalChatWidget />
    </div>
  );
}
