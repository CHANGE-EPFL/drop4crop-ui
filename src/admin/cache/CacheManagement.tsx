import { useState, useEffect } from 'react';
import { useDataProvider, useNotify, Title } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    Grid,
    Typography,
    Box,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    LinearProgress,
    CircularProgress,
    Tooltip,
    Alert,
} from '@mui/material';
import {
    Storage as StorageIcon,
    Delete as DeleteIcon,
    Timer as TimerIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Speed as SpeedIcon,
    Layers as LayersIcon,
    BarChart as BarChartIcon,
} from '@mui/icons-material';

export const CacheManagement = () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const navigate = useNavigate();

    const [cacheInfo, setCacheInfo] = useState(null);
    const [cacheKeys, setCacheKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
    const [clearLayerDialogOpen, setClearLayerDialogOpen] = useState(false);
    const [selectedLayer, setSelectedLayer] = useState(null);

    const fetchCacheData = async () => {
        setLoading(true);
        try {
            const [infoResponse, keysResponse] = await Promise.all([
                dataProvider.getCacheInfo(),
                dataProvider.getCacheKeys(),
            ]);
            setCacheInfo(infoResponse.data);
            setCacheKeys(keysResponse.data);
        } catch (error) {
            notify('Error loading cache data', { type: 'error' });
            console.error('Cache fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCacheData();

        // Auto-refresh every 10 seconds
        const interval = setInterval(() => {
            fetchCacheData();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleClearAll = async () => {
        try {
            await dataProvider.clearAllCache();
            notify('Cache cleared successfully', { type: 'success' });
            setClearAllDialogOpen(false);
            fetchCacheData();
        } catch (error) {
            notify('Error clearing cache', { type: 'error' });
            console.error('Clear cache error:', error);
        }
    };

    const handleClearLayer = async () => {
        if (!selectedLayer) return;
        try {
            await dataProvider.clearLayerCache(selectedLayer);
            notify(`Cache cleared for layer: ${selectedLayer}`, { type: 'success' });
            setClearLayerDialogOpen(false);
            setSelectedLayer(null);
            fetchCacheData();
        } catch (error) {
            notify('Error clearing layer cache', { type: 'error' });
            console.error('Clear layer cache error:', error);
        }
    };

    const openClearLayerDialog = (layerName) => {
        setSelectedLayer(layerName);
        setClearLayerDialogOpen(true);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const cacheUsagePercent = cacheInfo?.redis_connected
        ? Math.min((cacheInfo.cache_size_mb / 1024) * 100, 100)
        : 0;

    return (
        <Box sx={{ p: 3 }}>
            <Title title="Cache Management" />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Cache Management
                </Typography>
                <IconButton
                    color="error"
                    onClick={() => setClearAllDialogOpen(true)}
                    disabled={!cacheInfo?.redis_connected || cacheInfo?.cached_layers_count === 0}
                    title="Clear all cache"
                    sx={{
                        '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'white'
                        }
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </Box>

            {/* Status Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                {cacheInfo?.redis_connected ? (
                                    <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                                ) : (
                                    <ErrorIcon sx={{ color: 'error.main', mr: 1 }} />
                                )}
                                <Typography variant="h6">
                                    Redis Status
                                </Typography>
                            </Box>
                            <Chip
                                label={cacheInfo?.redis_connected ? 'Connected' : 'Disconnected'}
                                color={cacheInfo?.redis_connected ? 'success' : 'error'}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <StorageIcon sx={{ color: 'primary.main', mr: 1 }} />
                                <Typography variant="h6">Cache Size</Typography>
                            </Box>
                            <Typography variant="h4">
                                {cacheInfo?.cache_size_mb?.toFixed(1) || '0'} MB
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={cacheUsagePercent}
                                sx={{ mt: 2 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <SpeedIcon sx={{ color: 'info.main', mr: 1 }} />
                                <Typography variant="h6">Cached Layers</Typography>
                            </Box>
                            <Typography variant="h4">
                                {cacheInfo?.cached_layers_count || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TimerIcon sx={{ color: 'warning.main', mr: 1 }} />
                                <Typography variant="h6">Current TTL</Typography>
                            </Box>
                            <Typography variant="h4">
                                {(cacheInfo?.current_ttl_seconds / 3600).toFixed(0) || '0'} hrs
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Cached Layers Table */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Cached Layers
                    </Typography>
                    {cacheKeys.length > 0 ? (
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Layer Name</strong></TableCell>
                                        <TableCell><strong>Size</strong></TableCell>
                                        <TableCell><strong>TTL Remaining</strong></TableCell>
                                        <TableCell><strong>Cache Key</strong></TableCell>
                                        <TableCell align="right"><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {cacheKeys.map((item, index) => (
                                        <TableRow
                                            key={index}
                                            hover
                                            sx={{ cursor: 'pointer' }}
                                            onClick={async () => {
                                                try {
                                                    let layerData = await dataProvider.getList('layers', {
                                                        filter: { layer_name: item.layer_name },
                                                        pagination: { page: 1, perPage: 1 },
                                                        sort: { field: 'id', order: 'ASC' }
                                                    });

                                                    if ((!layerData.data || layerData.data.length === 0) && item.layer_name.endsWith('.tif')) {
                                                        layerData = await dataProvider.getList('layers', {
                                                            filter: { layer_name: item.layer_name.replace(/\.tif$/i, '') },
                                                            pagination: { page: 1, perPage: 1 },
                                                            sort: { field: 'id', order: 'ASC' }
                                                        });
                                                    }

                                                    if ((!layerData.data || layerData.data.length === 0) && !item.layer_name.endsWith('.tif')) {
                                                        layerData = await dataProvider.getList('layers', {
                                                            filter: { layer_name: `${item.layer_name}.tif` },
                                                            pagination: { page: 1, perPage: 1 },
                                                            sort: { field: 'id', order: 'ASC' }
                                                        });
                                                    }

                                                    if (layerData.data && layerData.data.length > 0) {
                                                        navigate(`/admin/layers/${layerData.data[0].id}/show`);
                                                    } else {
                                                        notify(`Layer not found: ${item.layer_name}`, { type: 'warning' });
                                                    }
                                                } catch (error) {
                                                    console.error('Error finding layer:', error);
                                                    notify(`Error finding layer: ${error.message}`, { type: 'error' });
                                                }
                                            }}
                                        >
                                            <TableCell>{item.layer_name}</TableCell>
                                            <TableCell>
                                                {item.size_mb !== null && item.size_mb !== undefined ? (
                                                    <Chip
                                                        label={`${item.size_mb.toFixed(2)} MB`}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color="textSecondary">N/A</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {item.ttl_hours !== null && item.ttl_hours !== undefined ? (
                                                    <Chip
                                                        label={`${item.ttl_hours.toFixed(1)} hrs`}
                                                        size="small"
                                                        color={item.ttl_hours < 1 ? "warning" : "success"}
                                                        variant="outlined"
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="No expiry"
                                                        size="small"
                                                        color="default"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                    {item.cache_key}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="View Layer">
                                                    <IconButton
                                                        size="small"
                                                        onClick={async () => {
                                                            try {
                                                                console.log('Looking for layer:', item.layer_name);

                                                                // Try finding layer with exact name first
                                                                let layerData = await dataProvider.getList('layers', {
                                                                    filter: { layer_name: item.layer_name },
                                                                    pagination: { page: 1, perPage: 1 },
                                                                    sort: { field: 'id', order: 'ASC' }
                                                                });

                                                                // If not found and cache has .tif, try without it
                                                                if ((!layerData.data || layerData.data.length === 0) && item.layer_name.endsWith('.tif')) {
                                                                    const nameWithoutExt = item.layer_name.replace(/\.tif$/i, '');
                                                                    console.log('Trying without extension:', nameWithoutExt);
                                                                    layerData = await dataProvider.getList('layers', {
                                                                        filter: { layer_name: nameWithoutExt },
                                                                        pagination: { page: 1, perPage: 1 },
                                                                        sort: { field: 'id', order: 'ASC' }
                                                                    });
                                                                }

                                                                // If still not found and cache doesn't have .tif, try with it
                                                                if ((!layerData.data || layerData.data.length === 0) && !item.layer_name.endsWith('.tif')) {
                                                                    const nameWithExt = `${item.layer_name}.tif`;
                                                                    console.log('Trying with .tif extension:', nameWithExt);
                                                                    layerData = await dataProvider.getList('layers', {
                                                                        filter: { layer_name: nameWithExt },
                                                                        pagination: { page: 1, perPage: 1 },
                                                                        sort: { field: 'id', order: 'ASC' }
                                                                    });
                                                                }

                                                                console.log('Layers response:', layerData.data);
                                                                if (layerData.data && layerData.data.length > 0) {
                                                                    navigate(`/admin/layers/${layerData.data[0].id}/show`);
                                                                } else {
                                                                    console.error('No layers found for:', item.layer_name);
                                                                    notify(`Layer not found in database: ${item.layer_name}`, { type: 'warning' });
                                                                }
                                                            } catch (error) {
                                                                console.error('Error finding layer:', error, error.message);
                                                                notify(`Error finding layer: ${error.message}`, { type: 'error' });
                                                            }
                                                        }}
                                                    >
                                                        <LayersIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="View Statistics">
                                                    <IconButton
                                                        size="small"
                                                        onClick={async () => {
                                                            try {
                                                                const { data } = await dataProvider.getList('statistics', {
                                                                    filter: { layer_name: item.layer_name },
                                                                    sort: { field: 'stat_date', order: 'DESC' },
                                                                    pagination: { page: 1, perPage: 1 }
                                                                });
                                                                if (data && data.length > 0) {
                                                                    navigate(`/admin/statistics/${data[0].id}/show`);
                                                                } else {
                                                                    navigate(`/admin/statistics?filter=${encodeURIComponent(JSON.stringify({ layer_name: item.layer_name }))}`);
                                                                }
                                                            } catch (error) {
                                                                console.error('Error finding statistics:', error);
                                                            }
                                                        }}
                                                    >
                                                        <BarChartIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Clear Cache">
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={() => openClearLayerDialog(item.layer_name)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            No cached layers found
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Clear All Dialog */}
            <Dialog open={clearAllDialogOpen} onClose={() => setClearAllDialogOpen(false)}>
                <DialogTitle>Clear All Cache?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will remove all {cacheInfo?.cached_layers_count || 0} cached layers from Redis.
                        This action cannot be undone. Layers will be re-downloaded from S3 on next access.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClearAllDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleClearAll} color="error" variant="contained">
                        Clear All
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Clear Layer Dialog */}
            <Dialog open={clearLayerDialogOpen} onClose={() => setClearLayerDialogOpen(false)}>
                <DialogTitle>Clear Layer Cache?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will remove the cache for layer: <strong>{selectedLayer}</strong>
                        <br />
                        The layer will be re-downloaded from S3 on next access.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClearLayerDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleClearLayer} color="error" variant="contained">
                        Clear Cache
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
