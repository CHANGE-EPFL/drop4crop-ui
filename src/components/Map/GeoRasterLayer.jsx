import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import { isNaN } from "lodash";
import chroma from "chroma-js";

export default function GeoRaster({ url }) {
    // const { map, layerContainer } = useMap();
    const map = useMap();
    const layerRef = React.useRef(null);

    console.log("Rendering GeoRaster");

    useEffect(() => {
        if (!url) return;
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                parseGeoraster(arrayBuffer).then(georaster => {
                    var layer = new GeoRasterLayer({
                        georaster: georaster,
                        opacity: 0.25,
                        pixelValuesToColorFn: values => {
                            // Set colour palette from min to max values
                            const min = Math.min(...values);
                            const max = Math.max(...values);
                            const scale = chroma.scale(["#fafa6e", "#2A4858"]).domain([min, max]);
                            return values.map(value => {
                                if (isNaN(value)) {
                                    return "rgba(0,0,0,0)";
                                }
                                return scale(value).hex();
                            });
                        }
                        // resolution: 64 // optional parameter for adjusting display resolution
                    });
                    layer.addTo(map);
                    map.fitBounds(layer.getBounds());
                });
            });

        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }
        };
    }, [map, url]);

    return null;
}
