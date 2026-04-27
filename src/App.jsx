import React from 'react';
import FrontendApp from './frontend/App';
import AdminApp from './admin/App.jsx';
import SplashPage from './pages/SplashPage';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

const App = () => {
    const router = createBrowserRouter(
        [
            {
                path: "/",
                element: <SplashPage />,
            },
            {
                path: "/projects/:slug",
                element: <FrontendApp />,
            },
            {
                path: "/admin/*",
                element: <AdminApp />,
            },
        ],
    );
    return <RouterProvider router={router} />;
};

export default App;
