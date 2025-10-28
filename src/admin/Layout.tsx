import * as React from 'react';

import { Layout } from 'react-admin';
import { CssBaseline } from '@mui/material';

export default props => (
    <>
        <CssBaseline />
        <Layout {...props} />
    </>
);
