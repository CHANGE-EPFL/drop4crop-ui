import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import './MapView.css';

window.type = true;

const BoundingBoxSelection = forwardRef(({ setBoundingBox, enableSelection, setEnableSelection }, ref) => {
    const map = useMap();
    const drawnItemsRef = useRef(new L.FeatureGroup());
    const drawHandlerRef = useRef(null);
    const deleteMarkerRef = useRef(null);

    useImperativeHandle(ref, () => ({
        clearLayers: () => {
            drawnItemsRef.current.clearLayers();
            if (deleteMarkerRef.current) {
                map.removeLayer(deleteMarkerRef.current);
                deleteMarkerRef.current = null;
            }
        },
    }));

    useEffect(() => {
        const drawnItems = drawnItemsRef.current;
        map.addLayer(drawnItems);

        const handleDrawCreated = (e) => {
            const layer = e.layer;
            drawnItems.addLayer(layer);
            const bounds = layer.getBounds();
            const boundingBox = {
                minx: bounds.getSouthWest().lng,
                miny: bounds.getSouthWest().lat,
                maxx: bounds.getNorthEast().lng,
                maxy: bounds.getNorthEast().lat,
            };
            setBoundingBox(boundingBox);
            setEnableSelection(false);

            // Add delete button
            const deleteButton = L.divIcon({
                html: '<button style="background: black; color: white; border: none; border-radius: 50%; cursor: pointer; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">X</button>',
                iconSize: [20, 20],
                className: 'delete-button-icon',
            });

            const deleteMarker = L.marker(layer.getBounds().getNorthEast(), { icon: deleteButton }).addTo(map);
            deleteMarkerRef.current = deleteMarker;
            deleteMarker.on('click', () => {
                drawnItems.removeLayer(layer);
                map.removeLayer(deleteMarker);
                setBoundingBox(null);
                setEnableSelection(false);
            });

            // Update marker position when rectangle is edited
            layer.on('edit', () => {
                const newBounds = layer.getBounds();
                deleteMarker.setLatLng(newBounds.getNorthEast());
                const newBoundingBox = {
                    minx: newBounds.getSouthWest().lng,
                    miny: newBounds.getSouthWest().lat,
                    maxx: newBounds.getNorthEast().lng,
                    maxy: newBounds.getNorthEast().lat,
                };
                setBoundingBox(newBoundingBox);
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

    return null;
});

export default BoundingBoxSelection;