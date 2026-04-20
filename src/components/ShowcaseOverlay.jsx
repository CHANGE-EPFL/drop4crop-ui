import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useProject } from '../contexts/ProjectContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './ShowcaseOverlay.css';

const ROTATION_INTERVAL = 12000; // 12 seconds
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
    setActivePanel,
    loadingGroups,
  } = useContext(AppContext);
  const project = useProject();

  const [showcaseExamples, setShowcaseExamples] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const indexRef = useRef(showcaseIndex);
  const lastClickRef = useRef(0);
  const mapInteractionTimeoutRef = useRef(null);

  // Fetch showcase items from the API. If the project has none configured
  // (or the request fails), exit showcase mode and drop straight to the map
  // — no hardcoded fallback examples, the DB is the only source of truth.
  useEffect(() => {
    if (!project?.slug) return;
    axios
      .get(`/api/showcase-items/by-project/${project.slug}`)
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const items = res.data.map((item, index) => ({
            id: index + 1,
            crop: item.crop ? { id: item.crop.slug, name: item.crop.name, enabled: true } : null,
            variable: item.variable && !item.variable.is_crop_specific
              ? { id: item.variable.slug, name: item.variable.name, abbreviation: item.variable.abbreviation, subscript: item.variable.subscript, unit: item.variable.unit, enabled: true }
              : null,
            waterModel: item.water_model ? { id: item.water_model.slug, name: item.water_model.name, enabled: true } : null,
            climateModel: item.climate_model ? { id: item.climate_model.slug, name: item.climate_model.name, enabled: true } : null,
            scenario: item.scenario ? { id: item.scenario.slug, name: item.scenario.name, enabled: true } : null,
            year: item.year,
            cropVariable: item.variable && item.variable.is_crop_specific
              ? { id: item.variable.slug, name: item.variable.name, abbreviation: item.variable.abbreviation, unit: item.variable.unit, enabled: true }
              : null,
            title: item.title,
            description: item.description || '',
          }));
          setShowcaseExamples(items);
        } else {
          // Project has no showcase items configured — go straight to the map
          setShowcaseMode(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch showcase items:', err);
        setShowcaseMode(false);
      });
  }, [project?.slug, setShowcaseMode]);

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

  // Exit showcase mode and clear selections (fresh start)
  const handleStartBrowsing = useCallback(() => {
    // Clear the map layer first, before clearing selections
    setLayerName(null);

    // Then clear all selections
    setSelectedCrop(null);
    setSelectedVariable(null);
    setSelectedGlobalWaterModel(null);
    setSelectedClimateModel(null);
    setSelectedScenario(null);
    setSelectedTime(null);
    setSelectedCropVariable(null);

    setShowcaseMode(false);
  }, [setShowcaseMode, setSelectedCrop, setSelectedVariable, setSelectedGlobalWaterModel, setSelectedClimateModel, setSelectedScenario, setSelectedTime, setSelectedCropVariable, setLayerName]);

  // Exit showcase mode but keep current layer (explore this map)
  const handleExploreCurrentMap = useCallback(() => {
    setShowcaseMode(false);
  }, [setShowcaseMode]);

  if (!showcaseMode) return null;

  const currentExample = showcaseExamples[showcaseIndex];
  // Guard against the brief render window between mount and the API response
  // resolving — no data yet means nothing to show.
  if (!currentExample) return null;

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
          <h2
            className="showcase-title showcase-title-clickable"
            onClick={handleExploreCurrentMap}
            title="Click to explore this map"
          >
            {currentExample.title}
            <FontAwesomeIcon icon={faUpRightFromSquare} className="showcase-title-icon" />
          </h2>
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
