import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    FunctionField,
    useDataProvider,
    useNotify,
    TopToolbar,
    FilterButton,
    CreateButton,
    ExportButton,
    SelectColumnsButton,
    Button,
    useRefresh,
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
                                sx={{
                                    p: 2,
                                    mb: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    backgroundColor: 'background.paper',
                                    transition: 'all 0.2s ease-in-out',
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
                                                    onClick={() => navigate(`/admin/layers/${stat.layer_id}/show`)}
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

const ListActions = () => {
    const refresh = useRefresh();
    return (
        <TopToolbar>
            <FilterButton />
            <Button label="Refresh" onClick={() => refresh()}>
                <RefreshIcon />
            </Button>
        </TopToolbar>
    );
};

export const StatisticsList = () => {
    const dataProvider = useDataProvider();
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
        <Box sx={{ p: 2 }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                    <LiveStatsCard />
                </Grid>
            </Grid>

            <Alert severity="info" sx={{ mb: 3 }}>
                Statistics below are updated every 5 minutes. For real-time data, see the "Live Statistics (Today)" section above.
            </Alert>

            <CacheDataContext.Provider value={cacheData}>
                <List
                    filters={StatisticsFilters}
                    actions={<ListActions />}
                    resource="statistics"
                    basePath="/statistics"
                    perPage={25}
                    sort={{ field: 'last_accessed_at', order: 'DESC' }}
                    title="Layer Statistics"
                >
                    <Datagrid
                        rowClick={async (id, resource, record) => {
                            // Find the layer by name and navigate to its show page with statistics tab
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
                                    return `/admin/layers/${layerData.data[0].id}/show`;
                                }
                            } catch (error) {
                                console.error('Error finding layer:', error);
                            }
                            return false; // Don't navigate if layer not found
                        }}
                        bulkActionButtons={false}
                    >
                        <TextField source="layer_name" label="Layer Name" />
                        <CacheStatusField />
                        <DateField source="stat_date" label="Date" />
                        <NumberField source="xyz_tile_count" label="XYZ Tiles" />
                        <NumberField source="cog_download_count" label="COG Downloads" />
                        <NumberField source="pixel_query_count" label="Pixel Queries" />
                        <NumberField source="stac_request_count" label="STAC Requests" />
                        <NumberField source="other_request_count" label="Other" />
                        <NumberField source="total_requests" label="Total" />
                        <DateField source="last_accessed_at" label="Last Accessed" showTime />
                    </Datagrid>
                </List>
            </CacheDataContext.Provider>
        </Box>
    );
};
