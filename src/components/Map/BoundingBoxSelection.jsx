import { useMap } from 'react-leaflet';
import L from 'leaflet';
import {
    useEffect,
    useRef,
    useImperativeHandle,
    forwardRef,
    useContext,
} from 'react';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import './MapView.css';
import { AppContext } from '../../contexts/AppContext';

window.type = true;

// Helper to enable drag functionality on a rectangle layer
const enableRectangleDrag = (layer, map, callbacks) => {
    let isDragging = false;
    let startLatLng = null;

    const onMouseDown = (e) => {
        // Only start drag if clicking on the fill, not on markers
        if (e.originalEvent.target.classList.contains('leaflet-editing-icon')) return;

        isDragging = true;
        startLatLng = e.latlng;
        map.dragging.disable();
        L.DomEvent.stopPropagation(e);
    };

    const onMouseMove = (e) => {
        if (!isDragging || !startLatLng) return;

        const currentLatLng = e.latlng;
        const deltaLat = currentLatLng.lat - startLatLng.lat;
        const deltaLng = currentLatLng.lng - startLatLng.lng;

        // Get current bounds and calculate new bounds
        const bounds = layer.getBounds();
        const newBounds = L.latLngBounds(
            L.latLng(bounds.getSouth() + deltaLat, bounds.getWest() + deltaLng),
            L.latLng(bounds.getNorth() + deltaLat, bounds.getEast() + deltaLng)
        );

        // Update the rectangle
        layer.setBounds(newBounds);

        // Update start position for next move
        startLatLng = currentLatLng;

        // Callback for position updates (control buttons, etc.)
        if (callbacks.onMove) {
            callbacks.onMove(layer);
        }
    };

    const onMouseUp = () => {
        if (!isDragging) return;

        isDragging = false;
        startLatLng = null;
        map.dragging.enable();

        // Callback for drag end (update bounding box state)
        if (callbacks.onDragEnd) {
            callbacks.onDragEnd(layer);
        }
    };

    // Attach events to the layer
    layer.on('mousedown', onMouseDown);
    map.on('mousemove', onMouseMove);
    map.on('mouseup', onMouseUp);

    // Return cleanup function
    return () => {
        layer.off('mousedown', onMouseDown);
        map.off('mousemove', onMouseMove);
        map.off('mouseup', onMouseUp);
    };
};

// Helper to attach drag listeners to editing markers for real-time updates
const attachMarkerDragListeners = (layer, onDrag) => {
    const markers = layer.editing?._resizeMarkers || layer.editing?._markers || [];
    markers.forEach((marker) => {
        marker.on('drag', () => {
            onDrag(layer);
        });
    });
};

// Helper to set cursor styles on editing markers based on their position
const setEditingMarkerCursors = (layer) => {
    // Access the editing markers from leaflet-draw
    const markers = layer.editing?._resizeMarkers || layer.editing?._markers;
    if (!markers || markers.length === 0) return;

    const bounds = layer.getBounds();
    const nw = bounds.getNorthWest();
    const ne = bounds.getNorthEast();
    const se = bounds.getSouthEast();
    const sw = bounds.getSouthWest();
    const n = L.latLng(bounds.getNorth(), bounds.getCenter().lng);
    const s = L.latLng(bounds.getSouth(), bounds.getCenter().lng);
    const e = L.latLng(bounds.getCenter().lat, bounds.getEast());
    const w = L.latLng(bounds.getCenter().lat, bounds.getWest());

    const tolerance = 0.0001;

    const isNear = (pos, target) => {
        return Math.abs(pos.lat - target.lat) < tolerance &&
               Math.abs(pos.lng - target.lng) < tolerance;
    };

    markers.forEach((marker) => {
        const pos = marker.getLatLng();
        const el = marker.getElement?.() || marker._icon;
        if (!el) return;

        let cursor = 'move';

        // Check corners first (diagonal cursors)
        if (isNear(pos, nw) || isNear(pos, se)) {
            cursor = 'nwse-resize'; // NW-SE diagonal
        } else if (isNear(pos, ne) || isNear(pos, sw)) {
            cursor = 'nesw-resize'; // NE-SW diagonal
        }
        // Check edges (horizontal/vertical cursors)
        else if (isNear(pos, n) || isNear(pos, s)) {
            cursor = 'ns-resize'; // North-South
        } else if (isNear(pos, e) || isNear(pos, w)) {
            cursor = 'ew-resize'; // East-West
        }

        el.style.cursor = cursor;
    });
};

const BoundingBoxSelection = forwardRef(({ }, ref) => {
    const {
        boundingBox,
        setBoundingBox,
        enableSelection,
        setEnableSelection,
        setIsEditingBoundingBox,
        APIServerURL,
        layerName: currentLayer,
    } = useContext(AppContext);

    const map = useMap();

    // Toggle crosshair cursor when selection mode is active
    useEffect(() => {
        const container = map.getContainer();
        if (enableSelection) {
            container.classList.add('selection-mode');
        } else {
            container.classList.remove('selection-mode');
        }
        return () => {
            container.classList.remove('selection-mode');
        };
    }, [enableSelection, map]);
    const drawnItemsRef = useRef(new L.FeatureGroup());
    const drawHandlerRef = useRef(null);
    const controlMarkersRef = useRef(null); // Container for X and download buttons
    const currentLayerRef = useRef(null);
    const dragCleanupRef = useRef(null); // Cleanup function for drag handlers

    // Refs to store latest values for use in callbacks
    const boundingBoxRef = useRef(boundingBox);
    const currentLayerValueRef = useRef(currentLayer);

    // Keep refs updated
    boundingBoxRef.current = boundingBox;
    currentLayerValueRef.current = currentLayer;

    // Download handler - uses refs to get latest values
    const handleDownload = () => {
        const bbox = boundingBoxRef.current;
        const layer = currentLayerValueRef.current;
        if (bbox && layer) {
            const downloadUrl = `${APIServerURL}/layers/cog/${layer}.tif?minx=${bbox.minx}&miny=${bbox.miny}&maxx=${bbox.maxx}&maxy=${bbox.maxy}`;
            window.open(downloadUrl, '_blank');
            // Clear the selection after download
            clearSelection();
        }
    };

    // Clear selection helper - use ref for stable reference
    const clearSelectionRef = useRef(null);
    clearSelectionRef.current = () => {
        // Clean up drag handlers
        if (dragCleanupRef.current) {
            dragCleanupRef.current();
            dragCleanupRef.current = null;
        }

        // Clear the drawn rectangle
        drawnItemsRef.current.clearLayers();

        // Remove control buttons (delete and download)
        if (controlMarkersRef.current) {
            controlMarkersRef.current.eachLayer((layer) => {
                map.removeLayer(layer);
            });
            map.removeLayer(controlMarkersRef.current);
            controlMarkersRef.current = null;
        }

        // Reset state
        setBoundingBox(null);
        setEnableSelection(false);
        setIsEditingBoundingBox(false);
        currentLayerRef.current = null;
    };

    const clearSelection = () => {
        if (clearSelectionRef.current) {
            clearSelectionRef.current();
        }
    };

    // Create control buttons (X at corner, download in center) for the rectangle
    const createControlButtons = (layer) => {
        // Remove existing control markers
        if (controlMarkersRef.current) {
            map.removeLayer(controlMarkersRef.current);
        }

        const bounds = layer.getBounds();
        const ne = bounds.getNorthEast();
        const center = bounds.getCenter();

        // Create a container for both buttons
        const controlContainer = L.layerGroup();

        // Delete button (X) at top-right corner
        const deleteButton = L.divIcon({
            html: '<button class="bbox-delete-btn" style="background: #333; color: white; border: 1px solid #d1a766; border-radius: 4px; cursor: pointer; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">✕</button>',
            iconSize: [24, 24],
            className: 'bbox-control-button',
        });

        const deleteMarker = L.marker(ne, { icon: deleteButton, interactive: true });
        deleteMarker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            clearSelection();
        });
        controlContainer.addLayer(deleteMarker);

        // Download button in center of rectangle
        const downloadButton = L.divIcon({
            html: `<button class="bbox-download-btn" style="background: #333; color: #d1a766; border: 2px solid #d1a766; border-radius: 8px; cursor: pointer; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;" title="Download Selection">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1a766" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
            </button>`,
            iconSize: [44, 44],
            className: 'bbox-control-button bbox-download-button',
        });

        const downloadMarker = L.marker(center, {
            icon: downloadButton,
            interactive: true,
            zIndexOffset: 1000,
            bubblingMouseEvents: false
        });

        // Add click handler to marker
        downloadMarker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            handleDownload();
        });

        // Also attach click handler directly to the button element after it's added
        downloadMarker.on('add', () => {
            const el = downloadMarker.getElement();
            if (el) {
                const btn = el.querySelector('button');
                if (btn) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDownload();
                    });
                }
            }
        });

        controlContainer.addLayer(downloadMarker);

        // Store references for position updates
        controlContainer._deleteMarker = deleteMarker;
        controlContainer._downloadMarker = downloadMarker;

        controlContainer.addTo(map);
        controlMarkersRef.current = controlContainer;

        // Set editing state
        setIsEditingBoundingBox(true);

        return controlContainer;
    };

    // Update control button positions
    const updateControlPositions = (layer) => {
        if (controlMarkersRef.current) {
            const bounds = layer.getBounds();
            const ne = bounds.getNorthEast();
            const center = bounds.getCenter();

            // Update delete marker position (top-right corner)
            if (controlMarkersRef.current._deleteMarker) {
                controlMarkersRef.current._deleteMarker.setLatLng(ne);
            }
            // Update download marker position (center)
            if (controlMarkersRef.current._downloadMarker) {
                controlMarkersRef.current._downloadMarker.setLatLng(center);
            }
        }
    };

    useImperativeHandle(ref, () => ({
        clearLayers: () => {
            clearSelection();
        },
    }));

    useEffect(() => {
        const drawnItems = drawnItemsRef.current;
        map.addLayer(drawnItems);

        const handleDrawCreated = (e) => {
            const layer = e.layer;
            drawnItems.addLayer(layer);

            const bounds = layer.getBounds();
            const newBoundingBox = {
                minx: bounds.getSouthWest().lng,
                miny: bounds.getSouthWest().lat,
                maxx: bounds.getNorthEast().lng,
                maxy: bounds.getNorthEast().lat,
            };
            setBoundingBox(newBoundingBox);
            setEnableSelection(false);

            // Store the current layer
            currentLayerRef.current = layer;

            // Make the rectangle editable and draggable
            layer.editing.enable();

            // Set cursor styles on editing markers
            setTimeout(() => {
                setEditingMarkerCursors(layer);
                // Attach drag listeners for real-time button position updates
                attachMarkerDragListeners(layer, (l) => {
                    updateControlPositions(l);
                });
            }, 0);

            // Enable drag from anywhere on the rectangle
            if (dragCleanupRef.current) dragCleanupRef.current();
            dragCleanupRef.current = enableRectangleDrag(layer, map, {
                onMove: (l) => {
                    updateControlPositions(l);
                    // Re-enable editing to update marker positions
                    l.editing.disable();
                    l.editing.enable();
                    setTimeout(() => {
                        setEditingMarkerCursors(l);
                        attachMarkerDragListeners(l, (layer) => {
                            updateControlPositions(layer);
                        });
                    }, 0);
                },
                onDragEnd: (l) => {
                    const bounds = l.getBounds();
                    setBoundingBox({
                        minx: bounds.getSouthWest().lng,
                        miny: bounds.getSouthWest().lat,
                        maxx: bounds.getNorthEast().lng,
                        maxy: bounds.getNorthEast().lat,
                    });
                },
            });

            // Add control buttons (X and download)
            createControlButtons(layer);

            // Update bounding box and button positions when rectangle is edited
            layer.on('edit', () => {
                const editedBounds = layer.getBounds();
                updateControlPositions(layer);
                // Update cursor styles after edit (bounds may have changed)
                setTimeout(() => setEditingMarkerCursors(layer), 0);

                const editedBoundingBox = {
                    minx: editedBounds.getSouthWest().lng,
                    miny: editedBounds.getSouthWest().lat,
                    maxx: editedBounds.getNorthEast().lng,
                    maxy: editedBounds.getNorthEast().lat,
                };
                setBoundingBox(editedBoundingBox);
            });
        };

        map.on('draw:created', handleDrawCreated);

        if (enableSelection) {
            drawHandlerRef.current = new L.Draw.Rectangle(map, {
                shapeOptions: {
                    color: '#d1a766', // Set the color to your specified brown color
                    weight: 2,
                    opacity: 1.0,
                    fillOpacity: 0.2,
                    clickable: false,
                },
            });
            drawHandlerRef.current.enable();

            // Disable drawing on the next click to ensure it doesn't prematurely stop
            const disableDrawingOnClick = () => {
                if (drawHandlerRef.current) {
                    drawHandlerRef.current.disable();
                    map.off('click', disableDrawingOnClick);
                }
            };

            map.on('click', disableDrawingOnClick);
        } else {
            if (drawHandlerRef.current) {
                drawHandlerRef.current.disable();
            }
        }

        return () => {
            if (drawHandlerRef.current) {
                drawHandlerRef.current.disable();
            }
            map.removeLayer(drawnItems);
            map.off('draw:created', handleDrawCreated);
        };
    }, [enableSelection, map, setBoundingBox, setEnableSelection]);

    // Listen for changes in the boundingBox prop to update the drawn rectangle
    useEffect(() => {

        if (boundingBox) {
            if (!boundingBox.miny || !boundingBox.minx || !boundingBox.maxy || !boundingBox.maxx) {
                // Do not allow invalid bounding boxes, wait until all values are set
                return;
            } else {
                // Once we have a valid bounding box, disable the selection
                setEnableSelection(false);
            }
        }

        if (boundingBox && currentLayerRef.current) {
            // Update the rectangle if it's already drawn
            const layer = currentLayerRef.current;
            const newBounds = new L.LatLngBounds(
                new L.LatLng(boundingBox.miny, boundingBox.minx),
                new L.LatLng(boundingBox.maxy, boundingBox.maxx)
            );
            layer.setBounds(newBounds);

            // Move the control buttons as well
            updateControlPositions(layer);
        } else if (boundingBox && !currentLayerRef.current) {
            // If no layer exists, create a new one with the bounding box
            const bounds = new L.LatLngBounds(
                new L.LatLng(boundingBox.miny, boundingBox.minx),
                new L.LatLng(boundingBox.maxy, boundingBox.maxx)
            );
            const layer = L.rectangle(bounds, {
                color: '#d1a766',
                weight: 2,
                opacity: 1.0,
                fillOpacity: 0.2,
            }).addTo(drawnItemsRef.current);
            currentLayerRef.current = layer;

            // Make the rectangle editable
            layer.editing.enable();

            // Set cursor styles on editing markers
            setTimeout(() => {
                setEditingMarkerCursors(layer);
                // Attach drag listeners for real-time button position updates
                attachMarkerDragListeners(layer, (l) => {
                    updateControlPositions(l);
                });
            }, 0);

            // Enable drag from anywhere on the rectangle
            if (dragCleanupRef.current) dragCleanupRef.current();
            dragCleanupRef.current = enableRectangleDrag(layer, map, {
                onMove: (l) => {
                    updateControlPositions(l);
                    l.editing.disable();
                    l.editing.enable();
                    setTimeout(() => {
                        setEditingMarkerCursors(l);
                        attachMarkerDragListeners(l, (layer) => {
                            updateControlPositions(layer);
                        });
                    }, 0);
                },
                onDragEnd: (l) => {
                    const bounds = l.getBounds();
                    setBoundingBox({
                        minx: bounds.getSouthWest().lng,
                        miny: bounds.getSouthWest().lat,
                        maxx: bounds.getNorthEast().lng,
                        maxy: bounds.getNorthEast().lat,
                    });
                },
            });

            // Add control buttons (X and download)
            createControlButtons(layer);

            // Update bounding box and button positions when rectangle is edited
            layer.on('edit', () => {
                const editedBounds = layer.getBounds();
                updateControlPositions(layer);
                // Update cursor styles after edit (bounds may have changed)
                setTimeout(() => setEditingMarkerCursors(layer), 0);

                const editedBoundingBox = {
                    minx: editedBounds.getSouthWest().lng,
                    miny: editedBounds.getSouthWest().lat,
                    maxx: editedBounds.getNorthEast().lng,
                    maxy: editedBounds.getNorthEast().lat,
                };
                setBoundingBox(editedBoundingBox);
            });
        }
    }, [boundingBox, map, setBoundingBox]);

    return null;
});

export default BoundingBoxSelection;
