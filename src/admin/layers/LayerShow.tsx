import {
    BooleanField,
    DateField,
    ReferenceField,
    Show,
    SimpleShowLayout,
    TextField,
    useRecordContext,
    TopToolbar,
    EditButton,
    DeleteButton,
    ListButton,
    useDataProvider,
    Loading,
    useGetOne,
    useRefresh,
    useGetList,
} from "react-admin";
import {
    Typography,
    Box,
    Chip,
    Card,
    CardContent,
    Stack,
    Divider,
    Button,
    Alert,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Tooltip,
    Switch,
    FormControlLabel,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Menu,
} from '@mui/material';
import { createStyleGradient } from '../../utils/styleUtils';
import { StyleSelector } from './StyleSelector';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ListIcon from '@mui/icons-material/List';
import BarChartIcon from '@mui/icons-material/BarChart';
import StorageIcon from '@mui/icons-material/Storage';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MapIcon from '@mui/icons-material/Map';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShareIcon from '@mui/icons-material/Share';
import GrassIcon from '@mui/icons-material/Grass';
import PaletteIcon from '@mui/icons-material/Palette';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useState, useEffect } from 'react';
import { useNotify } from 'react-admin';
import {
    LineChart,
    Line,
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

// Format file size in human readable format
const formatFileSize = (bytes: number | null | undefined) => {
    if (bytes == null) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

// Recalculate statistics button component
const RecalculateStatsButton = ({ layerId }) => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();
    const [isRecalculating, setIsRecalculating] = useState(false);

    const handleRecalculate = async () => {
        setIsRecalculating(true);
        try {
            const { data } = await dataProvider.recalculateLayerStats(layerId);
            const changes: string[] = [];
            if (data.previous_min_value !== data.min_value) {
                changes.push(`min: ${data.previous_min_value?.toFixed(2) || 'N/A'} → ${data.min_value?.toFixed(2)}`);
            }
            if (data.previous_max_value !== data.max_value) {
                changes.push(`max: ${data.previous_max_value?.toFixed(2) || 'N/A'} → ${data.max_value?.toFixed(2)}`);
            }
            if (data.previous_global_average !== data.global_average) {
                changes.push(`avg: ${data.previous_global_average?.toFixed(2) || 'N/A'} → ${data.global_average?.toFixed(2)}`);
            }

            if (changes.length > 0) {
                notify(`Statistics updated: ${changes.join(', ')}`, { type: 'success' });
            } else {
                notify('Statistics unchanged', { type: 'info' });
            }
            refresh();
        } catch (error: any) {
            notify(`Failed to recalculate statistics: ${error.message || error}`, { type: 'error' });
        } finally {
            setIsRecalculating(false);
        }
    };

    return (
        <Button
            variant="outlined"
            color="primary"
            startIcon={isRecalculating ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleRecalculate}
            disabled={isRecalculating}
        >
            {isRecalculating ? 'Recalculating...' : 'Recalculate Stats'}
        </Button>
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
        warnings.push(`Layer min (${layer.min_value.toFixed(2)}) is below style min (${styleMin})`);
    }
    if (layer.max_value !== null && layer.max_value > styleMax) {
        warnings.push(`Layer max (${layer.max_value.toFixed(2)}) exceeds style max (${styleMax})`);
    }

    if (warnings.length === 0) return null;

    return warnings;
};

// Style range warning component
const StyleRangeWarning = ({ styleId, layer }) => {
    const { data: style, isLoading } = useGetOne('styles', { id: styleId }, { enabled: !!styleId });

    if (isLoading || !style) return null;

    const warnings = getStyleRangeWarning(layer, style);
    if (!warnings) return null;

    return (
        <Alert severity="warning" sx={{ mt: 1 }}>
            <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Layer values fall outside style range
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {warnings.join('. ')}. Values outside the range will be clamped to the nearest color.
                </Typography>
            </Box>
        </Alert>
    );
};

// Style name display component - uses separate API call, clickable to go to style page
const StyleNameDisplay = ({ styleId }) => {
    const { data: style, isLoading } = useGetOne('styles', { id: styleId }, { enabled: !!styleId });

    if (isLoading) {
        return <CircularProgress size={20} />;
    }

    if (!style) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="This layer will be styled in grayscale until a style is chosen">
                    <WarningIcon sx={{ fontSize: 18, color: 'error.main' }} />
                </Tooltip>
                <Typography variant="body1" sx={{ fontWeight: 500, color: 'error.main' }}>
                    No style applied
                </Typography>
            </Box>
        );
    }

    return (
        <Typography
            variant="body1"
            component="a"
            href={`#/styles/${styleId}/show`}
            sx={{
                fontWeight: 500,
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                    textDecoration: 'underline',
                    cursor: 'pointer'
                }
            }}
        >
            {style.name || 'Unnamed style'}
        </Typography>
    );
};

// ColorBar component that fetches style data and supports discrete/linear modes
const ColorBarWithData = ({ styleId }) => {
    const { data: style, isLoading } = useGetOne('styles', { id: styleId }, { enabled: !!styleId });

    if (isLoading) {
        return <CircularProgress size={20} />;
    }

    if (!style || !style.style || style.style.length === 0) {
        return (
            <Box
                sx={{
                    height: '12px',
                    width: '100%',
                    maxWidth: '200px',
                    background: 'linear-gradient(to right, #000000, #404040, #808080, #c0c0c0, #ffffff)',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
            />
        );
    }

    const isDiscrete = style.interpolation_type === 'discrete';

    if (isDiscrete) {
        // Show discrete color blocks
        const sortedStyle = [...style.style].sort((a, b) => a.value - b.value);
        return (
            <Box
                sx={{
                    display: 'flex',
                    height: '20px',
                    width: '100%',
                    maxWidth: '400px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: '1px solid #ddd',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
            >
                {sortedStyle.map((stop, index) => (
                    <Tooltip key={index} title={stop.label || `≤ ${stop.value}`}>
                        <Box
                            sx={{
                                flex: 1,
                                backgroundColor: `rgba(${stop.red},${stop.green},${stop.blue},${(stop.opacity || 255) / 255})`,
                            }}
                        />
                    </Tooltip>
                ))}
            </Box>
        );
    }

    // Linear gradient - same size as discrete
    const gradient = createStyleGradient(style.style);

    return (
        <Box
            sx={{
                height: '20px',
                width: '100%',
                maxWidth: '400px',
                background: gradient,
                borderRadius: '6px',
                border: '1px solid #ddd',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
        />
    );
};

const LayerShowActions = () => (
    <TopToolbar>
        <ListButton />
        <EditButton />
        <DeleteButton mutationMode="pessimistic" />
    </TopToolbar>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const LayerShowContent = () => {
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();
    const [activeTab, setActiveTab] = useState(0);
    const [timelineData, setTimelineData] = useState([]);
    const [timelineLoading, setTimelineLoading] = useState(true);
    const [cacheDetail, setCacheDetail] = useState(null);
    const [cacheDetailLoading, setCacheDetailLoading] = useState(false);

    // Cache and stats are now included in the record from the backend
    const cacheStatus = record?.cache_status;
    const statsData = record?.stats;

    // Fetch timeline when stats tab is opened
    useEffect(() => {
        if (activeTab === 1 && record?.id && statsData) {
            const fetchTimeline = async () => {
                setTimelineLoading(true);
                try {
                    // Get all stats for this layer by layer_name
                    const { data } = await dataProvider.getList('statistics', {
                        filter: { layer_name: record.layer_name },
                        sort: { field: 'stat_date', order: 'ASC' },
                        pagination: { page: 1, perPage: 1000 }
                    });

                    // Format for the chart
                    const chartData = data.map(stat => ({
                        stat_date: stat.stat_date,
                        xyz_tile_count: stat.xyz_tile_count || 0,
                        cog_download_count: stat.cog_download_count || 0,
                        pixel_query_count: stat.pixel_query_count || 0,
                        stac_request_count: stat.stac_request_count || 0,
                        total_requests: (stat.xyz_tile_count || 0) +
                                      (stat.cog_download_count || 0) +
                                      (stat.pixel_query_count || 0) +
                                      (stat.stac_request_count || 0) +
                                      (stat.other_request_count || 0)
                    }));

                    setTimelineData(chartData);
                } catch (error) {
                    console.error('Error fetching timeline:', error);
                } finally {
                    setTimelineLoading(false);
                }
            };
            fetchTimeline();
        }
    }, [activeTab, record, dataProvider]);

    // Fetch cache detail when cache tab is opened
    useEffect(() => {
        if (activeTab === 2 && record?.layer_name) {
            const fetchCacheDetail = async () => {
                setCacheDetailLoading(true);
                try {
                    const { data } = await dataProvider.getLayerCacheDetail(record.layer_name);
                    setCacheDetail(data);
                } catch (error) {
                    console.error('Error fetching cache detail:', error);
                    setCacheDetail(null);
                } finally {
                    setCacheDetailLoading(false);
                }
            };
            fetchCacheDetail();
        }
    }, [activeTab, record?.layer_name, dataProvider]);

    if (!record) {
        return <div>No data available</div>;
    }

    // Helper function to build the layer URL
    const buildLayerUrl = () => {
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

        const baseUrl = window.location.origin;
        return `${baseUrl}/?${params.toString()}`;
    };

    const handleCopyLink = async () => {
        try {
            const url = buildLayerUrl();
            await navigator.clipboard.writeText(url);
            notify('Link copied to clipboard!', { type: 'success' });
        } catch (error) {
            notify('Failed to copy link', { type: 'error' });
        }
    };

    return (
        <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ p: 3 }}>
                {/* Header Section */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h4" component="h1">
                            Layer Details
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <RecalculateStatsButton layerId={record.id} />
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<ShareIcon />}
                                onClick={handleCopyLink}
                            >
                                Copy Link
                            </Button>
                            <Tooltip title={record.enabled ? "" : "Layer is disabled"}>
                                <span>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<MapIcon />}
                                        endIcon={<OpenInNewIcon />}
                                        onClick={() => {
                                            if (record.enabled) {
                                                const url = buildLayerUrl();
                                                window.open(url, '_blank');
                                            }
                                        }}
                                        disabled={!record.enabled}
                                    >
                                        View on Map
                                    </Button>
                                </span>
                            </Tooltip>
                        </Stack>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                            color="primary"
                            label={record.crop || 'Unknown Crop'}
                            size="medium"
                        />
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            borderLeft: record.enabled ? '6px solid #4caf50' : '6px solid #f44336',
                            backgroundColor: record.enabled ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)',
                        }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                    color: record.enabled ? '#4caf50' : '#f44336'
                                }}
                            >
                                {record.enabled ? 'Enabled' : 'Disabled'}
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={record.enabled}
                                        onChange={async (e) => {
                                            try {
                                                await dataProvider.update('layers', {
                                                    id: record.id,
                                                    data: { enabled: e.target.checked },
                                                    previousData: record
                                                });
                                                notify(`Layer ${e.target.checked ? 'enabled' : 'disabled'}`, { type: 'success' });
                                                refresh();
                                            } catch (error) {
                                                notify('Error updating layer status', { type: 'error' });
                                            }
                                        }}
                                        color="success"
                                    />
                                }
                                label=""
                            />
                        </Box>
                        {record.is_crop_specific && (
                            <Chip
                                icon={<GrassIcon />}
                                label="Crop-Specific Data Layer"
                                color="secondary"
                                variant="outlined"
                                size="medium"
                            />
                        )}
                    </Stack>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab
                            icon={<InfoIcon />}
                            label="Layer Information"
                            iconPosition="start"
                        />
                        <Tab
                            icon={<BarChartIcon />}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    Statistics
                                    {statsData && (
                                        <Chip
                                            label={statsData.total_requests?.toLocaleString()}
                                            size="small"
                                            color="primary"
                                            sx={{ height: 20, fontSize: '0.75rem' }}
                                        />
                                    )}
                                </Box>
                            }
                            iconPosition="start"
                        />
                        <Tab
                            icon={(cacheStatus && cacheStatus.cached) ? <CheckCircleIcon sx={{ color: 'success.main' }} /> : <CancelIcon sx={{ color: 'error.main' }} />}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    Cache
                                    {(cacheStatus && cacheStatus.cached && cacheStatus.size_mb) && (
                                        <Chip
                                            label={`${cacheStatus.size_mb.toFixed(1)} MB`}
                                            size="small"
                                            color="success"
                                            sx={{ height: 20, fontSize: '0.75rem' }}
                                        />
                                    )}
                                </Box>
                            }
                            iconPosition="start"
                        />
                    </Tabs>
                </Box>

                {/* Tab Content */}
                {activeTab === 0 && (
                    <Stack spacing={3}>

                    {/* Basic Information */}
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" color="primary">
                                Basic Information
                            </Typography>
                        </Box>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Layer Name
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {record.layer_name}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Filename
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                        {record.filename}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        File Size
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {formatFileSize(record.file_size)}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Min Value
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {record.min_value?.toFixed(2) || 'N/A'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Max Value
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {record.max_value?.toFixed(2) || 'N/A'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Global Average
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {record.global_average?.toFixed(2) || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                                <Tooltip title="Pre-computed overview quality hint for optimized tile serving. -2 = all overviews usable, -1 = none usable, ≥0 = minimum usable overview index">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Overview Quality
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {record.min_usable_overview === null || record.min_usable_overview === undefined
                                                ? <Chip label="Not computed" size="small" color="warning" variant="outlined" />
                                                : record.min_usable_overview === -2
                                                ? <Chip label="All usable" size="small" color="success" variant="outlined" />
                                                : record.min_usable_overview === -1
                                                ? <Chip label="None usable" size="small" color="error" variant="outlined" />
                                                : <Chip label={`Min index: ${record.min_usable_overview}`} size="small" color="info" variant="outlined" />
                                            }
                                        </Typography>
                                    </Box>
                                </Tooltip>
                            </Box>
                            {/* Stats Status */}
                            {record.stats_status && (
                                <Box sx={{
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: record.stats_status.status === 'error' ? 'error.light' : 'success.light',
                                    border: 1,
                                    borderColor: record.stats_status.status === 'error' ? 'error.main' : 'success.main'
                                }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: record.stats_status.status === 'error' ? 'error.dark' : 'success.dark' }}>
                                        Stats Status: {record.stats_status.status === 'error' ? 'Error' : 'Success'}
                                    </Typography>
                                    {record.stats_status.last_run && (
                                        <Typography variant="body2" color="text.secondary">
                                            Last calculated: {new Date(record.stats_status.last_run).toLocaleString()}
                                        </Typography>
                                    )}
                                    {record.stats_status.error && (
                                        <Typography variant="body2" color="error.dark" sx={{ mt: 0.5 }}>
                                            Error: {record.stats_status.error}
                                        </Typography>
                                    )}
                                    {record.stats_status.details && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {record.stats_status.details}
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Stack>
                    </Box>

                    <Divider />

                    {/* Model Configuration - Only for non-crop-specific layers */}
                    {!record.is_crop_specific ? (
                        <Box>
                            <Typography variant="h6" gutterBottom color="primary">
                                Model Configuration
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Water Model
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {record.water_model}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Climate Model
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {record.climate_model}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Scenario
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {record.scenario}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Variable
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                        {record.variable}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Year
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {record.year}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        ID
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                        {record.id}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="h6" gutterBottom color="primary">
                                Crop Data
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Variable
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                        {record.variable}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Layer Type
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Crop-Specific Baseline Data
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        ID
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                        {record.id}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    <Divider />

                    {/* Style Information */}
                    <Box>
                        <Typography variant="h6" gutterBottom color="primary">
                            Style Configuration
                        </Typography>
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Applied Style
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <StyleNameDisplay styleId={record.style_id} />
                                    <StyleSelector
                                        layerId={record.id}
                                        currentStyleId={record.style_id}
                                        variant="icon"
                                    />
                                </Box>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Style Preview
                                </Typography>
                                <ColorBarWithData styleId={record.style_id} />
                            </Box>
                            {record.style_id && (
                                <StyleRangeWarning styleId={record.style_id} layer={record} />
                            )}
                        </Stack>
                    </Box>
                </Stack>
                )}

                {/* Statistics Tab */}
                {activeTab === 1 && (
                    <Stack spacing={3}>
                        {statsData ? (
                            <>
                                {/* Statistics Summary */}
                                <Alert severity="info">
                                    <strong>Total Statistics:</strong>{' '}
                                    {statsData.total_requests.toLocaleString()} total requests
                                    {statsData.last_accessed_at && (
                                        <>{' '}• Last accessed: {new Date(statsData.last_accessed_at).toLocaleString()}</>
                                    )}
                                </Alert>

                                {/* Request Type Breakdown */}
                                <Box>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        Request Type Breakdown
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                XYZ Tiles
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                                {statsData.xyz_tile_count?.toLocaleString() || '0'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                COG Downloads
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                                {statsData.cog_download_count?.toLocaleString() || '0'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Pixel Queries
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                                {statsData.pixel_query_count?.toLocaleString() || '0'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                STAC Requests
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                                {statsData.stac_request_count?.toLocaleString() || '0'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Other Requests
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                                {statsData.other_request_count?.toLocaleString() || '0'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Requests
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>
                                                {statsData.total_requests?.toLocaleString() || '0'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Historical Timeline */}
                                <Box>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        Historical Timeline
                                    </Typography>
                                    {timelineLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : timelineData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={400}>
                                            <LineChart data={timelineData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="stat_date" />
                                                <YAxis />
                                                <RechartsTooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="xyz_tile_count" stroke="#0088FE" name="XYZ Tiles" />
                                                <Line type="monotone" dataKey="cog_download_count" stroke="#00C49F" name="COG Downloads" />
                                                <Line type="monotone" dataKey="pixel_query_count" stroke="#FFBB28" name="Pixel Queries" />
                                                <Line type="monotone" dataKey="stac_request_count" stroke="#FF8042" name="STAC" />
                                                <Line type="monotone" dataKey="total_requests" stroke="#8884D8" strokeWidth={2} name="Total" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                                            No historical data available
                                        </Typography>
                                    )}
                                </Box>
                            </>
                        ) : (
                            <Alert severity="info">
                                No statistics data available for this layer
                            </Alert>
                        )}
                    </Stack>
                )}

                {/* Cache Tab */}
                {activeTab === 2 && (
                    <Stack spacing={2}>
                        {cacheDetailLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : cacheDetail && cacheDetail.total_items > 0 ? (
                            <>
                                {/* Cache Summary */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                            {cacheDetail.total_size_mb?.toFixed(2)} MB cached
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {cacheDetail.total_items} items ({cacheDetail.cog_file ? '1 COG file' : '0 COG files'}, {cacheDetail.png_tiles?.length || 0} PNG tiles)
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {cacheDetail.cog_file && cacheDetail.cog_file.ttl_hours != null ? (
                                            <Button
                                                variant="outlined"
                                                color="success"
                                                size="small"
                                                onClick={async () => {
                                                    try {
                                                        await dataProvider.persistLayerCache(record.layer_name);
                                                        notify('COG cache is now permanent', { type: 'success' });
                                                        refresh();
                                                    } catch (error) {
                                                        notify('Failed to make cache permanent', { type: 'error' });
                                                    }
                                                }}
                                            >
                                                Make Permanent
                                            </Button>
                                        ) : cacheDetail.cog_file && (
                                            <Button
                                                variant="outlined"
                                                color="warning"
                                                size="small"
                                                onClick={async () => {
                                                    try {
                                                        await dataProvider.unpersistLayerCache(record.layer_name);
                                                        notify('COG cache will now expire after default TTL', { type: 'success' });
                                                        refresh();
                                                    } catch (error) {
                                                        notify('Failed to restore expiry', { type: 'error' });
                                                    }
                                                }}
                                            >
                                                Restore Expiry
                                            </Button>
                                        )}
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            onClick={async () => {
                                                if (window.confirm(`Clear all cache for "${record.layer_name}"?`)) {
                                                    try {
                                                        await dataProvider.clearLayerCache(record.layer_name);
                                                        notify('Cache cleared', { type: 'success' });
                                                        refresh();
                                                    } catch (error) {
                                                        notify('Failed to clear cache', { type: 'error' });
                                                    }
                                                }
                                            }}
                                        >
                                            Clear All Cache
                                        </Button>
                                    </Box>
                                </Box>

                                <Divider />

                                {/* COG File Section */}
                                {cacheDetail.cog_file && (
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <StorageIcon fontSize="small" color="primary" /> COG File
                                        </Typography>
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 500, width: '120px' }}>Size</TableCell>
                                                        <TableCell>{cacheDetail.cog_file.size_mb?.toFixed(2)} MB</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 500 }}>TTL</TableCell>
                                                        <TableCell>
                                                            {cacheDetail.cog_file.ttl_hours != null
                                                                ? `${cacheDetail.cog_file.ttl_hours.toFixed(1)} hours remaining`
                                                                : 'Permanent (no expiry)'}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 500 }}>Cache Key</TableCell>
                                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                            {cacheDetail.cog_file.cache_key}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}

                                {/* PNG Tiles Section */}
                                {cacheDetail.png_tiles && cacheDetail.png_tiles.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MapIcon fontSize="small" color="secondary" /> PNG Tiles ({cacheDetail.png_tiles.length})
                                        </Typography>
                                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                                            <Table size="small" stickyHeader>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell><strong>Tile (z/x/y)</strong></TableCell>
                                                        <TableCell><strong>Size</strong></TableCell>
                                                        <TableCell><strong>TTL</strong></TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {cacheDetail.png_tiles.map((tile, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell sx={{ fontFamily: 'monospace' }}>
                                                                {tile.tile_coords || '—'}
                                                            </TableCell>
                                                            <TableCell>{(tile.size_bytes / 1024).toFixed(1)} KB</TableCell>
                                                            <TableCell>
                                                                {tile.ttl_hours != null
                                                                    ? `${tile.ttl_hours.toFixed(1)} hrs`
                                                                    : 'No expiry'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}

                                <Alert severity="info" sx={{ py: 1 }}>
                                    <Typography variant="body2">
                                        COG files are cached for fast S3 access • PNG tiles are cached for instant response • TTL resets on each access
                                    </Typography>
                                </Alert>
                            </>
                        ) : (
                            <>
                                <Alert severity="info" sx={{ py: 1 }}>
                                    This layer is not cached. It will be cached automatically on first access.
                                </Alert>
                                <Typography variant="body2" color="text.secondary">
                                    COG files are cached from S3 for fast tile generation. PNG tiles are cached after rendering for instant response.
                                </Typography>
                            </>
                        )}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
};

export const LayerShow = () => {
    return (
        <Show actions={<LayerShowActions />}>
            <LayerShowContent />
        </Show>
    )
};

export default LayerShow;
