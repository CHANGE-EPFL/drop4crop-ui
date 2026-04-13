import React, { createContext, useContext } from 'react';

export const ProjectContext = createContext(null);

export const ProjectProvider = ({ slug, children }) => {
    return (
        <ProjectContext.Provider value={{ slug }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => useContext(ProjectContext);
