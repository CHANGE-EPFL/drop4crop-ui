import {
    usePermissions,
    useGetList,
    Button,
    useRedirect,
    useDataProvider,
    useNotify,
} from 'react-admin';
import { Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
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
        // Navigate to list with filter
        navigate({
            pathname: '/layers',
            search: '?filter={"enabled":false}',
        });
    }

    const handleRedirectAllLayers = () => {
        redirect('list', '/layers');
    }

    if (isPending || enabledLayersIsPending) return <Loading />;
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
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">Metric</TableCell>
                                                <TableCell align="center">Value</TableCell>
                                                <TableCell align="center">Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell align="center">Total layers</TableCell>
                                                <TableCell align="center">{total}</TableCell>
                                                <TableCell align="center"><Button onClick={handleRedirectAllLayers}>Goto layers</Button></TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell align="center">Total enabled layers</TableCell>
                                                <TableCell align="center">{totalEnabledLayers} ({(totalEnabledLayers / total * 100).toFixed(2)}%)</TableCell>
                                                <TableCell align="center"><Button onClick={handleRedirectDisabledLayers}>Goto disabled layers</Button></TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell align="center">Layers with styles</TableCell>
                                                <TableCell align="center">{totalLayersWithoutStyles} ({(totalLayersWithoutStyles / total * 100).toFixed(2)}%)</TableCell>
                                                <TableCell align="center"></TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
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
