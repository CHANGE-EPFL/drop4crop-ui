import {
    usePermissions,
    useGetList,
    Button,
    useRedirect,
    useDataProvider,
    useNotify,
} from 'react-admin';
import {
    Grid,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Box,
    Chip,
    LinearProgress,
    Avatar,
    IconButton,
    Divider
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
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Stats Card Component
const StatsCard = ({ title, value, subtitle, icon, color, progress, onClick }) => {
    return (
        <Card
            sx={{
                height: '100%',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': onClick ? {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                } : {}
            }}
            onClick={onClick}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                        sx={{
                            bgcolor: color,
                            width: 56,
                            height: 56,
                            mr: 2
                        }}
                    >
                        {icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography color="textSecondary" variant="body2" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div">
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" color="textSecondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>
                {progress !== undefined && (
                    <Box sx={{ mt: 2 }}>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'grey.200'
                            }}
                        />
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            {progress.toFixed(1)}% complete
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

// Recent Layers Component
const RecentLayersCard = ({ recentLayers, loading }) => {
    const navigate = useNavigate();

    const handleLayerClick = (layerId) => {
        navigate(`/admin/layers/${layerId}/show`);
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
                            onClick={() => navigate('/admin/layers')}
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem', mr: 1 }}>
                                            {layer.min_value?.toFixed(1)} → {layer.max_value?.toFixed(1)}
                                        </Typography>
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
                                    onClick={() => navigate('/admin/layers')}
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
    const navigate = useNavigate();
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
        navigate('/admin/layers');
    };

    const handleViewEnabledLayers = () => {
        navigate('/admin/layers?filter=%7B%22enabled%22%3Atrue%7D');
    };

    const handleViewDisabledLayers = () => {
        navigate('/admin/layers?filter=%7B%22enabled%22%3Afalse%7D');
    };

    const handleViewLayersWithoutStyles = () => {
        navigate('/admin/layers?filter=%7B%22style_id%22%3Anull%7D');
    };

    const handleViewStyles = () => {
        navigate('/admin/styles');
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
        <Box sx={{ flexGrow: 1, px: 3, py: 2 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                    Drop4Crop
                </Typography>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Total Layers"
                        value={totalLayers || 0}
                        subtitle="All layers in system"
                        icon={<LayersIcon />}
                        color="primary.main"
                        onClick={handleViewAllLayers}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Enabled Layers"
                        value={totalEnabledLayers || 0}
                        subtitle="Active and visible"
                        icon={<VisibilityIcon />}
                        color="success.main"
                        progress={enabledPercentage}
                        onClick={handleViewEnabledLayers}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Styles"
                        value={totalStyles || 0}
                        subtitle="Available styles"
                        icon={<StyleIcon />}
                        color="info.main"
                        onClick={handleViewStyles}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Need Styling"
                        value={totalLayersWithoutStyles || 0}
                        subtitle="Layers without styles"
                        icon={<WarningIcon />}
                        color="warning.main"
                        onClick={handleViewLayersWithoutStyles}
                    />
                </Grid>
            </Grid>

            {/* Section Divider */}
            <Divider sx={{ my: 4 }}>
                <Chip label="Statistics & Cache" color="primary" />
            </Divider>

            {/* Statistics & Cache Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Requests Today"
                        value={statsLoading ? '...' : (statsSummary?.total_requests_today || 0)}
                        subtitle="All layer accesses"
                        icon={<TimelineIcon />}
                        color="secondary.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Requests This Week"
                        value={statsLoading ? '...' : (statsSummary?.total_requests_week || 0)}
                        subtitle="Past 7 days"
                        icon={<TrendingUpIcon />}
                        color="success.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Cache Size"
                        value={statsLoading ? '...' : cacheInfo?.redis_connected ? `${cacheInfo.cache_size_mb.toFixed(1)} MB` : 'Offline'}
                        subtitle={cacheInfo?.cached_layers_count ? `${cacheInfo.cached_layers_count} layers` : 'No data'}
                        icon={<StorageIcon />}
                        color={cacheInfo?.redis_connected ? "info.main" : "error.main"}
                        onClick={() => navigate('/admin/cache')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Active Layers (24h)"
                        value={statsLoading ? '...' : (statsSummary?.active_layers_24h || 0)}
                        subtitle="Recently accessed"
                        icon={<SpeedIcon />}
                        color="warning.main"
                        onClick={() => navigate('/admin/statistics')}
                    />
                </Grid>
            </Grid>

            {/* Recent Layers - Use same Grid structure as stats */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <RecentLayersCard
                        recentLayers={layers}
                        loading={layersPending}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard;
