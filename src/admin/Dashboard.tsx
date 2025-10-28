import {
    usePermissions,
    useGetList,
    Button,
    useRedirect,
    useDataProvider,
    useNotify,
} from 'react-admin';
import { Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import dataProvider from './dataProvider/index';
const Dashboard = () => {
    const { permissions } = usePermissions();
    const {
        data,
        total,
        isPending,
        error
    } = useGetList('layers');

    const {
        data: enabledLayers,
        total: totalEnabledLayers,
        isPending: enabledLayersIsPending,
        error: enabledLayersError
    } = useGetList('layers', {
        filter: { enabled: true }
    });

    const {
        data: styles,
        total: totalStyles,
        isPending: stylesIsPending,
        error: stylesError
    } = useGetList('layers', {
        filter: { style: null }
    });

    const totalLayersWithoutStyles = total - totalStyles;
    const navigate = useNavigate();
    const redirect = useRedirect();
    const notify = useNotify();
    const dataProvider = useDataProvider();

    const handleRedirectDisabledLayers = () => {
        // Use react-admin redirect with URL-encoded filter
        redirect('list', 'layers', {}, {
            search: '?filter=%7B%22enabled%22%3Afalse%7D'
        });
    }

    const handleRedirectAllLayers = () => {
        redirect('list', 'layers');
    }

    if (isPending || enabledLayersIsPending) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
        </Box>
    );
    if (!data) return null;
    if (error) return <p>Error: {error}</p>;

    return (
        <>{
            (permissions === 'admin') ?
                (
                    <>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Box sx={{ flex: 1, textAlign: 'center', mb: 3 }}>
                                    <Typography
                                        variant="h4"
                                        gutterBottom>
                                        Drop4Crop Admin
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" color="primary" gutterBottom>
                                                    Layers Overview
                                                </Typography>
                                                <Typography variant="h4" gutterBottom>
                                                    {totalEnabledLayers} / {total}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                                    ({(totalEnabledLayers / total * 100).toFixed(2)}% enabled)
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={handleRedirectAllLayers}
                                                    fullWidth
                                                    sx={{ mb: 1 }}
                                                >
                                                    View All Layers
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={handleRedirectDisabledLayers}
                                                    fullWidth
                                                >
                                                    View Disabled Layers
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" color="warning" gutterBottom>
                                                    Layers Without Styles
                                                </Typography>
                                                <Typography variant="h4" gutterBottom>
                                                    {totalLayersWithoutStyles}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                                    ({(totalLayersWithoutStyles / total * 100).toFixed(2)}% need styling)
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    color="warning"
                                                    fullWidth
                                                    disabled
                                                >
                                                    Coming Soon
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                )
                : (
                    <>
                        <Typography
                            variant="body"
                            color="error"
                            align='center'
                            gutterBottom>
                            This portal is only available to administrators.
                        </Typography>
                    </>
                )}
        </>
    );
}

export default Dashboard;
