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
} from '@mui/material';
import { createStyleGradient } from '../../utils/styleUtils';
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

// Style name display component - uses separate API call
const StyleNameDisplay = ({ styleId }) => {
    const { data: style, isLoading } = useGetOne('styles', { id: styleId }, { enabled: !!styleId });

    if (isLoading) {
        return <CircularProgress size={20} />;
    }

    if (!style) {
        return (
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                No style applied
            </Typography>
        );
    }

    return (
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {style.name || 'Unnamed style'}
        </Typography>
    );
};

// ColorBar component that fetches style data
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
                    backgroundColor: '#e0e0e0',
                    borderRadius: '6px',
                    border: '1px solid #ddd'
                }}
            />
        );
    }

    const gradient = createStyleGradient(style.style);

    return (
        <Box
            sx={{
                height: '12px',
                width: '100%',
                maxWidth: '200px',
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

    if (!record) {
        return <div>No data available</div>;
    }

    // Helper function to build the layer URL
    const buildLayerUrl = () => {
        const params = new URLSearchParams();
        if (record.crop) params.set('crop', record.crop);
        if (record.water_model) params.set('water_model', record.water_model);
        if (record.climate_model) params.set('climate_model', record.climate_model);
        if (record.scenario) params.set('scenario', record.scenario);
        if (record.variable) params.set('variable', record.variable);
        if (record.year) params.set('year', record.year.toString());

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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                color={record.enabled ? 'success' : 'default'}
                                label={record.enabled ? 'Enabled' : 'Disabled'}
                                variant={record.enabled ? 'filled' : 'outlined'}
                            />
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
                        <Chip
                            color={record.is_crop_specific ? 'secondary' : 'default'}
                            label={record.is_crop_specific ? 'Crop Specific' : 'General'}
                            variant="outlined"
                        />
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
                        <Typography variant="h6" gutterBottom color="primary">
                            Basic Information
                        </Typography>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
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
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                        {record.filename}
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
                        </Stack>
                    </Box>

                    <Divider />

                    {/* Model Configuration */}
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
                                <StyleNameDisplay styleId={record.style_id} />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Style Preview
                                </Typography>
                                <ColorBarWithData styleId={record.style_id} />
                            </Box>
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
                        {cacheStatus && cacheStatus.cached ? (
                            <>
                                {/* Cache Information - Compact Layout */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Cache Size
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                            {cacheStatus.size_mb?.toFixed(2)} MB
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            TTL Remaining
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                            {cacheStatus.ttl_hours?.toFixed(1)} hours
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            onClick={async () => {
                                                if (window.confirm(`Clear cache for "${record.layer_name}"?`)) {
                                                    try {
                                                        await dataProvider.clearLayerCache(record.layer_name);
                                                        notify('Cache cleared', { type: 'success' });
                                                        refresh(); // Use React Admin refresh to reload the layer data
                                                    } catch (error) {
                                                        notify('Failed to clear cache', { type: 'error' });
                                                    }
                                                }
                                            }}
                                            sx={{ mt: 2.5 }}
                                        >
                                            Clear Cache
                                        </Button>
                                    </Box>
                                </Box>

                                {/* Cache Key */}
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Cache Key
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', color: 'text.primary' }}>
                                        {cacheStatus.cache_key}
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                {/* Compact Info Alert */}
                                <Alert severity="info" sx={{ py: 1 }}>
                                    <Typography variant="body2">
                                        Cached GeoTIFF loads faster • TTL resets on each access • Popular layers stay cached longer • Clearing forces S3 re-download
                                    </Typography>
                                </Alert>
                            </>
                        ) : (
                            <>
                                <Alert severity="info" sx={{ py: 1 }}>
                                    This layer is not cached. It will be cached automatically on first access.
                                </Alert>
                                <Typography variant="body2" color="text.secondary">
                                    Caching stores the entire GeoTIFF in Redis for faster access. TTL resets on each access, so frequently used layers stay cached.
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
