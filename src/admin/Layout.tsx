import * as React from 'react';
import { Layout, AppBar, TitlePortal } from 'react-admin';
import { CssBaseline, Button, Box } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import { MyMenu } from './layout/AppMenu';

const CustomAppBar = () => (
    <AppBar>
        <TitlePortal />
        <Box flex={1} />
        <Button
            variant="contained"
            href="/"
            startIcon={<MapIcon />}
            sx={{
                textTransform: 'none',
                marginRight: 2,
                backgroundColor: '#d1a766',
                color: '#1e2127',
                fontWeight: 600,
                '&:hover': {
                    backgroundColor: '#e8c896',
                },
            }}
        >
            Go to Map
        </Button>
    </AppBar>
);

export default props => (
    <>
        <CssBaseline />
        <Layout {...props} appBar={CustomAppBar} menu={MyMenu} />
    </>
);
