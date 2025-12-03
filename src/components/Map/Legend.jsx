import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import L from "leaflet";
import { useMap } from "react-leaflet";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

/**
 * Creates discrete legend content with individual color blocks and labels
 */
const createDiscreteLegendContent = (legendContent, colorMap) => {
  const legendColorBarContainer = L.DomUtil.create(
    "div",
    "legend-color-bar-container",
    legendContent
  );
  legendColorBarContainer.style.display = "flex";
  legendColorBarContainer.style.flexDirection = "column";
  legendColorBarContainer.style.gap = "2px";
  legendColorBarContainer.style.width = "100%";

  // Create individual color blocks for each stop (in reverse order so highest is at top)
  const sortedColorMap = [...colorMap].sort((a, b) => b.value - a.value);

  sortedColorMap.forEach((stop) => {
    const row = L.DomUtil.create("div", "legend-discrete-row", legendColorBarContainer);
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "8px";

    const colorBox = L.DomUtil.create("div", "legend-color-box", row);
    colorBox.style.width = "20px";
    colorBox.style.height = "16px";
    colorBox.style.backgroundColor = `rgba(${stop.red},${stop.green},${stop.blue},${(stop.opacity || 255) / 255})`;
    colorBox.style.borderRadius = "2px";
    colorBox.style.flexShrink = "0";

    const label = L.DomUtil.create("span", "legend-discrete-label", row);
    // Use the label from the color stop if available, otherwise show the value
    label.textContent = stop.label || `≤ ${stop.value}`;
    label.style.color = "#fff";
    label.style.fontSize = "11px";
    label.style.whiteSpace = "nowrap";
  });
};

/**
 * Creates linear gradient legend content with labels from color stops
 */
const createLinearLegendContent = (legendContent, colorMap) => {
  // Sort colorMap by value in reverse (high to low for top-to-bottom gradient)
  const sortedColorMap = [...colorMap].sort((a, b) => b.value - a.value);

  // Check if any color stops have custom labels (check for undefined/null, not falsy, since "0" is valid)
  const hasCustomLabels = sortedColorMap.some((stop) => stop.label !== undefined && stop.label !== null);

  // Get min/max for positioning calculations
  const values = colorMap.map((c) => c.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;
  const barHeight = 200;

  // Create a wrapper that positions color bar and labels side by side
  const legendColorBarContainer = L.DomUtil.create(
    "div",
    "legend-color-bar-container",
    legendContent
  );
  legendColorBarContainer.setAttribute("style", "display: flex; flex-direction: row; align-items: flex-start; width: 100%;");

  const legendColorBar = L.DomUtil.create(
    "div",
    "legend-color-bar",
    legendColorBarContainer
  );
  legendColorBar.style.width = "20px";
  legendColorBar.style.height = `${barHeight}px`;
  legendColorBar.style.flexShrink = "0";
  legendColorBar.style.background = `linear-gradient(to bottom, ${sortedColorMap
    .map((c) => `rgba(${c.red},${c.green},${c.blue},${(c.opacity || 255) / 255})`)
    .join(", ")})`;
  legendColorBar.style.borderRadius = "5px";
  legendColorBar.style.marginRight = "10px";

  const legendLabels = L.DomUtil.create(
    "div",
    "legend-labels",
    legendColorBarContainer
  );

  if (hasCustomLabels) {
    // Use absolute positioning to place labels at correct positions along the gradient
    legendLabels.style.position = "relative";
    legendLabels.style.height = `${barHeight}px`;
    legendLabels.style.minWidth = "40px";

    // Filter to only stops that have labels (non-empty string, and not null/undefined)
    const stopsWithLabels = sortedColorMap.filter((stop) =>
      stop.label !== undefined && stop.label !== null && stop.label !== ""
    );

    stopsWithLabels.forEach((stop, index) => {
      const label = L.DomUtil.create("div", "legend-label", legendLabels);
      label.textContent = stop.label;
      // Calculate pixel position: 0px at top (maxValue), 200px at bottom (minValue)
      const pixelsFromTop = range > 0 ? ((maxValue - stop.value) / range) * barHeight : 0;
      label.style.position = "absolute";
      label.style.left = "0";
      label.style.color = "#fff";
      label.style.fontSize = "11px";
      label.style.whiteSpace = "nowrap";

      // Adjust positioning for edge labels to keep them within bounds
      if (pixelsFromTop === 0) {
        // Top label - align to top
        label.style.top = "0";
      } else if (pixelsFromTop >= barHeight) {
        // Bottom label - align to bottom
        label.style.bottom = "0";
      } else {
        // Middle labels - center on position
        label.style.top = `${pixelsFromTop}px`;
        label.style.transform = "translateY(-50%)";
      }
    });
  } else {
    // No custom labels - generate 5 evenly-spaced labels
    legendLabels.style.display = "flex";
    legendLabels.style.flexDirection = "column";
    legendLabels.style.justifyContent = "space-between";
    legendLabels.style.height = `${barHeight}px`;

    const interval = range / 4;
    const labelValues = [
      maxValue,  // Top
      maxValue - interval,
      maxValue - 2 * interval,
      maxValue - 3 * interval,
      minValue,  // Bottom
    ];

    labelValues.forEach((value) => {
      const label = L.DomUtil.create("div", "legend-label", legendLabels);
      const formattedValue = Math.abs(value) < 10 ? value.toFixed(1) : Math.round(value);
      label.textContent = formattedValue;
      label.style.color = "#fff";
      label.style.fontSize = "11px";
    });
  }
};

const createLegendContainer = (
  isVisible,
  setIsVisible,
  globalAverage,
  colorMap,
  interpolationType,
  legendTitleText
) => {
  const isDiscrete = interpolationType === 'discrete';

  const legendContainer = L.DomUtil.create("div", "legend-container");
  legendContainer.style.position = "relative";
  legendContainer.style.backgroundColor = "#333";
  legendContainer.style.padding = isVisible ? "10px" : "5px";
  legendContainer.style.borderRadius = "5px";
  legendContainer.style.opacity = "0.95";
  legendContainer.style.display = "flex";
  legendContainer.style.flexDirection = "column";
  legendContainer.style.alignItems = "center";
  legendContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.4)";
  // Discrete legends may need more width for labels
  legendContainer.style.width = isVisible ? (isDiscrete ? "auto" : "120px") : "25px";
  legendContainer.style.minWidth = isVisible ? (isDiscrete ? "140px" : "120px") : "25px";
  legendContainer.style.maxWidth = isVisible ? "250px" : "25px";
  legendContainer.style.minHeight = isVisible ? "auto" : "25px";
  legendContainer.style.transition = "width 0.2s ease-in-out, padding 0.2s ease-in-out, min-height 0.2s ease-in-out";

  const toggleButton = L.DomUtil.create(
    "button",
    "toggle-button",
    legendContainer
  );
  toggleButton.style.position = "absolute";
  toggleButton.style.top = "5px";
  toggleButton.style.right = "5px";
  toggleButton.style.border = "none";
  toggleButton.style.borderRadius = "3px";
  toggleButton.style.cursor = "pointer";
  toggleButton.style.backgroundColor = "transparent";
  toggleButton.style.padding = "0px";
  toggleButton.style.width = "auto";
  toggleButton.style.height = "auto";

  const averageDisplay = L.DomUtil.create(
    "div",
    "average-display",
    legendContainer
  );
  averageDisplay.style.color = "#d3d3d3";
  averageDisplay.style.marginBottom = "10px";
  averageDisplay.style.textAlign = "left";
  averageDisplay.style.width = "100%";

  const legendContent = L.DomUtil.create(
    "div",
    "legend-content",
    legendContainer
  );
  legendContent.style.display = isVisible ? "block" : "none";
  legendContent.style.width = "100%";

  const legendTitle = L.DomUtil.create("div", "legend-title", legendContent);
  legendTitle.innerHTML = `<strong>${legendTitleText}</strong>`;
  legendTitle.style.color = "#d3d3d3";
  legendTitle.style.marginBottom = "10px";
  legendTitle.style.textAlign = "center";
  legendTitle.style.width = "100%";

  if (colorMap.length) {
    if (isDiscrete) {
      createDiscreteLegendContent(legendContent, colorMap);
    } else {
      createLinearLegendContent(legendContent, colorMap);
    }
  }

  toggleButton.onclick = (e) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };


  const root = createRoot(toggleButton);
  root.render(
    isVisible ?
    <ExpandMoreIcon
      sx={{
        fontSize: '1.2rem',
        color: '#d1a766',
        '&:hover': {
          color: '#ffffff'
        }
      }}
    /> :
    <ExpandLessIcon
      sx={{
        fontSize: '1.2rem',
        color: '#d1a766',
        '&:hover': {
          color: '#ffffff'
        }
      }}
    />
  );

  return legendContainer;
};

// Helper to format variable abbreviation with subscript as HTML
const formatAbbreviationHtml = (variable) => {
  if (!variable) return "Legend";
  const abbr = variable.subscript
    ? `${variable.abbreviation}<sub>${variable.subscript}</sub>`
    : variable.abbreviation;
  return `${abbr} [${variable.unit}]`;
};

export const LegendControl = ({
  globalAverage,
  colorMap,
  interpolationType = 'linear',
  selectedVariable,
}) => {
  const legendTitleText = selectedVariable
    ? formatAbbreviationHtml(selectedVariable)
    : "Legend";
  const map = useMap();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const legendContainer = createLegendContainer(
      isVisible,
      setIsVisible,
      globalAverage,
      colorMap,
      interpolationType,
      legendTitleText
    );
    const legendControl = L.control({ position: "topright" });

    legendControl.onAdd = () => {
      return legendContainer;
    };

    legendControl.addTo(map);

    return () => {
      legendControl.remove();
    };
  }, [isVisible, globalAverage, colorMap, interpolationType, legendTitleText]);

  return null;
};
