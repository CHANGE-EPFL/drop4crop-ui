import {
    Show,
    TextField,
    DateField,
    NumberField,
    useShowController,
    useDataProvider,
    Loading,
    TopToolbar,
    ListButton,
} from 'react-admin';
import {
    Card,
    CardContent,
    Grid,
    Typography,
    Box,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Alert,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    CalendarToday as CalendarIcon,
    Layers as LayersIcon,
    Storage as StorageIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ShowActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

export const StatisticsShow = () => {
    const { record, isLoading } = useShowController();
    const dataProvider = useDataProvider();
    const navigate = useNavigate();
    const [timelineData, setTimelineData] = useState([]);
    const [timelineLoading, setTimelineLoading] = useState(true);
    const [cacheStatus, setCacheStatus] = useState(null);

    useEffect(() => {
        if (record?.id) {
            const fetchTimeline = async () => {
                try {
                    const { data } = await dataProvider.getStatsTimeline(record.id);
                    setTimelineData(data);
                } catch (error) {
                    console.error('Error fetching timeline:', error);
                } finally {
                    setTimelineLoading(false);
                }
            };
            fetchTimeline();
        }
    }, [record, dataProvider]);

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

    if (isLoading) return <Loading />;
    if (!record) return null;

    // Prepare data for pie chart (request type breakdown)
    const pieData = [
        { name: 'XYZ Tiles', value: record.xyz_tile_count },
        { name: 'COG Downloads', value: record.cog_download_count },
        { name: 'Pixel Queries', value: record.pixel_query_count },
        { name: 'STAC Requests', value: record.stac_request_count },
        { name: 'Other', value: record.other_request_count },
    ].filter(item => item.value > 0);

    return (
        <Show actions={<ShowActions />} title={`Statistics: ${record.layer_name}`}>
            <Box sx={{ p: 2 }}>
                {/* Quick Actions */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<LayersIcon />}
                        onClick={async () => {
                            try {
                                // Try finding layer with exact name first
                                let layerData = await dataProvider.getList('layers', {
                                    filter: { layer_name: record.layer_name },
                                    pagination: { page: 1, perPage: 1 },
                                    sort: { field: 'id', order: 'ASC' }
                                });

                                // If not found, try with .tif extension
                                if ((!layerData.data || layerData.data.length === 0) && !record.layer_name.endsWith('.tif')) {
                                    layerData = await dataProvider.getList('layers', {
                                        filter: { layer_name: `${record.layer_name}.tif` },
                                        pagination: { page: 1, perPage: 1 },
                                        sort: { field: 'id', order: 'ASC' }
                                    });
                                }

                                // If not found, try without .tif extension
                                if ((!layerData.data || layerData.data.length === 0) && record.layer_name.endsWith('.tif')) {
                                    layerData = await dataProvider.getList('layers', {
                                        filter: { layer_name: record.layer_name.replace(/\.tif$/i, '') },
                                        pagination: { page: 1, perPage: 1 },
                                        sort: { field: 'id', order: 'ASC' }
                                    });
                                }

                                if (layerData.data && layerData.data.length > 0) {
                                    navigate(`/admin/layers/${layerData.data[0].id}/show`);
                                }
                            } catch (error) {
                                console.error('Error finding layer:', error);
                            }
                        }}
                    >
                        View Layer
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<StorageIcon />}
                        onClick={() => navigate('/admin/cache')}
                    >
                        View Cache
                    </Button>
                </Box>

                {/* Cache Status Alert */}
                {cacheStatus ? (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        <strong>Cached:</strong> {cacheStatus.size_mb?.toFixed(2)} MB •
                        TTL: {cacheStatus.ttl_hours?.toFixed(1)} hours remaining
                    </Alert>
                ) : (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        This layer is not currently cached
                    </Alert>
                )}

                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <CalendarIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                    Layer Information
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="textSecondary">Layer Name</Typography>
                                    <Typography variant="h6" sx={{ mb: 2 }}>{record.layer_name}</Typography>

                                    <Typography variant="body2" color="textSecondary">Date</Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>{record.stat_date}</Typography>

                                    <Typography variant="body2" color="textSecondary">Last Accessed</Typography>
                                    <Typography variant="body1">{new Date(record.last_accessed_at).toLocaleString()}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <TrendingUpIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                    Total Requests
                                </Typography>
                                <Typography variant="h3" color="primary" sx={{ mt: 2 }}>
                                    {record.total_requests}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                    All access types combined
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Request Type Breakdown */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Request Type Breakdown
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Request Details
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell><strong>XYZ Tiles</strong></TableCell>
                                                <TableCell align="right">{record.xyz_tile_count}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>COG Downloads</strong></TableCell>
                                                <TableCell align="right">{record.cog_download_count}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>Pixel Queries</strong></TableCell>
                                                <TableCell align="right">{record.pixel_query_count}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>STAC Requests</strong></TableCell>
                                                <TableCell align="right">{record.stac_request_count}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>Other Requests</strong></TableCell>
                                                <TableCell align="right">{record.other_request_count}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Timeline Chart */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Historical Timeline
                        </Typography>
                        {timelineLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <Typography>Loading timeline data...</Typography>
                            </Box>
                        ) : timelineData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={timelineData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="stat_date" />
                                    <YAxis />
                                    <Tooltip />
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
                    </CardContent>
                </Card>
            </Box>
        </Show>
    );
};
