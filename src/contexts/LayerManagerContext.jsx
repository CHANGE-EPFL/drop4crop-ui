import React, { createContext, useContext, useEffect } from 'react';
import axios from 'axios';
import { AppContext } from './AppContext';
import { useProject } from './ProjectContext';
import { useSearchParams } from 'react-router-dom';

const LayerManagerContext = createContext();

export const useLayerManager = () => {
    return useContext(LayerManagerContext);
};

export const LayerManagerProvider = ({ children }) => {
    const [searchParams] = useSearchParams();
    const project = useProject();
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
        setLoadingAll,
        selectedLayer,
        setLayerName,
        setGlobalAverage,
        setLayerStyle,
        setInterpolationType,
        setLabelDisplayMode,
        setLabelCount,
        setloadingLayer,
        selectedVariable,
        selectedCropVariable,
        selectedTime,
        setVariableForLegend,
        // The lists below are populated from /api/layers/groups; their
        // presence tells us which axes this project actually exposes. If
        // `globalWaterModels` is empty the project has no water-model axis,
        // so we must NOT require a selectedLayer.water_model to display a layer.
        crops,
        globalWaterModels,
        climateModels,
        scenarios,
        variables,
        cropVariables,
    } = useContext(AppContext);

    const getLayer = async (props) => {
        try {
            const scenario = props.year === 2000 ? "historical" : props.scenario;

            // Build STAC search parameters. Only attach axis filters the project
            // actually uses — sending water_model=undefined/null trips STAC into
            // treating it as an explicit mismatch, and empty strings end up as
            // `&water_model=` which the API then fails to resolve.
            const params = {
                limit: 1,  // We only need one result
                ...(project?.slug ? { project: project.slug } : {}),
            };
            if (props.crop) params.crop = props.crop;

            if (props.crop_variable) {
                params.variable = props.crop_variable;
            } else {
                if (props.variable) params.variable = props.variable;
                if (props.year != null) params.datetime = props.year;
                if (scenario) params.scenario = scenario;
                if (props.water_model) params.water_model = props.water_model;
                if (props.climate_model) params.climate_model = props.climate_model;
            }

            // Use STAC search endpoint instead of custom /api/layers/map
            const response = await axios.get("/api/stac/search", { params });

            // Parse STAC GeoJSON response
            if (response && response.data.features && response.data.features.length === 1) {
                const stacItem = response.data.features[0];

                // Transform STAC item to match old format for compatibility
                return {
                    layer_name: stacItem.id,
                    global_average: stacItem.properties.global_average || null,
                    style: stacItem.properties.style || [],
                    interpolation_type: stacItem.properties.interpolation_type || 'linear',
                    label_display_mode: stacItem.properties.label_display_mode || 'auto',
                    label_count: stacItem.properties.label_count || 5,
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
        // Track whether this effect instance is still current
        // This prevents stale API responses from updating state
        let isCancelled = false;

        const fetchLayerData = async () => {
            setloadingLayer(true);

            // Only axes the project actually uses count as "required". A project
            // with, e.g., no water-model axis shouldn't block the layer lookup
            // waiting on a selection the user can't make. We derive the axis
            // presence from the project-scoped groups lists populated below.
            const hasCrops = (crops?.length ?? 0) > 0;
            const hasWaterModels = (globalWaterModels?.length ?? 0) > 0;
            const hasClimateModels = (climateModels?.length ?? 0) > 0;
            const hasScenarios = (scenarios?.length ?? 0) > 0;
            const hasVariables = (variables?.length ?? 0) > 0;
            const hasCropVariables = (cropVariables?.length ?? 0) > 0;
            const projectHasTime = project?.config?.project?.year_axis != null;
            const variableNeedsTime = projectHasTime && selectedVariable?.has_time !== false;
            const hasYears =
                !variableNeedsTime ||
                (typeof selectedTime !== 'undefined' && selectedTime !== null);

            const isStandardScenarioValid =
                hasVariables &&
                (!hasCrops || selectedLayer.crop) &&
                (!hasWaterModels || selectedLayer.water_model) &&
                (!hasClimateModels || selectedLayer.climate_model) &&
                (!hasScenarios || selectedLayer.scenario) &&
                selectedLayer.variable &&
                hasYears;

            const isCropSpecificScenarioValid =
                hasCropVariables &&
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
                year: variableNeedsTime ? selectedTime : undefined
            });

            // Check if this effect was cancelled while we were waiting for the API
            if (isCancelled) {
                return;
            }

            if (response === null) {
                setLayerName(null);
                setGlobalAverage(null);
                setLayerStyle([]);
                setInterpolationType('linear');
                setLabelDisplayMode('auto');
                setLabelCount(5);
            } else {
                setLayerName(response.layer_name);
                setGlobalAverage(response.global_average);
                setLayerStyle(response.style || []);
                setInterpolationType(response.interpolation_type || 'linear');
                setLabelDisplayMode(response.label_display_mode || 'auto');
                setLabelCount(response.label_count || 5);
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

        // Cleanup function - marks this effect instance as cancelled
        return () => {
            isCancelled = true;
        };
    }, [
        selectedLayer.crop,
        selectedLayer.water_model,
        selectedLayer.climate_model,
        selectedLayer.scenario,
        selectedLayer.variable,
        selectedLayer.crop_variable,
        selectedTime,
        setLayerName,
        setGlobalAverage,
        setLayerStyle,
        setInterpolationType,
        setLabelDisplayMode,
        setLabelCount,
        setloadingLayer,
        setVariableForLegend,
        selectedVariable,
        selectedCropVariable,
        // Re-run when axis presence changes (e.g., groups finish loading) so
        // a selection made pre-load doesn't stay stuck on the "use the buttons"
        // overlay after the project's actual axis set is known.
        crops,
        globalWaterModels,
        climateModels,
        scenarios,
        variables,
        cropVariables,
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const groupsUrl = project?.slug
                    ? `/api/layers/groups?project=${project.slug}`
                    : '/api/layers/groups';
                const response = await axios.get(groupsUrl);
                // Categories with no items are dropped by the API, so default
                // each list to an empty array rather than relying on the key
                // being present.
                const {
                    crop = [],
                    water_model = [],
                    climate_model = [],
                    scenario = [],
                    variable = [],
                    year = [],
                } = response.data || {};

                setCrops(crop.map(c => ({ ...c, id: c.slug, enabled: true })));
                setGlobalWaterModels(water_model.map(m => ({ ...m, id: m.slug, enabled: true })));
                setClimateModels(climate_model.map(m => ({ ...m, id: m.slug, enabled: true })));
                setScenarios(scenario.map(s => ({ ...s, id: s.slug, enabled: true })));

                setVariables(variable.filter(v => !v.is_crop_specific).map(v => ({ ...v, id: v.slug, enabled: true })));
                setCropVariables(variable.filter(v => v.is_crop_specific).map(v => ({ ...v, id: v.slug, enabled: true })));

                // Filter out null values and sort years chronologically
                const validYears = year.filter(y => y !== null).sort((a, b) => a - b);
                setAvailableYears(validYears);

                // Only set default year if no year specified in URL
                const urlYear = searchParams.get('year');
                if (validYears.length > 0 && !urlYear) {
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
        if (loadingGroups === false) {
            setLoadingAll(false);
        } else {
            setLoadingAll(true);
        }
    }, [loadingGroups, setLoadingAll]);

    return (
        <LayerManagerContext.Provider value={{}}>
            {children}
        </LayerManagerContext.Provider>
    );
};
