import React, { createContext, useState, useMemo } from 'react';

export const AppContext = createContext();
export const AppProvider = ({ children }) => {
    const APIServerURL = window.location.origin + '/api';

    const [loadingGroups, setLoadingGroups] = useState(true);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [loadingLayer, setloadingLayer] = useState(false);
    const [loadingAll, setLoadingAll] = useState(true);
    const [layerName, setLayerName] = useState(undefined);
    const [globalAverage, setGlobalAverage] = useState(undefined);
    const [countryAverageValues, setCountryAverageValues] = useState(undefined);
    const [layerStyle, setLayerStyle] = useState([]);
    const [selectedLayer, setSelectedLayer] = useState({
        crop: undefined,
        water_model: undefined,
        climate_model: undefined,
        scenario: undefined,
        variable: undefined,
        crop_variable: undefined,
    });
    const [boundingBox, setBoundingBox] = useState(null);
    const [enableSelection, setEnableSelection] = useState(false);
    const [countryAverages, setCountryAverages] = useState(false);
    const [crops, setCrops] = useState([]);
    const [globalWaterModels, setGlobalWaterModels] = useState([]);
    const [climateModels, setClimateModels] = useState([]);
    const [scenarios, setScenarios] = useState([]);
    const [variables, setVariables] = useState([]);
    const [cropVariables, setCropVariables] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [activePanel, setActivePanel] = useState('info');
    const [selectedCrop, setSelectedCrop] = useState({ id: "maize", name: "Maize", enabled: true });
    const [selectedGlobalWaterModel, setSelectedGlobalWaterModel] = useState({ id: "cwatm", name: "CWatM", enabled: true });
    const [selectedClimateModel, setSelectedClimateModel] = useState({ id: "gfdl-esm2m", name: "GFDL-ESM2M", enabled: true });
    const [selectedScenario, setSelectedScenario] = useState({ id: "rcp26", name: "RCP 2.6", enabled: true });
    const [selectedVariable, setSelectedVariable] = useState({ id: "etg", name: "Green", abbreviation: "ETg", unit: "mm", enabled: true });
    const [selectedCropVariable, setSelectedCropVariable] = useState(null);
    const [selectedTime, setSelectedTime] = useState(2010);
    const [variableForLegend, setVariableForLegend] = useState(undefined);
    const [countryPolygons, setCountryPolygons] = useState(null);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        APIServerURL,
        loadingGroups,
        setLoadingGroups,
        loadingCountries,
        setLoadingCountries,
        loadingLayer,
        setloadingLayer,
        loadingAll,
        setLoadingAll,
        layerName,
        setLayerName,
        globalAverage,
        setGlobalAverage,
        countryAverageValues,
        setCountryAverageValues,
        layerStyle,
        setLayerStyle,
        selectedLayer,
        setSelectedLayer,
        boundingBox,
        setBoundingBox,
        enableSelection,
        setEnableSelection,
        countryAverages,
        setCountryAverages,
        crops,
        setCrops,
        globalWaterModels,
        setGlobalWaterModels,
        climateModels,
        setClimateModels,
        scenarios,
        setScenarios,
        variables,
        setVariables,
        cropVariables,
        setCropVariables,
        availableYears,
        setAvailableYears,
        activePanel,
        setActivePanel,
        selectedCrop,
        setSelectedCrop,
        selectedGlobalWaterModel,
        setSelectedGlobalWaterModel,
        selectedClimateModel,
        setSelectedClimateModel,
        selectedScenario,
        setSelectedScenario,
        selectedVariable,
        setSelectedVariable,
        selectedCropVariable,
        setSelectedCropVariable,
        selectedTime,
        setSelectedTime,
        variableForLegend,
        setVariableForLegend,
        countryPolygons,
        setCountryPolygons,
    }), [
        loadingGroups, loadingCountries, loadingLayer, loadingAll,
        layerName, globalAverage, countryAverageValues, layerStyle,
        selectedLayer, boundingBox, enableSelection, countryAverages,
        crops, globalWaterModels, climateModels, scenarios,
        variables, cropVariables, availableYears, activePanel,
        selectedCrop, selectedGlobalWaterModel, selectedClimateModel,
        selectedScenario, selectedVariable, selectedCropVariable,
        selectedTime, variableForLegend, countryPolygons
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};
