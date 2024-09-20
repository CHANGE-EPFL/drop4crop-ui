import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import MinimizeIcon from '@mui/icons-material/Minimize';

const createLegendContainer = (
    isVisible,
    setIsVisible,
    globalAverage,
    colorMap,
    legendTitleText,
) => {
    const legendContainer = L.DomUtil.create('div', 'legend-container');
    legendContainer.style.position = 'relative';
    legendContainer.style.backgroundColor = '#333';
    legendContainer.style.padding = '10px';
    legendContainer.style.borderRadius = '5px';
    legendContainer.style.opacity = '0.95';
    legendContainer.style.display = 'flex';
    legendContainer.style.flexDirection = 'column';
    legendContainer.style.alignItems = 'center';
    legendContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.4)';
    legendContainer.style.width = '120px';

    const toggleButton = L.DomUtil.create('button', 'toggle-button', legendContainer);
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '5px';
    toggleButton.style.right = '5px';
    toggleButton.style.border = '#d3d3d3';
    toggleButton.style.borderRadius = '3px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.backgroundColor = '#5d513d';
    toggleButton.style.padding = '0px 5px';
    toggleButton.style.paddingBottom = '20px';
    toggleButton.style.width = '30px';
    toggleButton.style.height = '20px';

    const averageDisplay = L.DomUtil.create('div', 'average-display', legendContainer);
    averageDisplay.style.color = '#d3d3d3';
    averageDisplay.style.marginBottom = '10px';
    averageDisplay.style.textAlign = 'left';
    averageDisplay.style.width = '100%';
    averageDisplay.innerHTML = `<strong>Global: ${globalAverage ? globalAverage.toFixed(2) : 'N/A'}</strong>`;

    const legendContent = L.DomUtil.create('div', 'legend-content', legendContainer);
    legendContent.style.display = isVisible ? 'block' : 'none';
    legendContent.style.width = '100%';

    const legendTitle = L.DomUtil.create('div', 'legend-title', legendContent);
    legendTitle.innerHTML = `<strong>${legendTitleText}</strong>`;
    legendTitle.style.color = '#d3d3d3';
    legendTitle.style.marginBottom = '10px';
    legendTitle.style.textAlign = 'center';
    legendTitle.style.width = '100%';

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

        // Extracting the min and max values from the colorMap, ensuring they are floored and ceiled
        const rawMinValue = Math.min(...colorMap.map(c => c.label));
        const rawMaxValue = Math.max(...colorMap.map(c => c.label));
        const minValue = Math.floor(rawMinValue);
        const maxValue = Math.ceil(rawMaxValue);

        // Calculate three equal intervals between min and max
        const interval = (maxValue - minValue) / 4;
        const labelValues = [
            minValue,
            Math.round(minValue + interval),
            Math.round(minValue + 2 * interval),
            Math.round(minValue + 3 * interval),
            maxValue,
        ];

        // Render only the 5 labels
        labelValues.forEach((value) => {
            const label = L.DomUtil.create('div', 'legend-label', legendLabels);
            label.innerHTML = `<span>${value}</span>`;
            label.style.color = '#fff';
        });
    }

    toggleButton.onclick = (e) => {
        e.stopPropagation();
        setIsVisible(!isVisible);
    };

    ReactDOM.render(<MinimizeIcon fontSize="small" />, toggleButton);

    return legendContainer;
};

export const LegendControl = ({
    globalAverage,
    colorMap,
    selectedVariable,
}) => {

    const legendTitleText = (
        selectedVariable ? `${selectedVariable.abbreviation} [${selectedVariable.unit}]` : 'Legend'
    );
    const map = useMap();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const legendContainer = createLegendContainer(
            isVisible,
            setIsVisible,
            globalAverage,
            colorMap,
            legendTitleText,
        );
        const legendControl = L.control({ position: 'topright' });

        legendControl.onAdd = () => {
            return legendContainer;
        };

        legendControl.addTo(map);

        return () => {
            legendControl.remove();
        };
    }, [isVisible, globalAverage, colorMap, legendTitleText]);

    return null;
};
