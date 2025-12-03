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
    Speed as SpeedIcon,
    Map as MapIcon
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
        if (!statsSummary || !statsSummary.daily_requests) return [];

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Use the daily_requests from the API response
        // Use Math.max(1, requests) because log scale can't handle 0
        return statsSummary.daily_requests.map((item: { date: string; requests: number }) => {
            const date = new Date(item.date + 'T00:00:00');
            const dayIndex = date.getDay();
            return {
                day: days[dayIndex],
                requests: Math.max(1, item.requests),
                date: item.date
            };
        });
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
                                    scale="log"
                                    domain={[1, 'auto']}
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    stroke="#ddd"
                                    tickLine={false}
                                    allowDecimals={false}
                                    allowDataOverflow
                                    label={{ value: 'log', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#999' }}
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

// Most Visited Layers Component
const MostVisitedLayersCard = ({ layers, loading, redirect, totalLayers }) => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const [cachedLayerIds, setCachedLayerIds] = useState<Set<string>>(new Set());
    const [persistedLayerIds, setPersistedLayerIds] = useState<Set<string>>(new Set());
    const [cacheData, setCacheData] = useState<Record<string, any>>({});
    const [cacheLoading, setCacheLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        const fetchCacheData = async () => {
            if (!layers || layers.length === 0) {
                setCacheLoading(false);
                return;
            }

            try {
                const cacheResult = await dataProvider.getCacheKeys();

                // Build set of cached layer IDs and persisted layer IDs
                const cachedIds = new Set<string>();
                const persistedIds = new Set<string>();
                const cacheMap: Record<string, any> = {};
                (cacheResult.data || []).forEach((cached: any) => {
                    if (cached.layer_id) {
                        cachedIds.add(cached.layer_id);
                        cacheMap[cached.layer_id] = cached;
                        // If ttl_seconds is null/undefined, it's persisted (no expiry)
                        if (cached.ttl_seconds === null || cached.ttl_seconds === undefined) {
                            persistedIds.add(cached.layer_id);
                        }
                    }
                });
                setCachedLayerIds(cachedIds);
                setPersistedLayerIds(persistedIds);
                setCacheData(cacheMap);
            } catch (error) {
                console.error('Error fetching cache data:', error);
            } finally {
                setCacheLoading(false);
            }
        };

        fetchCacheData();
    }, [layers, dataProvider]);

    const handleLayerClick = (layerId: string) => {
        redirect(`/layers/${layerId}/show`);
    };

    const handleWarmCache = async (e: React.MouseEvent, layer: any) => {
        e.stopPropagation();
        setActionLoading(layer.id);
        try {
            await dataProvider.warmLayerCache(layer.layer_name);
            notify('Layer cached successfully', { type: 'success', autoHideDuration: 3000 });
            // Refresh cache data
            const cacheResult = await dataProvider.getCacheKeys();
            const cachedIds = new Set<string>();
            const persistedIds = new Set<string>();
            const cacheMap: Record<string, any> = {};
            (cacheResult.data || []).forEach((cached: any) => {
                if (cached.layer_id) {
                    cachedIds.add(cached.layer_id);
                    cacheMap[cached.layer_id] = cached;
                    if (cached.ttl_seconds === null || cached.ttl_seconds === undefined) {
                        persistedIds.add(cached.layer_id);
                    }
                }
            });
            setCachedLayerIds(cachedIds);
            setPersistedLayerIds(persistedIds);
            setCacheData(cacheMap);
        } catch (error) {
            notify('Failed to cache layer', { type: 'error', autoHideDuration: 3000 });
        } finally {
            setActionLoading(null);
        }
    };

    const handlePersistCache = async (e: React.MouseEvent, layer: any) => {
        e.stopPropagation();
        setActionLoading(layer.id);
        try {
            const result = await dataProvider.persistLayerCache(layer.layer_name);
            if (result.data.persisted) {
                notify('Cache is now permanent (will not expire)', { type: 'success', autoHideDuration: 3000 });
                // Refresh cache data to update UI
                const cacheResult = await dataProvider.getCacheKeys();
                const cachedIds = new Set<string>();
                const persistedIds = new Set<string>();
                const cacheMap: Record<string, any> = {};
                (cacheResult.data || []).forEach((cached: any) => {
                    if (cached.layer_id) {
                        cachedIds.add(cached.layer_id);
                        cacheMap[cached.layer_id] = cached;
                        if (cached.ttl_seconds === null || cached.ttl_seconds === undefined) {
                            persistedIds.add(cached.layer_id);
                        }
                    }
                });
                setCachedLayerIds(cachedIds);
                setPersistedLayerIds(persistedIds);
                setCacheData(cacheMap);
            } else {
                notify(result.data.message, { type: 'warning', autoHideDuration: 3000 });
            }
        } catch (error) {
            notify('Failed to make cache permanent', { type: 'error', autoHideDuration: 3000 });
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnpersistCache = async (e: React.MouseEvent, layer: any) => {
        e.stopPropagation();
        setActionLoading(layer.id);
        try {
            const result = await dataProvider.unpersistLayerCache(layer.layer_name);
            notify(`Cache will expire in ${(result.data.ttl_seconds / 3600).toFixed(1)} hours`, { type: 'success', autoHideDuration: 3000 });
            // Refresh cache data to get updated TTL
            const cacheResult = await dataProvider.getCacheKeys();
            const cachedIds = new Set<string>();
            const persistedIds = new Set<string>();
            const cacheMap: Record<string, any> = {};
            (cacheResult.data || []).forEach((cached: any) => {
                if (cached.layer_id) {
                    cachedIds.add(cached.layer_id);
                    cacheMap[cached.layer_id] = cached;
                    if (cached.ttl_seconds === null || cached.ttl_seconds === undefined) {
                        persistedIds.add(cached.layer_id);
                    }
                }
            });
            setCachedLayerIds(cachedIds);
            setPersistedLayerIds(persistedIds);
            setCacheData(cacheMap);
        } catch (error) {
            notify('Failed to restore cache expiry', { type: 'error', autoHideDuration: 3000 });
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Most Visited Layers
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
                        <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">
                            Most Visited Layers
                        </Typography>
                    </Box>
                    {layers && layers.length > 0 && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => redirect('/layers')}
                        >
                            View All
                        </Button>
                    )}
                </Box>
                {layers && layers.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {layers.map((layer: any) => {
                            // Build map URL
                            const params = new URLSearchParams();
                            if (layer.crop) params.set('crop', layer.crop);
                            if (layer.water_model) params.set('water_model', layer.water_model);
                            if (layer.climate_model) params.set('climate_model', layer.climate_model);
                            if (layer.scenario) params.set('scenario', layer.scenario);
                            if (layer.variable) params.set('variable', layer.variable);
                            if (layer.year) params.set('year', layer.year.toString());
                            const mapUrl = `/?${params.toString()}`;

                            return (
                                <Box
                                    key={layer.id}
                                    onClick={() => handleLayerClick(layer.id)}
                                    sx={{
                                        px: 1.5,
                                        py: 0.75,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        backgroundColor: 'background.paper',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease-in-out',
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {/* Left side: Name and metadata chips */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: 'primary.main',
                                                    fontSize: '0.85rem',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '280px'
                                                }}
                                            >
                                                {layer.layer_name || layer.filename}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
                                                {layer.crop && (
                                                    <Chip size="small" label={layer.crop} color="primary" variant="outlined" sx={{ fontSize: '0.65rem', height: '18px' }} />
                                                )}
                                                {layer.variable && (
                                                    <Chip size="small" label={layer.variable} color="secondary" variant="outlined" sx={{ fontSize: '0.65rem', height: '18px' }} />
                                                )}
                                                {layer.year && (
                                                    <Chip size="small" label={layer.year.toString()} variant="outlined" sx={{ fontSize: '0.65rem', height: '18px' }} />
                                                )}
                                                {layer.scenario && (
                                                    <Chip size="small" label={layer.scenario} color="info" variant="outlined" sx={{ fontSize: '0.65rem', height: '18px' }} />
                                                )}
                                            </Box>
                                        </Box>
                                        {/* Right side: Stats, cache, status, and map button */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                                            {/* View count */}
                                            <Chip
                                                size="small"
                                                icon={<VisibilityIcon sx={{ fontSize: '0.8rem !important' }} />}
                                                label={(layer.total_views || 0).toLocaleString()}
                                                color="secondary"
                                                variant="filled"
                                                sx={{ fontSize: '0.7rem', fontWeight: 600, height: '22px', minWidth: '65px' }}
                                            />
                                            {/* Cache status */}
                                            {cachedLayerIds.has(layer.id) ? (
                                                <Chip
                                                    size="small"
                                                    icon={<StorageIcon sx={{ fontSize: '0.8rem !important' }} />}
                                                    label={persistedLayerIds.has(layer.id) ? 'Pinned' : `${cacheData[layer.id]?.ttl_hours?.toFixed(1) || '?'}h`}
                                                    color={persistedLayerIds.has(layer.id) ? 'success' : 'info'}
                                                    variant="filled"
                                                    onClick={(e) => persistedLayerIds.has(layer.id) ? handleUnpersistCache(e, layer) : handlePersistCache(e, layer)}
                                                    disabled={actionLoading === layer.id}
                                                    sx={{ fontSize: '0.65rem', height: '22px', minWidth: '65px', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                                                />
                                            ) : (
                                                <Chip
                                                    size="small"
                                                    icon={actionLoading === layer.id ? <CircularProgress size={10} color="inherit" /> : <StorageIcon sx={{ fontSize: '0.8rem !important' }} />}
                                                    label="Cache"
                                                    color="default"
                                                    variant="outlined"
                                                    onClick={(e) => handleWarmCache(e, layer)}
                                                    disabled={actionLoading === layer.id}
                                                    sx={{ fontSize: '0.65rem', height: '22px', minWidth: '65px', cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                                                />
                                            )}
                                            {/* Enabled status */}
                                            <Chip
                                                size="small"
                                                color={layer.enabled ? 'success' : 'default'}
                                                label={layer.enabled ? 'Enabled' : 'Disabled'}
                                                variant={layer.enabled ? 'filled' : 'outlined'}
                                                sx={{ fontSize: '0.65rem', height: '22px', minWidth: '60px' }}
                                            />
                                            {/* Map button */}
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (layer.enabled) {
                                                        window.open(mapUrl, '_blank');
                                                    }
                                                }}
                                                disabled={!layer.enabled}
                                                sx={{ p: 0.5, color: layer.enabled ? 'primary.main' : 'action.disabled' }}
                                            >
                                                <MapIcon sx={{ fontSize: '1.1rem' }} />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                        {totalLayers > 10 && (
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Button
                                    variant="text"
                                    color="primary"
                                    onClick={() => redirect('/layers')}
                                    sx={{ textTransform: 'none' }}
                                >
                                    View all {totalLayers.toLocaleString()} layers →
                                </Button>
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                        No layers found
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

    // Fetch most viewed layers (sorted by total_views descending)
    const {
        data: mostViewedLayers,
        total: totalLayers,
        isPending: layersPending,
        error: layersError
    } = useGetList('layers', {
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'total_views', order: 'DESC' }
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

            {/* Most Visited Layers - Full Width Row */}
            <Box>
                <MostVisitedLayersCard
                    layers={mostViewedLayers}
                    loading={layersPending}
                    redirect={redirect}
                    totalLayers={totalLayers}
                />
            </Box>
        </Box>
    );
}

export default Dashboard;
