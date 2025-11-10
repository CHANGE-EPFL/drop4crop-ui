import React, { createContext, useContext, useEffect } from 'react';
import axios from 'axios';
import { AppContext } from './AppContext';
import {
    cropItems,
    globalWaterModelsItems,
    climateModelsItems,
    scenariosItems,
    variablesItems,
    cropVariablesItems,
} from '../variables';

const LayerManagerContext = createContext();

export const useLayerManager = () => {
    return useContext(LayerManagerContext);
};

export const LayerManagerProvider = ({ children }) => {
    const {
        setCrops,
        setGlobalWaterModels,
        setClimateModels,
        setScenarios,
        setVariables,
        setCropVariables,
        setAvailableYears,
        setSelectedTime,
        loadingGroups,
        setLoadingGroups,
        setCountryPolygons,
        loadingCountries,
        setLoadingCountries,
        setLoadingAll,
        selectedLayer,
        setLayerName,
        setCountryAverageValues,
        setGlobalAverage,
        setLayerStyle,
        setloadingLayer,
        selectedVariable,
        selectedCropVariable,
        selectedTime,
        setVariableForLegend,
    } = useContext(AppContext);

    const getLayer = async (props) => {
        try {
            const scenario = props.year === 2000 ? "historical" : props.scenario;

            // Build STAC search parameters
            const params = {
                crop: props.crop,
                limit: 1  // We only need one result
            };

            if (props.crop_variable) {
                params.variable = props.crop_variable;
            } else {
                params.variable = props.variable;
                params.datetime = props.year;  // STAC uses datetime parameter
                params.scenario = scenario;
                params.water_model = props.water_model;
                params.climate_model = props.climate_model;
            }

            // Use STAC search endpoint instead of custom /api/layers/map
            const response = await axios.get("/api/stac/search", { params });

            // Parse STAC GeoJSON response
            if (response && response.data.features && response.data.features.length === 1) {
                const stacItem = response.data.features[0];

                // Transform STAC item to match old format for compatibility
                return {
                    layer_name: stacItem.id,
                    country_values: stacItem.properties.country_values || null,
                    global_average: stacItem.properties.global_average || null,
                    style: stacItem.properties.style || [],
                    // Include STAC-specific fields for future use
                    stac_item: stacItem,
                    // STAC provides direct tile URL
                    tile_url: stacItem.assets?.tiles?.href,
                    download_url: stacItem.assets?.download?.href
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching layer from STAC:", error);
            return null;
        }
    };

    useEffect(() => {
        const fetchLayerData = async () => {
            setloadingLayer(true);

            const isBasicFieldsFilled =
                selectedLayer.crop &&
                selectedLayer.water_model &&
                selectedLayer.climate_model &&
                selectedLayer.scenario &&
                selectedTime;

            const isStandardScenarioValid =
                isBasicFieldsFilled &&
                selectedLayer.variable;

            const isCropSpecificScenarioValid =
                selectedLayer.crop &&
                selectedLayer.crop_variable;

            if (!isStandardScenarioValid && !isCropSpecificScenarioValid) {
                setLayerName(undefined);
                setloadingLayer(false);
                return;
            }

            const response = await getLayer({
                crop: selectedLayer.crop,
                water_model: selectedLayer.water_model,
                climate_model: selectedLayer.climate_model,
                scenario: selectedLayer.scenario,
                variable: selectedLayer.variable,
                crop_variable: selectedLayer.crop_variable,
                year: selectedTime
            });

            if (response === null) {
                setLayerName(null);
                setCountryAverageValues(null);
                setGlobalAverage(null);
                setLayerStyle([]);
            } else {
                setLayerName(response.layer_name);
                setCountryAverageValues(response.country_values);
                setGlobalAverage(response.global_average);
                setLayerStyle(response.style || []);
            }

            if (selectedLayer.variable) {
                setVariableForLegend(selectedVariable);
            } else if (selectedLayer.crop_variable) {
                setVariableForLegend(selectedCropVariable);
            } else {
                setVariableForLegend(undefined);
            }

            setloadingLayer(false);
        };

        fetchLayerData();
    }, [
        selectedLayer.crop,
        selectedLayer.water_model,
        selectedLayer.climate_model,
        selectedLayer.scenario,
        selectedLayer.variable,
        selectedLayer.crop_variable,
        selectedTime,
        setLayerName,
        setCountryAverageValues,
        setGlobalAverage,
        setLayerStyle,
        setloadingLayer,
        setVariableForLegend,
        selectedVariable,
        selectedCropVariable
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/layers/groups');
                const { crop, water_model, climate_model, scenario, variable, year } = response.data;

                setCrops(cropItems.map(c => ({ ...c, enabled: crop.includes(c.id) })));
                setGlobalWaterModels(globalWaterModelsItems.map(m => ({ ...m, enabled: water_model.includes(m.id) })));
                setClimateModels(climateModelsItems.map(m => ({ ...m, enabled: climate_model.includes(m.id) })));
                setScenarios(scenariosItems.map(s => ({ ...s, enabled: scenario.includes(s.id) })));
                setVariables(variablesItems.map(v => ({ ...v, enabled: variable.includes(v.id) })));
                setCropVariables(cropVariablesItems.map(v => ({ ...v, enabled: variable.includes(v.id) })));

                // Filter out null values and sort years chronologically
                const validYears = year.filter(y => y !== null).sort((a, b) => a - b);
                setAvailableYears(validYears);

                if (validYears.length > 0) {
                    setSelectedTime(validYears[0]);
                }
                setLoadingGroups(false);
            } catch (error) {
                console.error("Error fetching layer groups:", error);
            }
        };

        fetchData();
    }, [
        setCrops,
        setGlobalWaterModels,
        setClimateModels,
        setScenarios,
        setVariables,
        setCropVariables,
        setAvailableYears,
        setSelectedTime,
        setLoadingGroups
    ]);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axios.get("/api/countries");
                setCountryPolygons(response.data);
                setLoadingCountries(false);
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        };

        fetchCountries();
    }, [setCountryPolygons, setLoadingCountries]);

    useEffect(() => {
        if (loadingGroups === false && loadingCountries === false) {
            setLoadingAll(false);
        } else {
            setLoadingAll(true);
        }
    }, [loadingGroups, loadingCountries, setLoadingAll]);

    return (
        <LayerManagerContext.Provider value={{}}>
            {children}
        </LayerManagerContext.Provider>
    );
};
