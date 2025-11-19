import {
    usePermissions,
    useGetList,
    Button,
    useRedirect,
    useDataProvider,
    useNotify,
} from 'react-admin';
import {
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Box,
    Chip,
    LinearProgress,
    Avatar,
    IconButton,
    Divider,
    Grid
} from '@mui/material';
import {
    Layers as LayersIcon,
    Style as StyleIcon,
    TrendingUp as TrendingUpIcon,
    Warning as WarningIcon,
    Upload as UploadIcon,
    Visibility as VisibilityIcon,
    Settings as SettingsIcon,
    Storage as StorageIcon,
    Timeline as TimelineIcon,
    Speed as SpeedIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Stats Card Component - Spacious Design
const StatsCard = ({ title, value, subtitle, icon, color, progress, onClick }) => {
    return (
        <Card
            sx={{
                height: '100%',
                transition: 'all 0.2s ease-in-out',
                cursor: onClick ? 'pointer' : 'default',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                '&:hover': onClick ? {
                    borderColor: 'primary.main',
                    boxShadow: 2
                } : {}
            }}
            onClick={onClick}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.02em' }}
                    >
                        {title}
                    </Typography>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            bgcolor: `${color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: color,
                            '& .MuiSvgIcon-root': {
                                fontSize: '1.4rem'
                            }
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
                <Typography variant="h3" component="div" sx={{ mb: 0.75, fontSize: '2.25rem', fontWeight: 600, lineHeight: 1.2 }}>
                    {value}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                        {subtitle}
                    </Typography>
                )}
                {progress !== undefined && (
                    <Box sx={{ mt: 2 }}>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: color,
                                    borderRadius: 3
                                }
                            }}
                        />
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', mt: 0.75, display: 'block' }}>
                            {progress.toFixed(0)}% enabled
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

// Activity Chart Component
const ActivityChart = ({ statsSummary, loading, redirect, totalLayers, totalEnabledLayers, totalLayersWithoutStyles, cacheInfo }) => {
    // Generate last 7 days data from real statistics
    const generateChartData = () => {
        if (!statsSummary) return [];

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = [];
        const now = new Date();

        // Create last 7 days array (including today)
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dayIndex = date.getDay();

            // For today, use the real total count
            // For other days, we don't have historical daily data, so show 0
            const requests = i === 0 ? (statsSummary.total_requests_today || 0) : 0;

            data.push({
                day: days[dayIndex],
                requests: requests,
                date: date.toISOString().split('T')[0]
            });
        }

        return data;
    };

    const chartData = generateChartData();

    return (
        <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="overline" sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', letterSpacing: '0.5px' }}>
                            Activity
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => redirect('/statistics')}
                            sx={{ color: 'primary.main', p: 0.5 }}
                        >
                            <TimelineIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Inline Stats */}
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                        <Tooltip title="Total Layers">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => redirect('/layers')}>
                                <LayersIcon sx={{ fontSize: '1rem', color: '#1976d2' }} />
                                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                    {totalLayers || 0}
                                </Typography>
                            </Box>
                        </Tooltip>
                        <Tooltip title="Enabled Layers">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => redirect('/layers?filter=' + encodeURIComponent(JSON.stringify({ enabled: true })))}>
                                <VisibilityIcon sx={{ fontSize: '1rem', color: '#2e7d32' }} />
                                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                    {totalEnabledLayers || 0}
                                </Typography>
                            </Box>
                        </Tooltip>
                        <Tooltip title="Layers Need Styling">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => redirect('/layers?filter=' + encodeURIComponent(JSON.stringify({ style_id: null })))}>
                                <WarningIcon sx={{ fontSize: '1rem', color: totalLayersWithoutStyles > 0 ? '#ed6c02' : '#1976d2' }} />
                                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                    {totalLayersWithoutStyles || 0}
                                </Typography>
                            </Box>
                        </Tooltip>
                        <Tooltip title={cacheInfo?.redis_connected ? `Cache Size: ${cacheInfo.cache_size_mb.toFixed(1)} MB (${cacheInfo.cached_layers_count} layers)` : 'Cache Disconnected'}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => redirect('/cache')}>
                                <StorageIcon sx={{ fontSize: '1rem', color: cacheInfo?.redis_connected ? '#0288d1' : '#d32f2f' }} />
                                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                    {loading ? '...' : cacheInfo?.redis_connected ? `${cacheInfo.cache_size_mb.toFixed(1)}MB` : 'Off'}
                                </Typography>
                            </Box>
                        </Tooltip>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 4, mb: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <Box sx={{ cursor: 'pointer' }} onClick={() => redirect('/statistics')}>
                        <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.2 }}>
                            {loading ? '...' : (statsSummary?.total_requests_week || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                            requests this week
                        </Typography>
                    </Box>
                    <Box sx={{ cursor: 'pointer' }} onClick={() => redirect('/statistics')}>
                        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '1.25rem', color: '#9c27b0', lineHeight: 1.2 }}>
                            {loading ? '...' : (statsSummary?.total_requests_today || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                            today
                        </Typography>
                    </Box>

                    {/* Offset layer stats to the right */}
                    <Box sx={{ flexGrow: 1, minWidth: '40px' }} />

                    <Box sx={{ cursor: 'pointer' }} onClick={() => redirect('/layers')}>
                        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.2 }}>
                            {totalLayers || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                            total layers
                        </Typography>
                    </Box>
                    <Box sx={{ cursor: 'pointer' }} onClick={() => redirect('/layers?filter=' + encodeURIComponent(JSON.stringify({ enabled: true })))}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                            <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '1.25rem', color: '#2e7d32', lineHeight: 1.2 }}>
                                {totalEnabledLayers || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#2e7d32', fontWeight: 500 }}>
                                ({totalLayers > 0 ? Math.round((totalEnabledLayers / totalLayers) * 100) : 0}%)
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                            enabled
                        </Typography>
                    </Box>
                    <Box sx={{ cursor: 'pointer' }} onClick={() => redirect('/layers?filter=' + encodeURIComponent(JSON.stringify({ style_id: null })))}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '1.25rem', color: totalLayersWithoutStyles > 0 ? '#ed6c02' : '#1976d2', lineHeight: 1.2 }}>
                                {totalLayersWithoutStyles || 0}
                            </Typography>
                            {totalLayersWithoutStyles > 0 && (
                                <WarningIcon sx={{ fontSize: '1.2rem', color: '#ed6c02' }} />
                            )}
                        </Box>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                            need styling
                        </Typography>
                    </Box>
                    <Box sx={{ cursor: 'pointer' }} onClick={() => redirect('/cache')}>
                        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '1.25rem', color: cacheInfo?.redis_connected ? '#0288d1' : '#d32f2f', lineHeight: 1.2 }}>
                            {loading ? '...' : cacheInfo?.redis_connected ? `${cacheInfo.cache_size_mb.toFixed(1)} MB` : 'Off'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                            cache {cacheInfo?.redis_connected && cacheInfo.cached_layers_count ? `(${cacheInfo.cached_layers_count} layers)` : ''}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ height: 120 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <XAxis
                                    dataKey="day"
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    stroke="#ddd"
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    stroke="#ddd"
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        fontSize: 13,
                                        borderRadius: 8,
                                        border: '1px solid #ddd',
                                        padding: '8px 12px'
                                    }}
                                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="requests"
                                    stroke="#9c27b0"
                                    strokeWidth={3}
                                    dot={{ fill: '#9c27b0', r: 4, strokeWidth: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

// Recent Layers Component
const RecentLayersCard = ({ recentLayers, loading, redirect }) => {
    const dataProvider = useDataProvider();
    const [layerStats, setLayerStats] = useState({});

    useEffect(() => {
        const fetchStats = async () => {
            if (!recentLayers || recentLayers.length === 0) return;

            try {
                const statsPromises = recentLayers.slice(0, 10).map(async (layer) => {
                    try {
                        const { data } = await dataProvider.getList('statistics', {
                            filter: { layer_name: layer.layer_name },
                            sort: { field: 'last_accessed_at', order: 'DESC' },
                            pagination: { page: 1, perPage: 1 }
                        });
                        return { layerId: layer.id, stats: data[0] };
                    } catch (error) {
                        return { layerId: layer.id, stats: null };
                    }
                });

                const results = await Promise.all(statsPromises);
                const statsMap = {};
                results.forEach(({ layerId, stats }) => {
                    statsMap[layerId] = stats;
                });
                setLayerStats(statsMap);
            } catch (error) {
                console.error('Error fetching layer stats:', error);
            }
        };

        fetchStats();
    }, [recentLayers, dataProvider]);

    const handleLayerClick = (layerId) => {
        redirect(`/layers/${layerId}/show`);
    };

    if (loading) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Recent Layers
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <UploadIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">
                            Recent Layers
                        </Typography>
                    </Box>
                    {recentLayers && recentLayers.length > 0 && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => redirect('/layers')}
                        >
                            View All
                        </Button>
                    )}
                </Box>
                {recentLayers && recentLayers.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {recentLayers.slice(0, 10).map((layer) => (
                            <Box
                                key={layer.id}
                                onClick={() => handleLayerClick(layer.id)}
                                sx={{
                                    p: 1.5,
                                    py: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    backgroundColor: 'background.paper',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    minHeight: 'auto',
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                        borderColor: 'primary.main',
                                        boxShadow: 1
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ flex: 1, mr: 3 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.25, color: 'primary.main', fontSize: '0.95rem' }}>
                                            {layer.layer_name || layer.filename}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center', mb: 0.25 }}>
                                            <Chip
                                                size="small"
                                                label={layer.crop}
                                                color="primary"
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem', height: '20px' }}
                                            />
                                            <Chip
                                                size="small"
                                                label={layer.variable}
                                                color="secondary"
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem', height: '20px' }}
                                            />
                                            <Chip
                                                size="small"
                                                label={layer.year?.toString()}
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem', height: '20px' }}
                                            />
                                            <Chip
                                                size="small"
                                                label={layer.scenario}
                                                color="info"
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem', height: '20px' }}
                                            />
                                            <Typography variant="caption" color="textSecondary" sx={{ ml: 1, fontSize: '0.7rem' }}>
                                                {layer.water_model} • {layer.climate_model}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {layerStats[layer.id] && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mr: 1 }}>
                                                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                                                    {layerStats[layer.id].total_requests?.toLocaleString()} hits
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                                                    {layerStats[layer.id].last_accessed_at
                                                        ? new Date(layerStats[layer.id].last_accessed_at).toLocaleString()
                                                        : 'Never accessed'}
                                                </Typography>
                                            </Box>
                                        )}
                                        <Chip
                                            size="small"
                                            color={layer.enabled ? 'success' : 'default'}
                                            label={layer.enabled ? 'Enabled' : 'Disabled'}
                                            variant={layer.enabled ? 'filled' : 'outlined'}
                                            sx={{ fontSize: '0.7rem', height: '20px' }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                        {recentLayers.length > 10 && (
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Button
                                    variant="text"
                                    color="primary"
                                    onClick={() => redirect('/layers')}
                                    sx={{ textTransform: 'none' }}
                                >
                                    View all {recentLayers.length} layers →
                                </Button>
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                        No recent layers found
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

const Dashboard = () => {
    const { permissions } = usePermissions();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();
    const [statsSummary, setStatsSummary] = useState(null);
    const [cacheInfo, setCacheInfo] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // Fetch statistics summary and cache info with auto-refresh
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [stats, cache] = await Promise.all([
                    dataProvider.getStatsSummary(),
                    dataProvider.getCacheInfo()
                ]);
                setStatsSummary(stats.data);
                setCacheInfo(cache.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [dataProvider]);

    // Fetch layers data
    const {
        data: layers,
        total: totalLayers,
        isPending: layersPending,
        error: layersError
    } = useGetList('layers', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'uploaded_at', order: 'DESC' }
    });

    // Fetch enabled layers
    const {
        data: enabledLayers,
        total: totalEnabledLayers,
        isPending: enabledLayersPending
    } = useGetList('layers', {
        filter: { enabled: true },
        pagination: { page: 1, perPage: 1 }
    });

    // Fetch disabled layers
    const {
        data: disabledLayers,
        total: totalDisabledLayers,
        isPending: disabledLayersPending
    } = useGetList('layers', {
        filter: { enabled: false },
        pagination: { page: 1, perPage: 1 }
    });

    // Fetch styles
    const {
        data: styles,
        total: totalStyles,
        isPending: stylesPending
    } = useGetList('styles', {
        pagination: { page: 1, perPage: 1 }
    });

    // Fetch layers without styles directly
    const {
        data: layersWithoutStyles,
        total: totalLayersWithoutStyles,
        isPending: layersWithoutStylesPending
    } = useGetList('layers', {
        filter: { style_id: null },
        pagination: { page: 1, perPage: 1 }
    });
    const enabledPercentage = totalLayers > 0 ? (totalEnabledLayers / totalLayers) * 100 : 0;
    const styledPercentage = totalLayers > 0 ? ((totalLayers - totalLayersWithoutStyles) / totalLayers) * 100 : 0;

    const isLoading = layersPending || enabledLayersPending || disabledLayersPending || stylesPending || layersWithoutStylesPending;

    // Navigation handlers
    const handleViewAllLayers = () => {
        redirect('/layers');
    };

    const handleViewEnabledLayers = () => {
        redirect('/layers?filter=' + encodeURIComponent(JSON.stringify({ enabled: true })));
    };

    const handleViewDisabledLayers = () => {
        redirect('/layers?filter=' + encodeURIComponent(JSON.stringify({ enabled: false })));
    };

    const handleViewLayersWithoutStyles = () => {
        redirect('/layers?filter=' + encodeURIComponent(JSON.stringify({ style_id: null })));
    };

    const handleViewStyles = () => {
        redirect('/styles');
    };

    if (permissions !== 'admin') {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                textAlign: 'center'
            }}>
                <Box>
                    <SettingsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="error" gutterBottom>
                        Access Restricted
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        This portal is only available to administrators.
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (isLoading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    if (layersError) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                textAlign: 'center'
            }}>
                <Box>
                    <WarningIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                    <Typography variant="h6" color="error" gutterBottom>
                        Error Loading Dashboard
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {layersError.message || 'Unable to load dashboard data'}
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, px: 3, py: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                    Drop4Crop
                </Typography>
            </Box>

            {/* Activity Chart - Full Width Row */}
            <Box sx={{ mb: 3 }}>
                <ActivityChart
                    statsSummary={statsSummary}
                    loading={statsLoading}
                    redirect={redirect}
                    totalLayers={totalLayers}
                    totalEnabledLayers={totalEnabledLayers}
                    totalLayersWithoutStyles={totalLayersWithoutStyles}
                    cacheInfo={cacheInfo}
                />
            </Box>

            {/* Recent Layers - Full Width Row */}
            <Box>
                <RecentLayersCard
                    recentLayers={layers}
                    loading={layersPending}
                    redirect={redirect}
                />
            </Box>
        </Box>
    );
}

export default Dashboard;
