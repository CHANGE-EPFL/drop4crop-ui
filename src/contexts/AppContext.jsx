import React, { createContext, useState } from 'react';

export const AppContext = createContext();
export const AppProvider = ({ children }) => {
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
    const [activePanel, setActivePanel] = useState(null);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [selectedGlobalWaterModel, setSelectedGlobalWaterModel] = useState(null);
    const [selectedClimateModel, setSelectedClimateModel] = useState(null);
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [selectedVariable, setSelectedVariable] = useState(null);
    const [selectedCropVariable, setSelectedCropVariable] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [variableForLegend, setVariableForLegend] = useState(undefined);
    const [countryPolygons, setCountryPolygons] = useState(null);

    return (
        <AppContext.Provider
            value={{
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
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
