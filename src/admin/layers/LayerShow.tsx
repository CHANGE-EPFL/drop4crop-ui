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
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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

export const ColorBar = ({ record }) => {
    if (!record || !record.style || record.style.length == 0) {
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

    const gradient = createStyleGradient(record.style);

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
    const navigate = useNavigate();
    const [cacheStatus, setCacheStatus] = useState(null);
    const [statsData, setStatsData] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [timelineData, setTimelineData] = useState([]);
    const [timelineLoading, setTimelineLoading] = useState(true);
    const [allCacheKeys, setAllCacheKeys] = useState([]);

    useEffect(() => {
        if (record?.layer_name) {
            const fetchCacheStatus = async () => {
                try {
                    const { data } = await dataProvider.getCacheKeys();
                    // Try exact match first, then try with .tif extension
                    let cached = data.find(item => item.layer_name === record.layer_name);
                    if (!cached) {
                        cached = data.find(item => item.layer_name === `${record.layer_name}.tif`);
                    }
                    // Also try matching without extension in case layer_name has extension but cache doesn't
                    if (!cached) {
                        const layerNameWithoutExt = record.layer_name.replace(/\.(tif|tiff)$/i, '');
                        cached = data.find(item => item.layer_name.replace(/\.(tif|tiff)$/i, '') === layerNameWithoutExt);
                    }
                    setCacheStatus(cached);
                } catch (error) {
                    console.error('Error fetching cache status:', error);
                }
            };
            fetchCacheStatus();
        }
    }, [record, dataProvider]);

    useEffect(() => {
        if (record?.layer_name) {
            const fetchStats = async () => {
                try {
                    console.log('Fetching stats for layer_name:', record.layer_name);
                    // Fetch ALL statistics for this layer to calculate totals
                    const { data } = await dataProvider.getList('statistics', {
                        filter: { layer_name: record.layer_name },
                        sort: { field: 'stat_date', order: 'DESC' },
                        pagination: { page: 1, perPage: 1000 } // Get all records
                    });

                    console.log('Statistics data received:', data);
                    console.log('Number of stats records:', data?.length);

                    if (data && data.length > 0) {
                        // Calculate total across all dates
                        const totalStats = data.reduce((acc, stat) => ({
                            xyz_tile_count: (acc.xyz_tile_count || 0) + (stat.xyz_tile_count || 0),
                            cog_download_count: (acc.cog_download_count || 0) + (stat.cog_download_count || 0),
                            pixel_query_count: (acc.pixel_query_count || 0) + (stat.pixel_query_count || 0),
                            stac_request_count: (acc.stac_request_count || 0) + (stat.stac_request_count || 0),
                            other_request_count: (acc.other_request_count || 0) + (stat.other_request_count || 0),
                        }), {});

                        totalStats.total_requests =
                            totalStats.xyz_tile_count +
                            totalStats.cog_download_count +
                            totalStats.pixel_query_count +
                            totalStats.stac_request_count +
                            totalStats.other_request_count;

                        // Use the most recent stat for date and last accessed
                        totalStats.stat_date = data[0].stat_date;
                        totalStats.last_accessed_at = data[0].last_accessed_at;
                        totalStats.layer_name = data[0].layer_name;
                        totalStats.id = data[0].id;

                        setStatsData(totalStats);
                        // Fetch timeline for this statistic
                        fetchTimeline(data[0].id);
                    }
                } catch (error) {
                    console.error('Error fetching statistics:', error);
                }
            };
            fetchStats();
        }
    }, [record, dataProvider]);

    const fetchTimeline = async (statId) => {
        if (!statId) {
            setTimelineLoading(false);
            return;
        }
        try {
            const { data } = await dataProvider.getStatsTimeline(statId);
            setTimelineData(data);
        } catch (error) {
            console.error('Error fetching timeline:', error);
        } finally {
            setTimelineLoading(false);
        }
    };

    useEffect(() => {
        const fetchAllCacheKeys = async () => {
            try {
                const { data } = await dataProvider.getCacheKeys();
                setAllCacheKeys(data || []);
            } catch (error) {
                console.error('Error fetching all cache keys:', error);
            }
        };
        fetchAllCacheKeys();
    }, [dataProvider]);

    if (!record) {
        return <div>No data available</div>;
    }

    return (
        <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ p: 3 }}>
                {/* Header Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Layer Details
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                            color="primary"
                            label={record.crop || 'Unknown Crop'}
                            size="medium"
                        />
                        <Chip
                            color={record.enabled ? 'success' : 'default'}
                            label={record.enabled ? 'Enabled' : 'Disabled'}
                            variant={record.enabled ? 'filled' : 'outlined'}
                        />
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
                            icon={cacheStatus ? <CheckCircleIcon sx={{ color: 'success.main' }} /> : <CancelIcon sx={{ color: 'error.main' }} />}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    Cache
                                    {cacheStatus && (
                                        <Chip
                                            label={`${cacheStatus.size_mb?.toFixed(1)} MB`}
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
                            {record.style_id ? (
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Applied Style
                                    </Typography>
                                    <ReferenceField source="style_id" reference="styles" link="show">
                                        <TextField source="name" />
                                    </ReferenceField>
                                </Box>
                            ) : (
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Applied Style
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                        No style applied
                                    </Typography>
                                </Box>
                            )}
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Style Preview
                                </Typography>
                                <ColorBar record={record} />
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
                                {/* Latest Statistics Summary */}
                                <Alert severity="info">
                                    <strong>Latest Statistics ({statsData.stat_date}):</strong>{' '}
                                    {statsData.total_requests} total requests •{' '}
                                    Last accessed: {new Date(statsData.last_accessed_at).toLocaleString()}
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
                    <Stack spacing={3}>
                        {cacheStatus ? (
                            <>
                                {/* Cache Status Summary */}
                                <Alert severity="success">
                                    <strong>Cached:</strong> {cacheStatus.size_mb?.toFixed(2)} MB •
                                    TTL: {cacheStatus.ttl_hours?.toFixed(1)} hours remaining
                                </Alert>

                                {/* Cache Details */}
                                <Box>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        Cache Information
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Cache Size
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                                {cacheStatus.size_mb?.toFixed(2) || '0'} MB
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                TTL Remaining
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                                {cacheStatus.ttl_hours?.toFixed(1) || '0'} hours
                                            </Typography>
                                        </Box>
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Cache Key
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                                {cacheStatus.cache_key}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* All Cached Layers */}
                                <Box>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        All Cached Layers
                                    </Typography>
                                    <TableContainer component={Paper}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><strong>Layer Name</strong></TableCell>
                                                    <TableCell><strong>Size</strong></TableCell>
                                                    <TableCell><strong>TTL</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {allCacheKeys.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.layer_name}</TableCell>
                                                        <TableCell>
                                                            {item.size_mb !== null && item.size_mb !== undefined ?
                                                                `${item.size_mb.toFixed(2)} MB` :
                                                                'N/A'
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.ttl_hours !== null && item.ttl_hours !== undefined ?
                                                                `${item.ttl_hours.toFixed(1)} hrs` :
                                                                'No expiry'
                                                            }
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            </>
                        ) : (
                            <Alert severity="info">
                                This layer is not currently cached
                            </Alert>
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
