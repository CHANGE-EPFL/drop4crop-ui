import * as React from 'react';
import { Layout, AppBar, TitlePortal } from 'react-admin';
import { CssBaseline, Button, Box } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';

const CustomAppBar = () => (
    <AppBar>
        <TitlePortal />
        <Box flex={1} />
        <Button
            color="inherit"
            href="/"
            startIcon={<MapIcon />}
            sx={{
                textTransform: 'none',
                marginRight: 2,
            }}
        >
            Go to Map
        </Button>
    </AppBar>
);

export default props => (
    <>
        <CssBaseline />
        <Layout {...props} appBar={CustomAppBar} />
    </>
);
