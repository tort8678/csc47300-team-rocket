import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/home/Home';
import Categories from './pages/categories/Categories';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Profile from './pages/profile/Profile';
import Threads from './pages/threads/Threads';
import CreateThread from './pages/createThread/CreateThread';
import Thread from './pages/thread/Thread';
import AdminDashboard from './pages/adminDashboard/dashboard';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/categories",
    element: <Categories />
  },
  {
    path: "/threads",
    element: <Threads />
  },
  {
    path: "/thread/:threadId",
    element: <Thread />
  },
  {
    path: "/profile",
    element: <Profile />
  },
  {
    path: "/profile/:username",
    element: <Profile />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/thread/new",
    element: <CreateThread />
  },
  {
    path: "/thread/:threadId/edit",
    element: <CreateThread />
  },
  {
    path: "/admin",
    element: <AdminDashboard />
  },
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
