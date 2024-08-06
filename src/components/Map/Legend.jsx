import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

const createLegendContainer = (isVisible, globalAverage, colorMap) => {
    const legendContainer = L.DomUtil.create('div', 'legend-container');

    legendContainer.style.backgroundColor = '#333';
    legendContainer.style.padding = '10px';
    legendContainer.style.borderRadius = '5px';
    legendContainer.style.opacity = '0.95';
    legendContainer.style.display = 'flex';
    legendContainer.style.flexDirection = 'column';
    legendContainer.style.alignItems = 'center';
    legendContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.4)'; // Add drop shadow

    const averageDisplay = L.DomUtil.create('div', 'average-display', legendContainer);
    averageDisplay.style.color = '#d3d3d3';
    averageDisplay.style.marginBottom = '10px';
    averageDisplay.innerHTML = `<strong>Global Average: ${globalAverage ? globalAverage.toFixed(2) : 'N/A'}</strong>`;

    const toggleButton = L.DomUtil.create('button', 'toggle-button', legendContainer);
    toggleButton.style.backgroundColor = '#282c34';
    toggleButton.style.color = '#d3d3d3';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '3px';
    toggleButton.style.padding = '5px';
    toggleButton.style.marginBottom = '10px';

    toggleButton.innerHTML = isVisible ? 'Hide' : 'Show';
    toggleButton.className = 'toggle-button';

    const legendContent = L.DomUtil.create('div', 'legend-content', legendContainer);
    legendContent.style.display = isVisible ? 'block' : 'none';

    const legendTitle = L.DomUtil.create('div', 'legend-title', legendContent);
    legendTitle.innerHTML = '<strong>Legend</strong>';
    legendTitle.style.color = '#d3d3d3';
    legendTitle.style.marginBottom = '10px';

    if (colorMap.length) {
        const legendColorBarContainer = L.DomUtil.create('div', 'legend-color-bar-container', legendContent);
        legendColorBarContainer.style.display = 'flex';
        legendColorBarContainer.style.alignItems = 'center';

        const legendColorBar = L.DomUtil.create('div', 'legend-color-bar', legendColorBarContainer);
        legendColorBar.style.width = '20px';
        legendColorBar.style.height = '200px';
        legendColorBar.style.background = `linear-gradient(to bottom, ${colorMap.map(c => `rgba(${c.red},${c.green},${c.blue},${c.opacity / 255})`).join(", ")})`;
        legendColorBar.style.borderRadius = '5px';
        legendColorBar.style.marginRight = '10px';

        const legendLabels = L.DomUtil.create('div', 'legend-labels', legendColorBarContainer);
        legendLabels.style.display = 'flex';
        legendLabels.style.flexDirection = 'column';
        legendLabels.style.justifyContent = 'space-between';
        legendLabels.style.height = '200px';

        colorMap.forEach(entry => {
            const label = L.DomUtil.create('div', 'legend-label', legendLabels);
            label.innerHTML = `<span>${entry.value.toFixed(2)}</span>`;
            label.style.color = '#fff'; // Set label color to white
        });
    }

    toggleButton.onclick = (e) => {
        e.stopPropagation();
        isVisible = !isVisible;
        toggleButton.innerHTML = isVisible ? 'Hide' : 'Show';
        legendContent.style.display = isVisible ? 'block' : 'none';
    };

    return legendContainer;
};

export const LegendControl = ({ globalAverage, colorMap }) => {
    const map = useMap();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const legendContainer = createLegendContainer(isVisible, globalAverage, colorMap);
        const legendControl = L.control({ position: 'topright' });

        legendControl.onAdd = () => {
            return legendContainer;
        };

        legendControl.addTo(map);

        return () => {
            legendControl.remove();
        };
    }, [map, isVisible, globalAverage, colorMap]);

    return null;
};
