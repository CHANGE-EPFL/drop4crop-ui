import {
    List,
    TextField,
    BooleanField,
    BulkDeleteButton,
    Datagrid,
    BulkUpdateButton,
    useGetList,
    Loading,
    Pagination,
    TopToolbar,
    CreateButton,
    ExportButton,
    useUpdateMany,
    useListContext,
    useNotify,
    useRefresh,
    useUnselectAll,
    useRecordContext,
    FilterButton,
    SearchInput,
    SaveButton,
    FunctionField,
    TextInput,
    BooleanInput,
    SelectInput,
    useDataProvider,
    Button,
    useListFilterContext,
    ReferenceInput,
    AutocompleteInput,
} from "react-admin";
import { useState, createContext, useContext, useEffect } from 'react';
import { createStyleGradient } from '../../utils/styleUtils';

// Context to share preloaded styles data across components
const StylesContext = createContext<{ styles: any[], stylesMap: Map<string, any> }>({ styles: [], stylesMap: new Map() });

import { FilterList, FilterListItem } from 'react-admin';
import { Card, CardContent, Typography, Box, Chip, Stack, Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Button as MuiButton } from '@mui/material';
import CategoryIcon from '@mui/icons-material/LocalOffer';
import {
    globalWaterModelsItems,
    climateModelsItems,
    cropItems,
    scenariosItems,
    variablesItems,
    yearItems,
    cropTypeItems
} from '../options';
import { Fragment } from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { UppyUploader } from "./uploader/Uppy";
import {
    faWater, faCloudSun, faCogs, faLayerGroup, faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GrassIcon from '@mui/icons-material/Grass';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import MapIcon from '@mui/icons-material/Map';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import WarningIcon from '@mui/icons-material/Warning';
import CalculateIcon from '@mui/icons-material/Calculate';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Format file size in human readable format
const formatFileSize = (bytes: number | null | undefined) => {
    if (bytes == null) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

// Stats status indicator component
const StatsStatusIndicator = ({ statsStatus }: { statsStatus: any }) => {
    if (!statsStatus) {
        return (
            <Tooltip title="Statistics not yet calculated">
                <HelpOutlineIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            </Tooltip>
        );
    }

    const status = statsStatus.status;
    const lastRun = statsStatus.last_run ? new Date(statsStatus.last_run).toLocaleString() : 'Unknown';
    const error = statsStatus.error;

    if (status === 'success') {
        return (
            <Tooltip title={`Last calculated: ${lastRun}`}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
            </Tooltip>
        );
    } else if (status === 'error') {
        return (
            <Tooltip title={`Error: ${error}\nLast attempt: ${lastRun}`}>
                <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
            </Tooltip>
        );
    }

    return (
        <Tooltip title="Unknown status">
            <HelpOutlineIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
        </Tooltip>
    );
};

// Stats status field with click-to-filter icon
const StatsStatusFilterableField = ({ record }) => {
    const { filterValues, setFilters } = useListContext();

    // Determine the filter value based on stats_status
    const getFilterValue = () => {
        if (!record.stats_status) return '__null__';
        return record.stats_status.status || '__null__';
    };

    const handleFilterClick = (e) => {
        e.stopPropagation();
        setFilters({ ...filterValues, stats_status_value: getFilterValue() }, {});
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover .filter-icon': {
                    opacity: 1,
                }
            }}
        >
            <StatsStatusIndicator statsStatus={record.stats_status} />
            <IconButton
                size="small"
                onClick={handleFilterClick}
                className="filter-icon"
                sx={{
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    p: 0.25,
                    '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'primary.main',
                    }
                }}
                title={`Filter by ${getFilterValue() === '__null__' ? 'not calculated' : getFilterValue()} status`}
            >
                <FilterListIcon sx={{ fontSize: 14 }} />
            </IconButton>
        </Box>
    );
};

// Style filter input component
const StyleFilterInput = (props) => {
    const { data: styles, isLoading } = useGetList('styles', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'name', order: 'ASC' }
    });

    const choices = [
        { id: '__null__', name: 'No style' },
        ...(styles || []).map(style => ({ id: style.id, name: style.name }))
    ];

    return (
        <SelectInput
            choices={choices}
            isLoading={isLoading}
            emptyValue=""
            resettable
            {...props}
        />
    );
};

// Style field component with click-to-filter icon
const StyleFilterableField = ({ record }) => {
    const { filterValues, setFilters } = useListContext();

    const handleFilterClick = (e) => {
        e.stopPropagation();
        // Use __null__ marker for null style_id
        setFilters({ ...filterValues, style_id: record.style_id || '__null__' }, {});
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover .filter-icon': {
                    opacity: 1,
                }
            }}
        >
            <StyleDisplay />
            <IconButton
                size="small"
                onClick={handleFilterClick}
                className="filter-icon"
                sx={{
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    p: 0.25,
                    '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'primary.main',
                    }
                }}
                title={`Filter by ${record.style_id ? 'this style' : 'no style'}`}
            >
                <FilterListIcon sx={{ fontSize: 14 }} />
            </IconButton>
        </Box>
    );
};

// Crop Specific field component with click-to-filter icon
const CropSpecificFilterableField = ({ record }) => {
    const { filterValues, setFilters } = useListContext();

    const handleFilterClick = (e) => {
        e.stopPropagation();
        setFilters({ ...filterValues, is_crop_specific: record.is_crop_specific }, {});
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                justifyContent: 'center',
                '&:hover .filter-icon': {
                    opacity: 1,
                }
            }}
        >
            <BooleanField source="is_crop_specific" looseValue />
            <IconButton
                size="small"
                onClick={handleFilterClick}
                className="filter-icon"
                sx={{
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    p: 0.25,
                    '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'primary.main',
                    }
                }}
                title={`Filter by ${record.is_crop_specific ? 'crop-specific' : 'climate'} layers`}
            >
                <FilterListIcon sx={{ fontSize: 14 }} />
            </IconButton>
        </Box>
    );
};

// Filterable field component with click-to-filter icon
const FilterableField = ({ source, value, transform }) => {
    const { filterValues, setFilters } = useListContext();

    const handleFilterClick = (e) => {
        e.stopPropagation();
        setFilters({ ...filterValues, [source]: value }, {});
    };

    if (!value && value !== 0) {
        return <Typography variant="body2">-</Typography>;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover .filter-icon': {
                    opacity: 1,
                }
            }}
        >
            <Typography variant="body2" sx={{ textTransform: transform || 'none' }}>
                {value}
            </Typography>
            <IconButton
                size="small"
                onClick={handleFilterClick}
                className="filter-icon"
                sx={{
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    p: 0.25,
                    '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'primary.main',
                    }
                }}
                title={`Filter by ${value}`}
            >
                <FilterListIcon sx={{ fontSize: 14 }} />
            </IconButton>
        </Box>
    );
};

// Helper to render style preview (supports discrete and linear)
const StylePreviewBox = ({ style, height = 8, width = 60 }) => {
    if (!style?.style || style.style.length === 0) {
        return (
            <Box
                sx={{
                    height: `${height}px`,
                    width: `${width}px`,
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                }}
            />
        );
    }

    const isDiscrete = style.interpolation_type === 'discrete';

    if (isDiscrete) {
        const sortedStops = [...style.style].sort((a, b) => a.value - b.value);
        return (
            <Box
                sx={{
                    display: 'flex',
                    height: `${height}px`,
                    width: `${width}px`,
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid #ddd',
                }}
            >
                {sortedStops.map((stop, index) => (
                    <Box
                        key={index}
                        sx={{
                            flex: 1,
                            backgroundColor: `rgba(${stop.red},${stop.green},${stop.blue},${(stop.opacity || 255) / 255})`,
                        }}
                    />
                ))}
            </Box>
        );
    }

    // Linear gradient
    const gradient = createStyleGradient(style.style);
    return (
        <Box
            sx={{
                height: `${height}px`,
                width: `${width}px`,
                background: gradient,
                borderRadius: '4px',
                border: '1px solid #ddd',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
        />
    );
};

// Helper to check if layer values fall outside style range
const getStyleRangeWarning = (layer: any, style: any) => {
    if (!style?.style || style.style.length === 0) return null;
    if (layer.min_value === null && layer.max_value === null) return null;

    const styleValues = style.style.map((s: any) => s.value);
    const styleMin = Math.min(...styleValues);
    const styleMax = Math.max(...styleValues);

    const warnings: string[] = [];

    if (layer.min_value !== null && layer.min_value < styleMin) {
        warnings.push(`Layer min (${layer.min_value.toFixed(2)}) < style min (${styleMin})`);
    }
    if (layer.max_value !== null && layer.max_value > styleMax) {
        warnings.push(`Layer max (${layer.max_value.toFixed(2)}) > style max (${styleMax})`);
    }

    if (warnings.length === 0) return null;

    return {
        message: warnings.join('; '),
        hasMinWarning: layer.min_value !== null && layer.min_value < styleMin,
        hasMaxWarning: layer.max_value !== null && layer.max_value > styleMax,
    };
};

// Style name and color bar component - uses context to avoid per-row queries
const StyleDisplay = () => {
    const record = useRecordContext();
    const { stylesMap } = useContext(StylesContext);

    if (!record?.style_id) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Tooltip title="This layer will be styled in grayscale until a style is chosen">
                    <WarningIcon sx={{ fontSize: 14, color: 'error.main' }} />
                </Tooltip>
                <Box
                    sx={{
                        height: '6px',
                        width: '40px',
                        background: 'linear-gradient(to right, #000, #fff)',
                        borderRadius: '3px',
                        border: '1px solid #ddd',
                    }}
                />
            </Box>
        );
    }

    // Look up the style from the preloaded context
    const style = stylesMap.get(record.style_id);
    const rangeWarning = getStyleRangeWarning(record, style);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {rangeWarning && (
                <Tooltip title={`Values outside style range: ${rangeWarning.message}. These values will be clamped to the nearest color.`}>
                    <WarningIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                </Tooltip>
            )}
            <StylePreviewBox style={style} height={6} width={40} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                {style?.name || ''}
            </Typography>
        </Box>
    );
};

export const ColorBar = () => {
    const record = useRecordContext();
    if (!record || !record.style || record.style.length == 0) {
        return (
            <Box
                sx={{
                    height: '8px',
                    width: '60px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                }}
            />
        );
    }

    const gradient = createStyleGradient(record.style);

    return (
        <Box
            sx={{
                height: '8px',
                width: '60px',
                background: gradient,
                borderRadius: '4px',
                border: '1px solid #ddd',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
        />
    );
};


// ColorBar wrapper for dropdown use
const DropdownColorBar = ({ styleData, ...props }) => {
    let processedStyleData = [];

    if (!styleData) {
        // Empty data, show grey bar
        return (
            <Box
                sx={{
                    height: '8px',
                    width: '60px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                }}
                {...props}
            />
        );
    }

    // If styleData is the complete style object with nested style array
    if (styleData.style && Array.isArray(styleData.style)) {
        processedStyleData = styleData.style;
    }
    // If styleData is an array of StyleItem objects
    else if (Array.isArray(styleData) && styleData.length > 0 && styleData[0].red !== undefined) {
        processedStyleData = styleData;
    }
    // If styleData is an array of style records (CRUD response)
    else if (Array.isArray(styleData)) {
        styleData.forEach(styleRecord => {
            if (styleRecord.style && Array.isArray(styleRecord.style)) {
                processedStyleData = processedStyleData.concat(styleRecord.style);
            }
        });
    }

    // If no valid data, show grey bar
    if (processedStyleData.length === 0) {
        return (
            <Box
                sx={{
                    height: '8px',
                    width: '60px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                }}
                {...props}
            />
        );
    }

    // Create gradient
    const gradient = createStyleGradient(processedStyleData);

    return (
        <Box
            sx={{
                height: '8px',
                width: '60px',
                backgroundImage: gradient,
                borderRadius: '4px',
                border: '1px solid #ddd',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                backgroundColor: '#e0e0e0', // Fallback color
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat'
            }}
            {...props}
        />
    );
};

// Custom Enable/Disable buttons that use individual updates
const BulkToggleEnabledButton = ({ enabled }: { enabled: boolean }) => {
    const dataProvider = useDataProvider();
    const { selectedIds } = useListContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll('layers');
    const [isUpdating, setIsUpdating] = useState(false);

    if (selectedIds.length === 0) return null;

    const handleClick = async () => {
        setIsUpdating(true);
        const action = enabled ? 'Enabled' : 'Disabled';
        try {
            const updatePromises = selectedIds.map(layerId =>
                dataProvider.update('layers', {
                    id: layerId,
                    data: { enabled },
                    previousData: { id: layerId }
                })
            );
            await Promise.all(updatePromises);
            notify(`${action} ${selectedIds.length} layer(s)`, { type: 'success' });
            refresh();
            unselectAll();
        } catch (error) {
            console.error(`Error ${action.toLowerCase()} layers:`, error);
            notify(`Error ${action.toLowerCase()} layers`, { type: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Button
            size="small"
            label={enabled ? "Enable" : "Disable"}
            onClick={handleClick}
            disabled={isUpdating}
        />
    );
};

const BulkEnableButton = () => <BulkToggleEnabledButton enabled={true} />;
const BulkDisableButton = () => <BulkToggleEnabledButton enabled={false} />;

const StyleSelectMenu = () => {
    const { data, loading } = useGetList('styles');
    const dataProvider = useDataProvider();
    const { selectedIds } = useListContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll('layers');
    const [selectedStyle, setSelectedStyle] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    if (loading) return <Loading />;
    if (!data || selectedIds.length === 0) return null;

    const handleChange = async (event) => {
        const newStyleId = event.target.value;
        setSelectedStyle(newStyleId);
        setIsUpdating(true);

        try {
            // Update each layer individually
            const updatePromises = selectedIds.map(layerId =>
                dataProvider.update('layers', {
                    id: layerId,
                    data: { style_id: newStyleId === 'remove' ? null : newStyleId },
                    previousData: { id: layerId }
                })
            );

            await Promise.all(updatePromises);

            if (newStyleId === 'remove') {
                notify(`Removed style from ${selectedIds.length} layer(s)`, { type: 'success' });
            } else {
                const styleName = data.find(style => style.id === newStyleId)?.name || newStyleId;
                notify(`Applied style "${styleName}" to ${selectedIds.length} layer(s)`, { type: 'success' });
            }
            refresh();
            unselectAll();
            setSelectedStyle('');
        } catch (error) {
            console.error('Error updating layer styles:', error);
            notify('Error updating layer style', { type: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Select
            size="small"
            value={selectedStyle}
            onChange={handleChange}
            displayEmpty
            disabled={isUpdating}
            sx={{
                minWidth: 150
            }}
        >
            <MenuItem disabled value="">
                <em>Apply style</em>
            </MenuItem>
            <MenuItem value="remove">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DeleteIcon sx={{ fontSize: '1rem', color: 'error.main' }} />
                    <Typography variant="body2" sx={{ color: 'error.main' }}>
                        Remove Style
                    </Typography>
                </Box>
            </MenuItem>
            {data.map(style => (
                <MenuItem key={style.id} value={style.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2">
                            {style.name}
                        </Typography>
                        <StylePreviewBox style={style} />
                    </Box>
                </MenuItem>
            ))}
        </Select>
    );
};


const BulkActionButtons = () => {
    const { selectedIds } = useListContext();

    if (selectedIds.length === 0) return null;

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Divider orientation="vertical" flexItem />
            <Typography variant="body2" color="text.secondary">
                {selectedIds.length} selected
            </Typography>
            <Divider orientation="vertical" flexItem />
            <BulkEnableButton />
            <BulkDisableButton />
            <StyleSelectMenu />
            <BulkDeleteButton
                mutationMode="pessimistic"
                confirmColor="error"
                confirmContent={`Are you sure you want to delete ${selectedIds.length} selected layers and their associated S3 files? This action cannot be undone.`}
                confirmTitle="Confirm Bulk Delete"
                label="Delete"
                icon={<DeleteIcon />}
            />
        </Stack>
    );
};


// Bulk recalculate stats button - works on selected layers (single request)
const BulkRecalculateStatsButton = () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll('layers');
    const { selectedIds } = useListContext();
    const [isRecalculating, setIsRecalculating] = useState(false);

    const handleRecalculate = async () => {
        if (selectedIds.length === 0) return;

        setIsRecalculating(true);

        try {
            // Single request with all IDs
            const result = await dataProvider.recalculateStatsByIds(selectedIds);
            const { success_count, error_count } = result.data;

            if (success_count > 0) {
                notify(`Recalculated stats for ${success_count} layer(s)${error_count > 0 ? `, ${error_count} failed` : ''}`, {
                    type: error_count > 0 ? 'warning' : 'success'
                });
            } else {
                notify(`Failed to recalculate stats for all ${error_count} layer(s)`, { type: 'error' });
            }
            refresh();
            unselectAll();
        } catch (error: any) {
            notify(`Failed to recalculate statistics: ${error.message || error}`, { type: 'error' });
        } finally {
            setIsRecalculating(false);
        }
    };

    if (selectedIds.length === 0) return null;

    return (
        <Button
            size="small"
            label={isRecalculating ? 'Recalculating...' : 'Recalc Stats'}
            onClick={handleRecalculate}
            disabled={isRecalculating}
        />
    );
};

// Job status interface for distributed queue
interface RecalculateJobStatus {
    is_running: boolean;
    started_at: string | null;
    total_layers: number;
    todo_count: number;
    processing_count: number;
    processed_count: number;
    success_count: number;
    error_count: number;
    progress_percent: number;
    elapsed_seconds: number | null;
    recent_errors: string[];
    completed_at: string | null;
    started_by: string | null;
    active_workers: number;
    has_stale_items: boolean;
    stale_count: number;
}

// Recalculate ALL layers button with confirmation dialog and progress tracking
const RecalculateAllButton = () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [jobStatus, setJobStatus] = useState<RecalculateJobStatus | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<string>('all');

    // Poll for job status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const result = await dataProvider.getRecalculateJobStatus();
                setJobStatus(result.data);
            } catch (error) {
                // Silently fail - status endpoint may not be available
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 2000); // Poll every 2 seconds

        return () => clearInterval(interval);
    }, [dataProvider]);

    const handleStartRecalculation = async (force: boolean = false) => {
        setConfirmOpen(false);

        try {
            const params: any = { force };

            // Apply filter based on selection
            if (selectedFilter === 'error') {
                params.stats_status_value = 'error';
            } else if (selectedFilter === 'null') {
                params.stats_status_value = 'null';
            } else if (selectedFilter === 'pending') {
                params.stats_status_value = 'pending';
            }
            // 'all' means no filter

            const result = await dataProvider.recalculateAllLayerStats(params);

            if (result.data.started) {
                notify(`Background job started for ${result.data.total_layers} layers`, { type: 'success' });
            } else {
                notify(result.data.message, { type: 'info' });
            }
        } catch (error: any) {
            // Check if it's a conflict error (job already running)
            if (error.status === 409) {
                notify('A job is already running. Use "Force Restart" to cancel and start a new job.', { type: 'warning' });
            } else {
                notify(`Failed to start recalculation: ${error.message || error}`, { type: 'error' });
            }
        }
    };

    const handleCancelJob = async () => {
        try {
            await dataProvider.cancelRecalculateJob();
            notify('Job cancellation requested. Job will stop after current layer.', { type: 'info' });
            refresh();
        } catch (error: any) {
            notify(`Failed to cancel job: ${error.message || error}`, { type: 'error' });
        }
    };

    const formatElapsed = (seconds: number | null) => {
        if (seconds === null) return '';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const isRunning = jobStatus?.is_running || false;
    const hasStaleItems = jobStatus?.has_stale_items || false;

    return (
        <>
            <Button
                size="small"
                label={hasStaleItems ? 'Stale Items!' : isRunning ? 'Job Running...' : 'Recalc All'}
                onClick={() => setConfirmOpen(true)}
                color={hasStaleItems ? 'error' : isRunning ? 'primary' : 'warning'}
            />
            {isRunning && jobStatus && (
                <Tooltip title={hasStaleItems
                    ? `WARNING: ${jobStatus.stale_count} stale items - workers may have crashed`
                    : `${jobStatus.active_workers} workers | ${jobStatus.success_count} success, ${jobStatus.error_count} errors`
                }>
                    <Chip
                        size="small"
                        label={`${jobStatus.processed_count}/${jobStatus.total_layers} (${jobStatus.progress_percent.toFixed(0)}%)`}
                        color={hasStaleItems ? 'error' : jobStatus.error_count > 0 ? 'warning' : 'primary'}
                        variant="outlined"
                        sx={{ ml: 1 }}
                    />
                </Tooltip>
            )}
            {!isRunning && jobStatus?.completed_at && (
                <Tooltip title={`Completed: ${jobStatus.success_count} success, ${jobStatus.error_count} errors`}>
                    <Chip
                        size="small"
                        icon={<CheckCircleIcon sx={{ fontSize: '0.9rem !important' }} />}
                        label="Done"
                        color="success"
                        variant="outlined"
                        sx={{ ml: 1 }}
                    />
                </Tooltip>
            )}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {hasStaleItems ? 'Job Has Stale Items' : isRunning ? 'Distributed Recalculation Running' : 'Start Bulk Recalculation'}
                </DialogTitle>
                <DialogContent>
                    {isRunning && jobStatus ? (
                        <Box>
                            {hasStaleItems && (
                                <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                                    <Typography variant="body2" color="error.contrastText" fontWeight="bold">
                                        Warning: {jobStatus.stale_count} stale item(s) detected!
                                    </Typography>
                                    <Typography variant="body2" color="error.contrastText">
                                        Some items have been processing for over 60 seconds.
                                        They will be automatically recovered and retried.
                                    </Typography>
                                </Box>
                            )}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">Progress</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                    <Box sx={{ flexGrow: 1, bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                                        <Box
                                            sx={{
                                                width: `${jobStatus.progress_percent}%`,
                                                bgcolor: jobStatus.error_count > 0 ? 'warning.main' : 'primary.main',
                                                borderRadius: 1,
                                                height: '100%',
                                                transition: 'width 0.3s ease'
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body2" fontWeight="bold">
                                        {jobStatus.progress_percent.toFixed(1)}%
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Todo</Typography>
                                    <Typography variant="h6">{jobStatus.todo_count}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Processing</Typography>
                                    <Typography variant="h6" color="info.main">{jobStatus.processing_count}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Completed</Typography>
                                    <Typography variant="h6">{jobStatus.processed_count}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Success</Typography>
                                    <Typography variant="h6" color="success.main">{jobStatus.success_count}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Errors</Typography>
                                    <Typography variant="h6" color="error.main">{jobStatus.error_count}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Workers</Typography>
                                    <Typography variant="h6" color="primary.main">{jobStatus.active_workers}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Elapsed</Typography>
                                    <Typography variant="h6">{formatElapsed(jobStatus.elapsed_seconds)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Total</Typography>
                                    <Typography variant="h6">{jobStatus.total_layers}</Typography>
                                </Box>
                            </Box>
                            {jobStatus.recent_errors.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>Recent Errors</Typography>
                                    <Box sx={{ maxHeight: 150, overflow: 'auto', bgcolor: 'grey.100', p: 1, borderRadius: 1, fontSize: '0.75rem' }}>
                                        {jobStatus.recent_errors.map((err, i) => (
                                            <Typography key={i} variant="caption" display="block" color="error.main" sx={{ mb: 0.5 }}>
                                                {err}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Box>
                            <Typography gutterBottom>
                                Select which layers to recalculate:
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 2 }}>
                                <MuiButton
                                    variant={selectedFilter === 'all' ? 'contained' : 'outlined'}
                                    onClick={() => setSelectedFilter('all')}
                                    size="small"
                                    fullWidth
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    All Layers (may take a long time)
                                </MuiButton>
                                <MuiButton
                                    variant={selectedFilter === 'error' ? 'contained' : 'outlined'}
                                    onClick={() => setSelectedFilter('error')}
                                    size="small"
                                    color="error"
                                    fullWidth
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    Only Layers with Errors
                                </MuiButton>
                                <MuiButton
                                    variant={selectedFilter === 'null' ? 'contained' : 'outlined'}
                                    onClick={() => setSelectedFilter('null')}
                                    size="small"
                                    fullWidth
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    Only Layers Never Calculated
                                </MuiButton>
                                <MuiButton
                                    variant={selectedFilter === 'pending' ? 'contained' : 'outlined'}
                                    onClick={() => setSelectedFilter('pending')}
                                    size="small"
                                    fullWidth
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    Only Pending Layers
                                </MuiButton>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Layers are queued and processed by all available API workers in parallel.
                                You can close this dialog and monitor progress from the button.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setConfirmOpen(false)}>
                        {isRunning ? 'Close' : 'Cancel'}
                    </MuiButton>
                    {isRunning ? (
                        <>
                            <MuiButton onClick={handleCancelJob} color="error" variant="contained">
                                {hasStaleItems ? 'Clear Stale Job' : 'Stop Job'}
                            </MuiButton>
                            <MuiButton onClick={() => handleStartRecalculation(true)} color="warning" variant="outlined">
                                Restart with New Filter
                            </MuiButton>
                        </>
                    ) : (
                        <MuiButton onClick={() => handleStartRecalculation(false)} color="warning" variant="contained">
                            Start Recalculation
                        </MuiButton>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

const ListActions = ({ setUploadDialogOpen }) => {
    const { selectedIds, filterValues, setFilters } = useListContext();
    const hasFilters = Object.keys(filterValues).filter(key => key !== 'q').length > 0;

    const handleClearFilters = () => {
        // Keep the search query (q) but clear all other filters
        setFilters({ q: filterValues.q || '' }, {});
    };

    return (
        <TopToolbar sx={{ justifyContent: 'space-between', alignItems: 'center', minHeight: 48 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FilterButton />
                {hasFilters && (
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={handleClearFilters}
                        sx={{ textTransform: 'none' }}
                    >
                        Clear Filters
                    </Button>
                )}
                {selectedIds.length > 0 && (
                    <>
                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                        <Chip
                            label={`${selectedIds.length} selected`}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                        <BulkEnableButton />
                        <BulkDisableButton />
                        <BulkRecalculateStatsButton />
                        <StyleSelectMenu />
                        <BulkDeleteButton
                            mutationMode="pessimistic"
                            confirmColor="error"
                            confirmContent={`Are you sure you want to delete ${selectedIds.length} selected layers and their associated S3 files? This action cannot be undone.`}
                            confirmTitle="Confirm Bulk Delete"
                            label="Delete"
                            icon={<DeleteIcon />}
                            sx={{ textTransform: 'none' }}
                        />
                    </>
                )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RecalculateAllButton />
                <IconButton
                    color="primary"
                    onClick={() => setUploadDialogOpen(true)}
                    sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        borderRadius: 1,
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                        }
                    }}
                >
                    <CloudUploadIcon />
                </IconButton>
            </Box>
        </TopToolbar>
    );
};

// Upload Dialog with UppyUploader
const UploadDialog = ({ open, onClose }) => {
    const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0, isUploading: false });

    const isComplete = uploadProgress.completed === uploadProgress.total && uploadProgress.total > 0;
    const isUploading = uploadProgress.isUploading && uploadProgress.total > 0;

    return (
        <Dialog open={open} maxWidth="lg" fullWidth onClose={onClose}>
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}>
                {isComplete ? (
                    <CheckCircleIcon color="success" />
                ) : isUploading ? (
                    <CloudUploadIcon color="primary" />
                ) : (
                    <CloudUploadIcon />
                )}
                <Typography variant="h6">
                    Upload New Layer
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ pb: 3 }}>
                <UppyUploader
                    onUploadProgress={setUploadProgress}
                    actionButton={
                        <Box sx={{ textAlign: 'center', my: 2 }}>
                            <Button
                                onClick={onClose}
                                variant="outlined"
                                color="inherit"
                                size="small"
                                sx={{
                                    width: 280,
                                    height: 48,
                                    py: 1,
                                    px: 2,
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    bgcolor: isComplete ? '#e8f5e8' : isUploading ? '#e3f2fd' : '#f5f5f5',
                                    border: isComplete ? '2px solid #4caf50' : isUploading ? '1px solid #2196f3' : '1px solid #ccc',
                                    '&:hover': {
                                        bgcolor: isComplete ? 'success.main' : isUploading ? 'primary.main' : 'grey.200',
                                        color: 'white',
                                        transform: 'scale(1.02)'
                                    },
                                    transition: 'all 0.2s ease-in-out'
                                }}
                            >
                                {isUploading ? (
                                    `📤 Uploading ${uploadProgress.completed} of ${uploadProgress.total} files...`
                                ) : uploadProgress.total > 0 ? (
                                    `✅ Uploaded ${uploadProgress.completed} of ${uploadProgress.total} files`
                                ) : (
                                    'Close'
                                )}
                            </Button>
                        </Box>
                    }
                    isComplete={isComplete}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                />
            </DialogContent>
        </Dialog>
    );
};

export const LayerList = () => {
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    // Preload all styles once for the entire list - this data is shared via context
    // and refreshes with the list, ensuring style changes are immediately visible
    const { data: stylesData, isLoading: stylesLoading } = useGetList('styles', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'name', order: 'ASC' }
    });

    // Create a Map for O(1) lookups by style ID
    const stylesMap = new Map((stylesData || []).map(style => [style.id, style]));
    const stylesContextValue = { styles: stylesData || [], stylesMap };

    const PostPagination = props => (
        <Pagination
            rowsPerPageOptions={[10, 25, 50, 100, 250, 500, 1000]}
            {...props}
        />
    );

    return (
        <StylesContext.Provider value={stylesContextValue}>
            <List
                queryOptions={{ refetchInterval: 5000 }}
                storeKey={false}
                perPage={25}
                pagination={<PostPagination />}
                actions={<ListActions setUploadDialogOpen={setUploadDialogOpen} />}
                sort={{ field: 'uploaded_at', order: 'DESC' }}
                empty={false}
                filters={[
                    <SearchInput source="q" alwaysOn />,
                    <BooleanInput source="enabled" label="Enabled" />,
                    <BooleanInput source="is_crop_specific" label="Crop Specific" />,
                    <SelectInput source="crop" label="Crop" choices={cropItems} />,
                    <SelectInput source="water_model" label="Water Model" choices={globalWaterModelsItems} />,
                    <SelectInput source="climate_model" label="Climate Model" choices={climateModelsItems} />,
                    <SelectInput source="scenario" label="Scenario" choices={scenariosItems} />,
                    <SelectInput source="variable" label="Variable" choices={variablesItems} />,
                    <SelectInput source="year" label="Year" choices={yearItems} />,
                    <StyleFilterInput source="style_id" label="Style" />,
                    <SelectInput source="stats_status_value" label="Stats Status" choices={[
                        { id: 'success', name: 'Success' },
                        { id: 'error', name: 'Error' },
                        { id: 'pending', name: 'Pending' },
                        { id: '__null__', name: 'Not Calculated' },
                    ]} />,
                ]}
            >
            {/* Layers Table */}
            <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                <Datagrid
                    size="small"
                    rowStyle={(record) => ({
                        backgroundColor: record.enabled
                            ? 'inherit'
                            : 'rgba(0, 0, 0, 0.04)',
                        opacity: record.enabled ? 1 : 0.6,
                        borderLeft: record.enabled
                            ? '6px solid #4caf50'
                            : '6px solid #f44336',
                    })}
                    sx={{
                        '& .RaDatagrid-headerCell': {
                            fontWeight: 600,
                            backgroundColor: 'grey.50',
                            py: 0.25,
                            px: 0.5,
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap',
                        },
                        '& .RaDatagrid-row': {
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                                opacity: '1 !important'
                            }
                        },
                        '& .RaDatagrid-rowCell': {
                            py: 0.25,
                            px: 0.5,
                            fontSize: '0.75rem',
                        },
                        '& .RaDatagrid-even': {
                            backgroundColor: 'transparent'
                        }
                    }}
                >
                    <FunctionField
                        label="Crop"
                        render={record => (
                            <FilterableField source="crop" value={record.crop} transform="capitalize" />
                        )}
                    />
                    <FunctionField
                        label="Water Model"
                        render={record => (
                            <FilterableField source="water_model" value={record.water_model} />
                        )}
                    />
                    <FunctionField
                        label="Climate Model"
                        render={record => (
                            <FilterableField source="climate_model" value={record.climate_model} />
                        )}
                    />
                    <FunctionField
                        label="Scenario"
                        render={record => (
                            <FilterableField source="scenario" value={record.scenario} transform="uppercase" />
                        )}
                    />
                    <FunctionField
                        label="Variable"
                        render={record => (
                            <FilterableField source="variable" value={record.variable} transform="capitalize" />
                        )}
                    />
                    <FunctionField
                        label="Year"
                        render={record => (
                            <FilterableField source="year" value={record.year} />
                        )}
                    />
                    <FunctionField
                        label="Min"
                        sortable
                        source="min_value"
                        render={record => record.min_value != null ? record.min_value.toFixed(1) : '-'}
                    />
                    <FunctionField
                        label="Max"
                        sortable
                        source="max_value"
                        render={record => record.max_value != null ? record.max_value.toFixed(1) : '-'}
                    />
                    <FunctionField
                        label="Avg"
                        sortable
                        source="global_average"
                        render={record => record.global_average != null ? record.global_average.toFixed(1) : '-'}
                    />
                    <FunctionField
                        label="Size"
                        sortable
                        source="file_size"
                        render={record => formatFileSize(record.file_size)}
                    />
                    <FunctionField
                        label="Stats"
                        render={record => <StatsStatusFilterableField record={record} />}
                    />
                    <FunctionField
                        label="Crop Specific"
                        render={record => <CropSpecificFilterableField record={record} />}
                    />
                    <FunctionField
                        label="Style"
                        render={record => <StyleFilterableField record={record} />}
                    />
                    <FunctionField
                        label="Views"
                        source="total_views"
                        sortable={true}
                        textAlign="center"
                        render={record => {
                            // Construct the frontend URL with layer parameters
                            const params = new URLSearchParams();
                            if (record.crop) params.set('crop', record.crop);

                            if (record.is_crop_specific) {
                                // For crop-specific layers, use crop_variable parameter
                                if (record.variable) params.set('crop_variable', record.variable);
                            } else {
                                // For climate layers, use all the model parameters
                                if (record.water_model) params.set('water_model', record.water_model);
                                if (record.climate_model) params.set('climate_model', record.climate_model);
                                if (record.scenario) params.set('scenario', record.scenario);
                                if (record.variable) params.set('variable', record.variable);
                                if (record.year) params.set('year', record.year.toString());
                            }
                            const mapUrl = `/?${params.toString()}`;

                            return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Tooltip title={record.enabled ? "Open in map" : "Layer is disabled"}>
                                        <span>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (record.enabled) {
                                                        window.open(mapUrl, '_blank');
                                                    }
                                                }}
                                                disabled={!record.enabled}
                                                sx={{
                                                    color: record.enabled ? 'primary.main' : 'action.disabled',
                                                    p: 0.25,
                                                }}
                                            >
                                                <MapIcon sx={{ fontSize: '1rem' }} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Chip
                                        size="small"
                                        icon={<VisibilityIcon sx={{ fontSize: '0.75rem !important' }} />}
                                        label={(record.total_views || 0).toLocaleString()}
                                        color="secondary"
                                        variant="filled"
                                        sx={{ fontSize: '0.7rem', fontWeight: 600, height: '20px' }}
                                    />
                                </Box>
                            );
                        }}
                    />
                </Datagrid>
            </Card>
        </List>

            {/* Upload Dialog */}
            <UploadDialog
                open={uploadDialogOpen}
                onClose={() => setUploadDialogOpen(false)}
            />
        </StylesContext.Provider>
    );
};

export default LayerList;
