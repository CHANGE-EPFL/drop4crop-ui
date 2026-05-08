import React, { useState, useCallback, forwardRef, useContext, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './MapView.css';
import BoundingBoxSelection from './BoundingBoxSelection';
import { ScaleControl } from 'react-leaflet';
import { MapOverlay } from './Overlays';
import { MapClickHandler } from './Queries';
import { LegendControl } from './Legend';
import { AppContext } from '../../contexts/AppContext';
import { useProject } from '../../contexts/ProjectContext';

const WORLD_BOUNDS = L.latLngBounds([[-85, -180], [85, 180]]);

function ProjectExtent() {
  const map = useMap();
  const { config } = useProject() || {};
  const applied = useRef(false);

  useEffect(() => {
    if (!applied.current && config) {
      const p = config.project;
      if (p?.extent && Array.isArray(p.extent) && p.extent.length === 2) {
        map.fitBounds(p.extent, { animate: false, padding: [20, 20] });
      }
      applied.current = true;
    }

    // Snap the user back when they pan off the world edges, but only at
    // zoom levels where the viewport is narrower than the world.
    // Registered AFTER fitBounds so the synchronous moveend doesn't trigger it.
    const constrain = () => {
      const vb = map.getBounds();
      if (vb.getEast() - vb.getWest() >= 350) return;
      map.panInsideBounds(WORLD_BOUNDS, { animate: true });
    };
    map.on('moveend', constrain);
    return () => map.off('moveend', constrain);
  }, [config, map]);

  return null;
}

function UpdateMapZoom({ computedZoom, resetView, onResetDone }) {
  const map = useMap();
  useEffect(() => {
    if (resetView) {
      // If the current zoom is lower than the computed zoom,
      // then update it so the whole earth is visible.
      if (map.getZoom() < computedZoom) {
        map.setZoom(computedZoom);
      }
      // Optionally, update minZoom so that the user cannot zoom out past the new computed zoom.
      map.setMinZoom(computedZoom);
      onResetDone();
    }
  }, [computedZoom, resetView, map, onResetDone]);
  return null;
}

// Component to handle drag cursor - only shows grabbing cursor when actually dragging
function DragCursorHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();

    const onDragStart = () => {
      container.classList.add('map-dragging');
    };

    const onDragEnd = () => {
      container.classList.remove('map-dragging');
    };

    map.on('dragstart', onDragStart);
    map.on('dragend', onDragEnd);

    return () => {
      map.off('dragstart', onDragStart);
      map.off('dragend', onDragEnd);
      container.classList.remove('map-dragging');
    };
  }, [map]);

  return null;
}

const MapView = forwardRef((props, ref) => {
  const {
    layerName,
    setBoundingBox,
    enableSelection,
    setEnableSelection,
    globalAverage,
    layerStyle,
    interpolationType,
    labelDisplayMode,
    labelCount,
    variableForLegend,
    loadingLayer,
  } = useContext(AppContext);

  // Ref for container measurements
  const containerRef = useRef(null);
  // computedZoom is the zoom level where the width of the world (256 * 2^zoom) equals the container width.
  const [computedZoom, setComputedZoom] = useState(null);
  // resetView indicates that on window resize we want to update the map view.
  const [resetView, setResetView] = useState(false);

  // Recalculate the computed zoom from the container width.
  const updateZoom = () => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      // Set the computed zoom based on the container width with the grid size of 256 pixels.
      const newZoom = Math.log2(width / 256);
      setComputedZoom(newZoom);
      // Signal that the view should be reset.
      setResetView(true);
    }
  };

  // Run updateZoom on mount and on window resize.
  useEffect(() => {
    updateZoom();
    const handleResize = () => {
      updateZoom();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Until we have a computedZoom, don't render the map.
  if (computedZoom === null) {
    return (
      <div ref={containerRef} style={{ height: "100vh", width: "100%", backgroundColor: "#262626" }}>
        Loading...
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ height: "100vh", width: "100%", position: "relative" }}>
      <MapContainer
        center={[0, 0]}
        // Set the default zoom to the computed zoom.
        zoom={computedZoom}
        // Do not force a fixed minZoom in the MapContainer props—let the helper update it.
        style={{ height: "100%", width: "100%", backgroundColor: "#262626" }}
        zoomControl={false}
        worldCopyJump={false}
      >
        <UpdateMapZoom
          computedZoom={computedZoom}
          resetView={resetView}
          onResetDone={() => setResetView(false)}
        />
        <ProjectExtent />
        <DragCursorHandler />
        <MapOverlay layerName={layerName} loading={loadingLayer} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          attribution="&copy; <a href='https://www.epfl.ch/labs/change/' target='_blank' rel='noopener noreferrer'>CHANGE Lab.</a> | &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors | &copy; <a href='https://carto.com/attributions'>CARTO</a>"
          subdomains="abcd"
          maxZoom={20}
          noWrap={true}
        />
        {layerName && !loadingLayer && (
          <TileLayer
            key={layerName}
            url={`/api/layers/xyz/{z}/{x}/{y}?layer=${layerName}`}
            maxZoom={20}
            noWrap={true}
          />
        )}
        <ZoomControl position="bottomright" />
        <ScaleControl imperial={false} maxWidth={250} />
        <BoundingBoxSelection
          ref={ref}
          setBoundingBox={setBoundingBox}
          enableSelection={enableSelection}
          setEnableSelection={setEnableSelection}
        />
        <MapClickHandler />
        {layerName && (
          <LegendControl
            globalAverage={globalAverage}
            colorMap={layerStyle}
            interpolationType={interpolationType}
            labelDisplayMode={labelDisplayMode}
            labelCount={labelCount}
            selectedVariable={variableForLegend}
          />
        )}
      </MapContainer>
      <a
        href="https://www.epfl.ch/labs/change/"
        target="_blank"
        rel="noopener noreferrer"
        className="map-change-logo"
      >
        <img src="/CHANGE.svg" alt="CHANGE Lab" />
      </a>
    </div>
  );
});

export default MapView;
