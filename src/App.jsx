import React from 'react';
import FrontendApp from './frontend/App';
import AdminApp from './admin/App.jsx';
import { RouterProvider, Routes, Route, createBrowserRouter } from 'react-router-dom';

const App = () => {
    const router = createBrowserRouter(
        [
            {
                path: "*",
                element: (
                    <Routes>
                        <Route path="/" element={<FrontendApp />} />
                        <Route path="/admin/*" element={<AdminApp />} />
                    </Routes>
                ),
            },
        ],
    );
    return <RouterProvider router={router} />;
};

export default App;