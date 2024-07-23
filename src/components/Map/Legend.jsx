
import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';


export const LegendControl = ({ wmsParams, geoserverUrl, globalAverage }) => {
    const map = useMap();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const legendUrl = `${geoserverUrl}/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=${wmsParams}&FORMAT=image/png&TRANSPARENT=true&LEGEND_OPTIONS=fontColor:0xd3d3d3;fontAntiAliasing:true;`;

        const legendContainer = L.DomUtil.create('div', 'legend-container');


        legendContainer.style.backgroundColor = '#333';
        legendContainer.style.padding = '10px';
        legendContainer.style.borderRadius = '5px';
        legendContainer.style.opacity = '0.95';

        const toggleButton = L.DomUtil.create('button', 'toggle-button', legendContainer);
        toggleButton.style.backgroundColor = '#282c34';
        toggleButton.style.color = '#d3d3d3';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '3px';
        toggleButton.style.padding = '5px';
        toggleButton.style.marginBottom = '10px';
        toggleButton.style.float = 'right'; // Move the button to the right

        toggleButton.innerHTML = isVisible ? 'Hide' : 'Show';
        toggleButton.className = 'toggle-button';
        toggleButton.onclick = (e) => {
            e.stopPropagation();
            setIsVisible(!isVisible);
            toggleButton.innerHTML = isVisible ? 'Show' : 'Hide';
            legendContent.style.display = isVisible ? 'none' : 'block';
        };

        const legendContent = L.DomUtil.create('div', 'legend-content', legendContainer);
        legendContent.style.display = isVisible ? 'block' : 'none';

        const legendTitle = L.DomUtil.create('div', 'legend-title', legendContent);
        legendTitle.innerHTML = '<strong>Legend</strong>';
        legendTitle.style.color = '#d3d3d3'; // Apply color to title explicitly

        const legendImage = L.DomUtil.create('img', 'legend-image', legendContent);
        legendImage.src = legendUrl;
        legendImage.alt = 'Legend';

        const legendControl = L.control({ position: 'topright' });

        legendControl.onAdd = () => {
            return legendContainer;
        };

        legendControl.addTo(map);

        return () => {
            legendControl.remove();
        };
    }, [wmsParams, geoserverUrl, map, isVisible]);

    return null;
};

export default LegendControl;