import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    Button,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { UppyUploader } from './Uppy';

interface UploadDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    projectTitle?: string;
}

export const UploadDialog = ({ open, onClose, projectId, projectTitle }: UploadDialogProps) => {
    const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0, isUploading: false });

    const isComplete = uploadProgress.completed === uploadProgress.total && uploadProgress.total > 0;
    const isUploading = uploadProgress.isUploading && uploadProgress.total > 0;

    return (
        <Dialog open={open} maxWidth="lg" fullWidth onClose={onClose}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isComplete ? (
                    <CheckCircleIcon color="success" />
                ) : isUploading ? (
                    <CloudUploadIcon color="primary" />
                ) : (
                    <CloudUploadIcon />
                )}
                <Typography variant="h6">
                    Upload New Layer{projectTitle ? ` — ${projectTitle}` : ''}
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ pb: 3 }}>
                <UppyUploader
                    projectId={projectId}
                    onUploadProgress={setUploadProgress}
                    actionButton={
                        <Box sx={{ textAlign: 'center', my: 2 }}>
                            <Button
                                onClick={onClose}
                                variant="outlined"
                                color="inherit"
                                size="small"
                                sx={{
                                    width: 280,
                                    height: 48,
                                    py: 1,
                                    px: 2,
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    bgcolor: isComplete ? '#e8f5e8' : isUploading ? '#e3f2fd' : '#f5f5f5',
                                    border: isComplete ? '2px solid #4caf50' : isUploading ? '1px solid #2196f3' : '1px solid #ccc',
                                    '&:hover': {
                                        bgcolor: isComplete ? 'success.main' : isUploading ? 'primary.main' : 'grey.200',
                                        color: 'white',
                                        transform: 'scale(1.02)',
                                    },
                                    transition: 'all 0.2s ease-in-out',
                                }}
                            >
                                {isUploading ? (
                                    `Uploading ${uploadProgress.completed} of ${uploadProgress.total} files...`
                                ) : uploadProgress.total > 0 ? (
                                    `Uploaded ${uploadProgress.completed} of ${uploadProgress.total} files`
                                ) : (
                                    'Close'
                                )}
                            </Button>
                        </Box>
                    }
                />
            </DialogContent>
        </Dialog>
    );
};

export default UploadDialog;
