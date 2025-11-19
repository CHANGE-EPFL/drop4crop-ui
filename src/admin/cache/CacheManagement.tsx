import { useState, useEffect } from 'react';
import { useDataProvider, useNotify, Title, useRedirect } from 'react-admin';
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
    const redirect = useRedirect();

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

    return (
        <Box sx={{ p: 3 }}>
            <Title title="Cache Management" />

            {/* Cached Layers Table */}
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Cached Layers
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Chip
                                icon={cacheInfo?.redis_connected ? <CheckCircleIcon /> : <ErrorIcon />}
                                label={cacheInfo?.redis_connected ? 'Connected' : 'Disconnected'}
                                color={cacheInfo?.redis_connected ? 'success' : 'error'}
                                size="small"
                            />
                            <Typography variant="body2">
                                <strong>{cacheInfo?.cache_size_mb?.toFixed(1) || '0'} MB</strong> cached
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {cacheInfo?.cached_layers_count || 0} layers
                            </Typography>
                            <IconButton
                                color="error"
                                size="small"
                                onClick={() => setClearAllDialogOpen(true)}
                                disabled={!cacheInfo?.redis_connected || cacheInfo?.cached_layers_count === 0}
                                title="Clear all cache"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    {cacheKeys.length > 0 ? (
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table size="small">
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
                                            sx={{ cursor: item.layer_id ? 'pointer' : 'default' }}
                                            onClick={() => {
                                                if (item.layer_id) {
                                                    redirect('show', 'layers', item.layer_id);
                                                } else {
                                                    notify(`Layer not found in database: ${item.layer_name}`, { type: 'warning' });
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (item.layer_id) {
                                                                redirect('show', 'layers', item.layer_id);
                                                            } else {
                                                                notify(`Layer not found in database: ${item.layer_name}`, { type: 'warning' });
                                                            }
                                                        }}
                                                    >
                                                        <LayersIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="View Statistics">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (item.layer_id) {
                                                                redirect('show', 'layers', item.layer_id, {}, { tab: 1 });
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openClearLayerDialog(item.layer_name);
                                                        }}
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
