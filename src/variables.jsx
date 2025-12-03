export const cropItems = [
    { id: 'barley', name: 'Barley', enabled: false },
    { id: 'maize', name: 'Maize', enabled: false },
    { id: 'potato', name: 'Potato', enabled: false },
    { id: 'rice', name: 'Rice', enabled: false },
    { id: 'sorghum', name: 'Sorghum', enabled: false },
    { id: 'soy', name: 'Soy', enabled: false },
    { id: 'sugarcane', name: 'Sugar Cane', enabled: false },
    { id: 'wheat', name: 'Wheat', enabled: false },
];

export const globalWaterModelsItems = [
    { id: 'cwatm', name: 'CWatM', enabled: false },
    { id: 'h08', name: 'H08', enabled: false },
    { id: 'lpjml', name: 'LPJmL', enabled: false },
    { id: 'matsiro', name: 'MATSIRO', enabled: false },
    { id: 'pcr-globwb', name: 'PCR-GLOBWB', enabled: false },
    { id: 'watergap2', name: 'WaterGAP2', enabled: false },
];

export const climateModelsItems = [
    { id: 'gfdl-esm2m', name: 'GFDL-ESM2M', enabled: false },
    { id: 'hadgem2-es', name: 'HadGEM2-ES', enabled: false },
    { id: 'ipsl-cm5a-lr', name: 'IPSL-CM5A-LR', enabled: false },
    { id: 'miroc5', name: 'MIROC5', enabled: false },
];

export const scenariosItems = [
    { id: 'rcp26', name: 'RCP 2.6', enabled: false },
    { id: 'rcp60', name: 'RCP 6.0', enabled: false },
    { id: 'rcp85', name: 'RCP 8.5', enabled: false },
];


export const variablesItems = [
    { id: 'vwc', name: 'Total', abbreviation: 'VWC', subscript: null, unit: 'm³ ton⁻¹', enabled: false },
    { id: 'vwcb', name: 'Blue', abbreviation: 'VWC', subscript: 'b', unit: 'm³ ton⁻¹', enabled: false },
    { id: 'vwcg', name: 'Green', abbreviation: 'VWC', subscript: 'g', unit: 'm³ ton⁻¹', enabled: false },
    { id: 'vwcg_perc', name: 'Green', abbreviation: 'VWC', subscript: 'g', unit: '%', enabled: false },
    { id: 'vwcb_perc', name: 'Blue', abbreviation: 'VWC', subscript: 'b', unit: '%', enabled: false },
    { id: 'wf', name: 'Total', abbreviation: 'WF', subscript: null, unit: 'm³', enabled: false },
    { id: 'wfb', name: 'Blue', abbreviation: 'WF', subscript: 'b', unit: 'm³', enabled: false },
    { id: 'wfg', name: 'Green', abbreviation: 'WF', subscript: 'g', unit: 'm³', enabled: false },
    { id: 'etb', name: 'Blue', abbreviation: 'ET', subscript: 'b', unit: 'mm', enabled: false },
    { id: 'etg', name: 'Green', abbreviation: 'ET', subscript: 'g', unit: 'mm', enabled: false },
    { id: 'rb', name: 'Blue', abbreviation: 'R', subscript: 'b', unit: 'mm', enabled: false },
    { id: 'rg', name: 'Green', abbreviation: 'R', subscript: 'g', unit: 'mm', enabled: false },
    { id: 'wdb', name: 'Blue', abbreviation: 'WD', subscript: 'b', unit: 'years', enabled: false },
    { id: 'wdg', name: 'Green', abbreviation: 'WD', subscript: 'g', unit: 'years', enabled: false },
];

export const cropVariablesItems = [
    { id: 'mirca_area_irrigated', name: 'Irrigated Area', abbreviation: 'MircaAreaIrrigated', unit: 'ha', enabled: false },
    { id: 'mirca_area_total', name: 'Total Area', abbreviation: 'MircaAreaTotal', unit: 'ha', enabled: false },
    { id: 'mirca_rainfed', name: 'Rainfed Area', abbreviation: 'MircaRainfed', unit: 'ha', enabled: false },
    { id: 'yield', name: 'Yield', abbreviation: 'Yield', unit: 'ton ha⁻¹' },
    { id: 'production', name: 'Production', abbreviation: 'Production', unit: 'ton' },
];