import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import { createPathComponent } from '@react-leaflet/core';

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


        parseGeoraster(url).then(georaster => {
            // console.log(georaster);
            // const values = georaster.values[0].flat().filter(value => !isNaN(value));
            // const min = Math.min(...values);
            // const max = Math.max(...values);

            // setLegendData({ min, max, colorMap });

            const layer = new GeoRasterLayer({
                georaster: georaster,
                resolution: resolution,
                // opacity,
                // resolution: 128,
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

        }).catch(err => {
            console.error('Error loading a Georaster', err);
        });


        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }
        };
    }, [url]);

    return null;
}

// const GeoRasterComponent = createPathComponent(
//     (options, context) => ({
//         instance: new GeoRasterLayerForLeaflet(options),
//         context,
//     }),
// );

// const useGeoraster = (paths) => {
//     const [georasters, setGeoraster] = React.useState();
//     React.useEffect(() => {
//         const promises = paths.map(
//             path => parseGeoraster(path)
//         );
//         Promise.all([...promises])
//             .then((res) => {
//                 setGeoraster(res);
//             })
//             .catch(err => {
//                 console.error('Error loading a Georaster', err);
//             });
//     }, [paths]);

//     return georasters;
// };

// function GeoRasterLayer({
//     paths,
//     ...options
// }) {
//     const georasters = useGeoraster(paths);

//     return georasters ? (
//         <GeoRasterComponent {...options} georasters={georasters} />
//     ) : null;
// }

// export default GeoRasterLayer;