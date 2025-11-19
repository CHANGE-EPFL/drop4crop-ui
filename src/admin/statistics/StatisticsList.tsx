import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    FunctionField,
    useDataProvider,
    useRedirect,
} from 'react-admin';
import {
    Card,
    CardContent,
    Grid,
    Typography,
    Box,
    Chip,
    CircularProgress,
    TextField as MuiTextField,
    IconButton,
    Tooltip,
    Alert,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    TrendingUp as TrendingUpIcon,
    Assessment as AssessmentIcon,
    Layers as LayersIcon,
    BarChart as BarChartIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Storage as StorageIcon,
} from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const StatisticsFilters = [
    <MuiTextField label="Start Date" source="start_date" type="date" InputLabelProps={{ shrink: true }} />,
    <MuiTextField label="End Date" source="end_date" type="date" InputLabelProps={{ shrink: true }} />,
];

// Context to share cache data across all field components
const CacheDataContext = React.createContext(null);

const CacheStatusField = () => {
    const cacheData = React.useContext(CacheDataContext);

    return (
        <FunctionField
            label="Cache"
            sortable={false}
            render={(record) => {
                if (!cacheData || !record || !record.layer_name) {
                    return null;
                }

                // Try exact match first, then try with .tif extension
                let cacheStatus = cacheData.find(item => item.layer_name === record.layer_name);
                if (!cacheStatus) {
                    cacheStatus = cacheData.find(item => item.layer_name === `${record.layer_name}.tif`);
                }
                // Also try matching without extension
                if (!cacheStatus) {
                    const layerNameWithoutExt = record.layer_name.replace(/\.(tif|tiff)$/i, '');
                    cacheStatus = cacheData.find(item => item.layer_name.replace(/\.(tif|tiff)$/i, '') === layerNameWithoutExt);
                }

                return cacheStatus ? (
                    <Tooltip title={`Cached: ${cacheStatus.size_mb?.toFixed(2)} MB, TTL: ${cacheStatus.ttl_hours?.toFixed(1)} hrs`}>
                        <CheckCircleIcon color="success" fontSize="small" />
                    </Tooltip>
                ) : (
                    <Tooltip title="Not cached">
                        <CancelIcon color="disabled" fontSize="small" />
                    </Tooltip>
                );
            }}
        />
    );
};

const ActivityByTypeChart = () => {
    const dataProvider = useDataProvider();
    const [dailyStats, setDailyStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDailyStats = async () => {
            try {
                // Fetch last 7 days of aggregated statistics
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);

                const { data } = await dataProvider.getList('statistics', {
                    filter: {},
                    sort: { field: 'stat_date', order: 'ASC' },
                    pagination: { page: 1, perPage: 1000 }
                });

                // Aggregate by date
                const dateMap = new Map();
                data.forEach(stat => {
                    const date = stat.stat_date;
                    if (!dateMap.has(date)) {
                        dateMap.set(date, {
                            date,
                            'XYZ Tiles': 0,
                            'COG Downloads': 0,
                            'Pixel Queries': 0,
                            'STAC Requests': 0,
                            'Other': 0
                        });
                    }
                    const entry = dateMap.get(date);
                    entry['XYZ Tiles'] += stat.xyz_tile_count || 0;
                    entry['COG Downloads'] += stat.cog_download_count || 0;
                    entry['Pixel Queries'] += stat.pixel_query_count || 0;
                    entry['STAC Requests'] += stat.stac_request_count || 0;
                    entry['Other'] += stat.other_request_count || 0;
                });

                // Convert to array and sort by date, take last 7 days
                const chartData = Array.from(dateMap.values())
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .slice(-7);

                setDailyStats(chartData);
            } catch (error) {
                console.error('Error fetching daily stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDailyStats();
    }, [dataProvider]);

    const chartData = dailyStats;

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">Daily Activity by Request Type</Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Request breakdown by type over the last 7 days
                    </Typography>
                </Box>
                <Box sx={{ height: 250, mt: 2 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    stroke="#ddd"
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    stroke="#ddd"
                                    allowDecimals={false}
                                />
                                <RechartsTooltip
                                    contentStyle={{
                                        fontSize: 13,
                                        borderRadius: 8,
                                        border: '1px solid #ddd',
                                        padding: '8px 12px'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="XYZ Tiles"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="COG Downloads"
                                    stroke="#82ca9d"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Pixel Queries"
                                    stroke="#ffc658"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="STAC Requests"
                                    stroke="#ff7c7c"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Other"
                                    stroke="#a28cff"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

const LiveStatsCard = () => {
    const dataProvider = useDataProvider();
    const navigate = useNavigate();
    const [liveStats, setLiveStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const fetchLiveStats = async () => {
            try {
                const { data } = await dataProvider.getLiveStats();
                setLiveStats(data.slice(0, 5)); // Top 5
                setLastUpdated(new Date());
            } catch (error) {
                console.error('Error fetching live stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLiveStats();
        // Refresh every 10 seconds for more real-time feel
        const interval = setInterval(fetchLiveStats, 10000);
        return () => clearInterval(interval);
    }, [dataProvider]);

    if (loading) {
        return (
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress />
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="h6">Live Statistics (Today)</Typography>
                        <Chip label="Auto-refresh 10s" color="success" size="small" sx={{ ml: 2 }} />
                    </Box>
                    {lastUpdated && (
                        <Typography variant="caption" color="textSecondary">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </Typography>
                    )}
                </Box>
                {liveStats.length > 0 ? (
                    <Box>
                        {liveStats.map((stat, index) => (
                            <Box
                                key={index}
                                onClick={() => stat.layer_id && navigate(`/admin/layers/${stat.layer_id}/show`)}
                                sx={{
                                    p: 2,
                                    mb: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    backgroundColor: 'background.paper',
                                    transition: 'all 0.2s ease-in-out',
                                    cursor: stat.layer_id ? 'pointer' : 'default',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: 1,
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                        color="primary"
                                        sx={{
                                            cursor: stat.layer_id ? 'pointer' : 'default',
                                            '&:hover': stat.layer_id ? { textDecoration: 'underline' } : {}
                                        }}
                                        onClick={() => stat.layer_id && navigate(`/admin/layers/${stat.layer_id}/show`)}
                                    >
                                        {stat.layer_name}
                                    </Typography>
                                    {stat.layer_id && (
                                        <Box>
                                            <Tooltip title="View Layer Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/admin/layers/${stat.layer_id}/show`);
                                                    }}
                                                    sx={{ mr: 0.5 }}
                                                >
                                                    <LayersIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="View Layer Statistics">
                                                <IconButton
                                                    size="small"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        // Fetch the most recent statistic for this layer and navigate to its show page
                                                        try {
                                                            const { data } = await dataProvider.getList('statistics', {
                                                                filter: { layer_name: stat.layer_name },
                                                                sort: { field: 'stat_date', order: 'DESC' },
                                                                pagination: { page: 1, perPage: 1 }
                                                            });
                                                            if (data && data.length > 0) {
                                                                navigate(`/admin/statistics/${data[0].id}/show`);
                                                            } else {
                                                                // If no statistics found, navigate to filtered list
                                                                const filter = { layer_name: stat.layer_name };
                                                                navigate(`/admin/statistics?filter=${encodeURIComponent(JSON.stringify(filter))}`);
                                                            }
                                                        } catch (error) {
                                                            console.error('Error fetching statistics:', error);
                                                            // Fallback to filtered list
                                                            const filter = { layer_name: stat.layer_name };
                                                            navigate(`/admin/statistics?filter=${encodeURIComponent(JSON.stringify(filter))}`);
                                                        }
                                                    }}
                                                >
                                                    <BarChartIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    )}
                                </Box>
                                <Grid container spacing={1}>
                                    <Grid item xs={6} sm={2.4}>
                                        <Typography variant="caption" color="textSecondary">XYZ Tiles</Typography>
                                        <Typography variant="body2">{stat.xyz_tile_count}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={2.4}>
                                        <Typography variant="caption" color="textSecondary">COG Downloads</Typography>
                                        <Typography variant="body2">{stat.cog_download_count}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={2.4}>
                                        <Typography variant="caption" color="textSecondary">Pixel Queries</Typography>
                                        <Typography variant="body2">{stat.pixel_query_count}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={2.4}>
                                        <Typography variant="caption" color="textSecondary">STAC Requests</Typography>
                                        <Typography variant="body2">{stat.stac_request_count}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={2.4}>
                                        <Typography variant="caption" color="textSecondary">Total</Typography>
                                        <Typography variant="body2" fontWeight="bold">{stat.total_requests}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                        No live statistics available
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};


export const StatisticsList = () => {
    const dataProvider = useDataProvider();
    const redirect = useRedirect();
    const [cacheData, setCacheData] = useState([]);
    const [cacheLoading, setCacheLoading] = useState(true);

    useEffect(() => {
        const fetchCacheData = async () => {
            try {
                const { data } = await dataProvider.getCacheKeys();
                setCacheData(data || []);
            } catch (error) {
                console.error('Error fetching cache data:', error);
                setCacheData([]);
            } finally {
                setCacheLoading(false);
            }
        };
        fetchCacheData();

        // Refresh cache data every 30 seconds
        const interval = setInterval(fetchCacheData, 30000);
        return () => clearInterval(interval);
    }, [dataProvider]);

    return (
        <CacheDataContext.Provider value={cacheData}>
            <Box sx={{ width: '100%' }}>
                {/* Chart above the list */}
                <Box sx={{ mb: 3, px: 2, pt: 2 }}>
                    <ActivityByTypeChart />
                </Box>

                {/* Use react-admin's List component like StyleList does */}
                <List
                    resource="statistics"
                    perPage={25}
                    sort={{ field: 'last_accessed_at', order: 'DESC' }}
                    actions={false}
                >
                    <Datagrid
                        rowClick={async (id, resource, record) => {
                            // Find the layer by name and navigate to its show page
                            try {
                                let layerData = await dataProvider.getList('layers', {
                                    filter: { layer_name: record.layer_name },
                                    pagination: { page: 1, perPage: 1 },
                                    sort: { field: 'id', order: 'ASC' }
                                });

                                if ((!layerData.data || layerData.data.length === 0) && !record.layer_name.endsWith('.tif')) {
                                    layerData = await dataProvider.getList('layers', {
                                        filter: { layer_name: `${record.layer_name}.tif` },
                                        pagination: { page: 1, perPage: 1 },
                                        sort: { field: 'id', order: 'ASC' }
                                    });
                                }

                                if ((!layerData.data || layerData.data.length === 0) && record.layer_name.endsWith('.tif')) {
                                    layerData = await dataProvider.getList('layers', {
                                        filter: { layer_name: record.layer_name.replace(/\.tif$/i, '') },
                                        pagination: { page: 1, perPage: 1 },
                                        sort: { field: 'id', order: 'ASC' }
                                    });
                                }

                                if (layerData.data && layerData.data.length > 0) {
                                    redirect('show', 'layers', layerData.data[0].id);
                                }
                            } catch (error) {
                                console.error('Error finding layer:', error);
                            }
                            return false; // Prevent default navigation
                        }}
                        bulkActionButtons={false}
                    >
                        <TextField source="layer_name" label="Layer Name" />
                        <CacheStatusField />
                        <DateField source="stat_date" label="Date" />
                        <NumberField source="total_requests" label="Total" />
                        <DateField source="last_accessed_at" label="Last Accessed" showTime />
                    </Datagrid>
                </List>
            </Box>
        </CacheDataContext.Provider>
    );
};
