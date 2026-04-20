import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ProjectContext = createContext(null);

export const ProjectProvider = ({ slug, children }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }
        setLoading(true);
        axios
            .get(`/api/projects/config/${slug}`)
            .then((res) => {
                setConfig(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch project config:', err);
                setLoading(false);
            });
    }, [slug]);

    return (
        <ProjectContext.Provider value={{ slug, config, loading }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => useContext(ProjectContext);
