import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './ShowcaseOverlay.css';

// Showcase examples data with all the layer parameters and descriptions
const showcaseExamples = [
  {
    id: 1,
    crop: { id: 'wheat', name: 'Wheat', enabled: true },
    variable: { id: 'wf', name: 'Total', abbreviation: 'WF', unit: 'm³', enabled: true },
    waterModel: { id: 'cwatm', name: 'CWatM', enabled: true },
    climateModel: { id: 'gfdl-esm2m', name: 'GFDL-ESM2M', enabled: true },
    scenario: { id: 'rcp26', name: 'RCP 2.6', enabled: true },
    year: 2030,
    cropVariable: null,
    title: 'Water Footprint of Wheat',
    description: 'Total water footprint of wheat for the year 2030 - computed with the Climate Model GFDL-ESM2M and Water Model CWatM, scenario RCP 2.6.',
  },
  {
    id: 2,
    crop: { id: 'sugarcane', name: 'Sugar Cane', enabled: true },
    variable: { id: 'etb', name: 'Blue', abbreviation: 'ETb', unit: 'mm', enabled: true },
    waterModel: { id: 'h08', name: 'H08', enabled: true },
    climateModel: { id: 'miroc5', name: 'MIROC5', enabled: true },
    scenario: { id: 'rcp60', name: 'RCP 6.0', enabled: true },
    year: 2050,
    cropVariable: null,
    title: 'Blue Evapotranspiration of Sugarcane',
    description: 'Blue evapotranspiration of sugarcane for the year 2050 - computed with the Climate Model MIROC5 and Water Model H08, under RCP 6.0.',
  },
  {
    id: 3,
    crop: { id: 'rice', name: 'Rice', enabled: true },
    variable: { id: 'wdb', name: 'Blue', abbreviation: 'WDb', unit: 'years', enabled: true },
    waterModel: { id: 'watergap2', name: 'WaterGAP2', enabled: true },
    climateModel: { id: 'hadgem2-es', name: 'HadGEM2-ES', enabled: true },
    scenario: { id: 'rcp85', name: 'RCP 8.5', enabled: true },
    year: 2090,
    cropVariable: null,
    title: 'Blue Water Debt of Rice',
    description: 'Blue water debt of rice at the end of the century (year 2090), under the worst-case scenario RCP 8.5 - computed with the Climate Model HadGEM2-ES and Water Model WaterGAP2.',
  },
  {
    id: 4,
    crop: { id: 'barley', name: 'Barley', enabled: true },
    variable: null,
    waterModel: null,
    climateModel: null,
    scenario: null,
    year: null,
    cropVariable: { id: 'production', name: 'Production', abbreviation: 'Production', unit: 'ton', enabled: true },
    title: 'Global Production of Barley',
    description: 'Global production of barley, in tons per hectares.',
  },
  {
    id: 5,
    crop: { id: 'maize', name: 'Maize', enabled: true },
    variable: null,
    waterModel: null,
    climateModel: null,
    scenario: null,
    year: null,
    cropVariable: { id: 'mirca_area_total', name: 'Total Area', abbreviation: 'MircaAreaTotal', unit: 'ha', enabled: true },
    title: 'Total Harvested Area of Maize',
    description: 'Total harvested area of maize, in hectares.',
  },
];

const ROTATION_INTERVAL = 10000; // 10 seconds
const PROGRESS_STEP = 100 / (ROTATION_INTERVAL / 100); // Progress increment per 100ms
const MAP_INTERACTION_DEBOUNCE = 1500; // Resume after 1.5 seconds of no interaction

const ShowcaseOverlay = () => {
  const {
    showcaseMode,
    setShowcaseMode,
    showcaseIndex,
    setShowcaseIndex,
    setSelectedCrop,
    setSelectedGlobalWaterModel,
    setSelectedClimateModel,
    setSelectedScenario,
    setSelectedVariable,
    setSelectedCropVariable,
    setSelectedTime,
    setLayerName,
    loadingGroups,
  } = useContext(AppContext);

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const indexRef = useRef(showcaseIndex);
  const lastClickRef = useRef(0);
  const mapInteractionTimeoutRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    indexRef.current = showcaseIndex;
  }, [showcaseIndex]);

  // Detect map interactions (click, drag, zoom) - pauses the timer
  useEffect(() => {
    if (!showcaseMode) return;

    let mapContainer = null;
    let retryTimeout = null;

    const handleMapInteraction = () => {
      setIsPaused(true);

      // Clear existing timeout
      if (mapInteractionTimeoutRef.current) {
        clearTimeout(mapInteractionTimeoutRef.current);
      }

      // Resume after debounce period
      mapInteractionTimeoutRef.current = setTimeout(() => {
        setIsPaused(false);
      }, MAP_INTERACTION_DEBOUNCE);
    };

    const attachListeners = () => {
      mapContainer = document.querySelector('.leaflet-container');

      if (mapContainer) {
        // Only pause on actual interactions: clicking, dragging, zooming
        mapContainer.addEventListener('mousedown', handleMapInteraction);
        mapContainer.addEventListener('wheel', handleMapInteraction);
        mapContainer.addEventListener('touchstart', handleMapInteraction);
      } else {
        // Retry if map container not found yet
        retryTimeout = setTimeout(attachListeners, 100);
      }
    };

    // Start trying to attach listeners
    attachListeners();

    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (mapContainer) {
        mapContainer.removeEventListener('mousedown', handleMapInteraction);
        mapContainer.removeEventListener('wheel', handleMapInteraction);
        mapContainer.removeEventListener('touchstart', handleMapInteraction);
      }
      if (mapInteractionTimeoutRef.current) {
        clearTimeout(mapInteractionTimeoutRef.current);
      }
    };
  }, [showcaseMode]);

  // Apply the current showcase example to the state
  const applyShowcaseExample = useCallback((index) => {
    const example = showcaseExamples[index];
    if (!example) return;

    setSelectedCrop(example.crop);
    setSelectedVariable(example.variable);
    setSelectedGlobalWaterModel(example.waterModel);
    setSelectedClimateModel(example.climateModel);
    setSelectedScenario(example.scenario);
    setSelectedTime(example.year);
    setSelectedCropVariable(example.cropVariable);
  }, [setSelectedCrop, setSelectedVariable, setSelectedGlobalWaterModel, setSelectedClimateModel, setSelectedScenario, setSelectedTime, setSelectedCropVariable]);

  // Apply initial example when groups are loaded
  useEffect(() => {
    if (!loadingGroups && showcaseMode) {
      applyShowcaseExample(showcaseIndex);
    }
  }, [loadingGroups, showcaseMode]); // Only run on initial load

  // Handle navigation to a specific slide (for manual clicks)
  const goToSlide = useCallback((index) => {
    // Debounce rapid clicks
    const now = Date.now();
    if (now - lastClickRef.current < 300) return;
    lastClickRef.current = now;

    setProgress(0);
    setShowcaseIndex(index);
    indexRef.current = index;
    applyShowcaseExample(index);
  }, [setShowcaseIndex, applyShowcaseExample]);

  // Handle next/previous navigation
  const goToNext = useCallback(() => {
    const nextIndex = (indexRef.current + 1) % showcaseExamples.length;
    goToSlide(nextIndex);
  }, [goToSlide]);

  const goToPrev = useCallback(() => {
    const prevIndex = (indexRef.current - 1 + showcaseExamples.length) % showcaseExamples.length;
    goToSlide(prevIndex);
  }, [goToSlide]);

  // Auto-rotation with progress tracking - simple interval that always runs
  useEffect(() => {
    if (!showcaseMode) return;

    const intervalId = setInterval(() => {
      if (isPaused) return; // Skip update when paused but keep interval running

      setProgress((prev) => {
        const newProgress = prev + PROGRESS_STEP;
        if (newProgress >= 100) {
          // Auto-advance to next slide
          const nextIndex = (indexRef.current + 1) % showcaseExamples.length;
          setShowcaseIndex(nextIndex);
          indexRef.current = nextIndex;
          applyShowcaseExample(nextIndex);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(intervalId);
  }, [showcaseMode, isPaused, setShowcaseIndex, applyShowcaseExample]);

  // Exit showcase mode
  const handleStartBrowsing = useCallback(() => {
    // Clear all selections and layer when starting to browse
    setSelectedCrop(null);
    setSelectedVariable(null);
    setSelectedGlobalWaterModel(null);
    setSelectedClimateModel(null);
    setSelectedScenario(null);
    setSelectedTime(null);
    setSelectedCropVariable(null);
    setLayerName(null); // Clear the map layer immediately
    setShowcaseMode(false);
  }, [setShowcaseMode, setSelectedCrop, setSelectedVariable, setSelectedGlobalWaterModel, setSelectedClimateModel, setSelectedScenario, setSelectedTime, setSelectedCropVariable, setLayerName]);

  if (!showcaseMode) return null;

  const currentExample = showcaseExamples[showcaseIndex];

  return (
    <div className="showcase-overlay">
      {/* Bottom description panel */}
      <div className="showcase-panel">
        {/* Progress bar */}
        <div className={`showcase-progress-bar ${isPaused ? 'paused' : ''}`}>
          <div
            className="showcase-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Navigation arrows */}
        <button
          className="showcase-nav-btn showcase-nav-prev"
          onClick={goToPrev}
          aria-label="Previous example"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {/* Content */}
        <div className="showcase-content">
          <h2 className="showcase-title">{currentExample.title}</h2>
          <p className="showcase-description">{currentExample.description}</p>

          {/* Dot indicators */}
          <div className="showcase-dots">
            {showcaseExamples.map((_, index) => (
              <button
                key={index}
                className={`showcase-dot ${index === showcaseIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to example ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          className="showcase-nav-btn showcase-nav-next"
          onClick={goToNext}
          aria-label="Next example"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        {/* Start browsing button */}
        <button
          className="showcase-start-btn"
          onClick={handleStartBrowsing}
        >
          Start Browsing
        </button>
      </div>
    </div>
  );
};

export default ShowcaseOverlay;
