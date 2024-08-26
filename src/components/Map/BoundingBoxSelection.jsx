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

const BoundingBoxSelection = forwardRef(({ }, ref) => {
    const {
        boundingBox,
        setBoundingBox,
        enableSelection,
        setEnableSelection,
    } = useContext(AppContext);

    const map = useMap();
    const drawnItemsRef = useRef(new L.FeatureGroup());
    const drawHandlerRef = useRef(null);
    const deleteMarkerRef = useRef(null);
    const currentLayerRef = useRef(null);

    useImperativeHandle(ref, () => ({
        clearLayers: () => {
            drawnItemsRef.current.clearLayers();
            if (deleteMarkerRef.current) {
                map.removeLayer(deleteMarkerRef.current);
                deleteMarkerRef.current = null;
            }
            currentLayerRef.current = null;
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

            // Store the current layer
            currentLayerRef.current = layer;

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
                currentLayerRef.current = null;
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

            // Move the delete marker as well
            if (deleteMarkerRef.current) {
                deleteMarkerRef.current.setLatLng(newBounds.getNorthEast());
            }
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

            // Add the delete button
            const deleteButton = L.divIcon({
                html: '<button style="background: black; color: white; border: none; border-radius: 50%; cursor: pointer; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">X</button>',
                iconSize: [20, 20],
                className: 'delete-button-icon',
            });

            const deleteMarker = L.marker(layer.getBounds().getNorthEast(), { icon: deleteButton }).addTo(map);
            deleteMarkerRef.current = deleteMarker;
            deleteMarker.on('click', () => {
                drawnItemsRef.current.removeLayer(layer);
                map.removeLayer(deleteMarker);
                setBoundingBox(null);
                setEnableSelection(false);
                currentLayerRef.current = null;
            });
        }
    }, [boundingBox, map, setBoundingBox]);

    return null;
});

export default BoundingBoxSelection;
