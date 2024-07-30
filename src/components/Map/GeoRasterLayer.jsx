import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

const parseQGISColorMap = (colorMapString) => {
    const lines = colorMapString.trim().split('\n');
    const colors = [];
    for (let line of lines) {
        const [value, r, g, b, a] = line.split(',').map(Number);
        colors.push({ value, color: `rgba(${r},${g},${b},${a / 255})` });
    }
    return colors;
};

export default function GeoRaster({ url, setLegendData, colorMapString, opacity, resolution }) {
    const map = useMap();
    const layerRef = useRef(null);

    const colorMap = parseQGISColorMap(colorMapString);

    useEffect(() => {
        if (!url) return;

        fetch(url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                parseGeoraster(arrayBuffer).then(georaster => {
                    const values = georaster.values[0].flat().filter(value => !isNaN(value));
                    const min = Math.min(...values);
                    const max = Math.max(...values);

                    setLegendData({ min, max, colorMap });

                    const layer = new GeoRasterLayer({
                        georaster,
                        opacity,
                        resolution,
                        proj4: null,
                        pixelValuesToColorFn: value => {
                            if (isNaN(value)) return null;
                            for (let i = 0; i < colorMap.length; i++) {
                                if (value <= colorMap[i].value) {
                                    return colorMap[i].color;
                                }
                            }
                            return colorMap[colorMap.length - 1].color;
                        }
                    });
                    layerRef.current = layer;
                    map.addLayer(layer);
                });
            });

        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }
        };
    }, [url, opacity, resolution]);

    return null;
}
