import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import 'leaflet-draw/dist/leaflet.draw.css';

window.type = true;

const BoundingBoxSelection = forwardRef(({ setBoundingBox, enableSelection, setEnableSelection }, ref) => {
    const map = useMap();
    const drawnItemsRef = useRef(new L.FeatureGroup());
    const drawControlRef = useRef(null);
    const drawHandlerRef = useRef(null);

    useImperativeHandle(ref, () => ({
        clearLayers: () => {
            drawnItemsRef.current.clearLayers();
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
            const disableDrawingOnClick = (e) => {
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
