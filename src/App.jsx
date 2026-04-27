import React from 'react';
import FrontendApp from './frontend/App';
import AdminApp from './admin/App.jsx';
import SplashPage from './pages/SplashPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Use the classic <BrowserRouter>/<Routes> pattern (not createBrowserRouter)
// because react-admin v5's <Admin basename="/admin"> only correctly nests
// inside a parent BrowserRouter context — see react-admin docs example for
// "embedded in another React Router app". With createBrowserRouter the data
// router sets a basename that strips "/admin" before react-admin's inner
// Router sees it, leaving URL "/" and triggering "Router basename='/admin'
// is not able to match the URL '/'" in production.
const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<SplashPage />} />
            <Route path="/projects/:slug" element={<FrontendApp />} />
            <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
    </BrowserRouter>
);

export default App;
