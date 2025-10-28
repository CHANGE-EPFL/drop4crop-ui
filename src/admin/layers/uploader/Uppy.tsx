import React, { useRef, useState, useContext } from 'react';
import {
    useNotify,
    useRefresh,
    AuthContext,
} from 'react-admin';
import { Box, Stack, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import Uppy from '@uppy/core';
import { Dashboard } from '@uppy/react';
import XHR from '@uppy/xhr-upload';
import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';
import './UppyUploader.css'; // Import custom CSS

export const UppyUploader = () => {
    const refresh = useRefresh();
    const notify = useNotify();
    const pondRef = useRef(null);
    const authProvider = useContext(AuthContext);
    const [isDragOver, setIsDragOver] = useState(false);

    // Get the token using the auth provider
    const token = authProvider?.getToken() || 'dev-token';
    const instructionText = "Format: {crop}_{watermodel}_{climatemodel}_{scenario}_{variable}_{year}.tif (e.g., rice_pcr-globwb_miroc5_rcp60_rg_2080)";
    const headers = {
        authorization: `Bearer ${token}`,
    };

    const [uppy] = useState(() => new Uppy({
        restrictions: {
            allowedFileTypes: ['.tif', '.tiff'],
            maxFileSize: 25 * 1024 * 1024, // 25MB
            maxNumberOfFiles: 25
        }
    }).use(XHR, {
        endpoint: '/api/layers/uploads',
        headers: headers,
        limit: 25,
        onAfterResponse: (response) => {
            console.log('onAfterResponse', response);
            const parsedResponse = JSON.parse(response.response);

            if (response.status === 200) {
                notify('File uploaded successfully');
                refresh();
            } else {
                console.log("Response", parsedResponse);
                notify(`Error uploading file: ${parsedResponse.detail.message}`, { type: 'error' });
            }
        }
    }));

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        files.forEach(file => {
            if (file.name.toLowerCase().endsWith('.tif') || file.name.toLowerCase().endsWith('.tiff')) {
                uppy.addFile({
                    name: file.name,
                    type: file.type,
                    data: file,
                    source: 'Local',
                    isRemote: false
                });
            } else {
                notify(`File ${file.name} is not a valid GeoTIFF file`, { type: 'warning' });
            }
        });
    };

    return (
        <Box>
            {/* Upload Area */}
            <Box
                sx={{
                    border: `2px dashed ${isDragOver ? 'primary.main' : '#ccc'}`,
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: isDragOver ? 'primary.50' : '#fafafa',
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    minHeight: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept=".tif,.tiff"
                    multiple
                    onChange={(e) => {
                        const files = Array.from(e.target.files);
                        files.forEach(file => {
                            uppy.addFile({
                                name: file.name,
                                type: file.type,
                                data: file,
                                source: 'Local',
                                isRemote: false
                            });
                        });
                        e.target.value = ''; // Reset input
                    }}
                    style={{ display: 'none' }}
                    id="uppy-file-input"
                />
                <label htmlFor="uppy-file-input" style={{ cursor: 'pointer', width: '100%' }}>
                    <Stack spacing={1} alignItems="center">
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'scale(1.1)'
                            }
                        }}>
                            <CloudUploadIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Typography variant="body1" color="primary">
                            {isDragOver ? 'Drop files here' : 'Click or drag files to upload'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            GeoTIFF files (.tif, .tiff) • Max 25MB
                        </Typography>
                    </Stack>
                </label>
            </Box>

            {/* Instructions below */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                    <strong>Filename format:</strong> {instructionText}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Existing files with the same name will be replaced
                </Typography>
            </Box>

            {/* Progress indicator area */}
            <Box id="uppy-progress" sx={{ mt: 2 }} />
        </Box>
    );
};
