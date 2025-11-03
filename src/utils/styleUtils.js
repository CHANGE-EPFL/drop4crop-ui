/**
 * Utility functions for handling style data across different contexts
 */

/**
 * Converts style data from various formats into a consistent StyleItem array
 * @param {*} styleData - Style data in various formats (Style records array, StyleItem array, etc.)
 * @returns {Array} Array of StyleItem objects with red, green, blue, opacity, label properties
 */
export const normalizeStyleData = (styleData) => {
    if (!styleData || styleData.length === 0) {
        return [];
    }

    let styleItems = [];

    // Handle Style records from CRUD (each has a 'style' property with JSON array)
    // This covers both the direct CRUD response and the nested structure from layer endpoint
    if (styleData.length > 0 && styleData[0]?.style && Array.isArray(styleData[0].style)) {
        // If the first element has a 'style' property that's an array, extract from all elements
        styleData.forEach(styleRecord => {
            if (styleRecord.style && Array.isArray(styleRecord.style)) {
                styleItems = styleItems.concat(styleRecord.style);
            }
        });
    }
    // Handle direct StyleItem array (from /map endpoint)
    else if (styleData.length > 0 && styleData[0]?.red !== undefined) {
        styleItems = styleData;
    }
    // Handle direct JSON array (sometimes the style might be a raw array)
    else if (Array.isArray(styleData) && styleData[0]?.red !== undefined) {
        styleItems = styleData;
    }

    // Sort by value for proper gradient display
    styleItems.sort((a, b) => (a.value || a.label || 0) - (b.value || b.label || 0));

    return styleItems;
};

/**
 * Creates a CSS gradient string from style data
 * @param {*} styleData - Style data in various formats
 * @returns {string} CSS gradient string
 */
export const createStyleGradient = (styleData) => {
    const styleItems = normalizeStyleData(styleData);

    if (styleItems.length === 0) {
        return 'none';
    }

    return `linear-gradient(to right, ${styleItems.map(
        color => `rgba(${color.red},${color.green},${color.blue},${(color.opacity || 255) / 255})`
    ).join(", ")})`;
};

/**
 * Gets the minimum and maximum values from style data
 * @param {*} styleData - Style data in various formats
 * @returns {Object} Object with min and max values
 */
export const getStyleRange = (styleData) => {
    const styleItems = normalizeStyleData(styleData);

    if (styleItems.length === 0) {
        return { min: 0, max: 0 };
    }

    const values = styleItems.map(item => item.value || item.label || 0);
    return {
        min: Math.min(...values),
        max: Math.max(...values)
    };
};

/**
 * Gets the number of steps in the style
 * @param {*} styleData - Style data in various formats
 * @returns {number} Number of style steps
 */
export const getStyleSteps = (styleData) => {
    return normalizeStyleData(styleData).length;
};