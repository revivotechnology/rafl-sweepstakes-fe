import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import Rules from '@/pages/Rules';
import Amoe from '@/pages/Amoe';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toaster';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/admin',
    element: <AdminDashboard />,
  },
  {
    path: '/rules/:promoId',
    element: <Rules />,
  },
  {
    path: '/amoe/:promoId',
    element: <Amoe />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;