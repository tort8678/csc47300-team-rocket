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


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/Categories",
    element: <Categories />
  },
  {
    path: "/Threads",
    element: <Threads />
  },
  {
    path: "/Profile",
    element: <Profile />
  },
  {
    path: "/Login",
    element: <Login />
  },
  {
    path: "/Register",
    element: <Register />
  },
  {
    path: "/Thread/New",
    element: <CreateThread />
  },

]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
