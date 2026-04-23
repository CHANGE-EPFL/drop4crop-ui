import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    Button,
    alpha,
    useTheme,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { UppyUploader } from './Uppy';

interface UploadDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    projectSlug?: string;
    projectTitle?: string;
}

export const UploadDialog = ({ open, onClose, projectId, projectSlug, projectTitle }: UploadDialogProps) => {
    const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0, isUploading: false });
    const theme = useTheme();

    const isComplete = uploadProgress.completed === uploadProgress.total && uploadProgress.total > 0;
    const isUploading = uploadProgress.isUploading && uploadProgress.total > 0;

    // Progress pill tint — uses theme palette so it stays legible in both modes.
    const pillPalette = isComplete
        ? theme.palette.success
        : isUploading
            ? theme.palette.primary
            : theme.palette.grey;
    const pillBg = alpha(
        (pillPalette as { main?: string }).main ?? theme.palette.grey[500],
        theme.palette.mode === 'dark' ? 0.2 : 0.12,
    );
    const pillBorder = (pillPalette as { main?: string }).main ?? theme.palette.divider;

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
                    projectSlug={projectSlug}
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
                                    bgcolor: pillBg,
                                    borderColor: pillBorder,
                                    borderWidth: isComplete ? 2 : 1,
                                    color: 'text.primary',
                                    '&:hover': {
                                        bgcolor: alpha(pillBorder, theme.palette.mode === 'dark' ? 0.35 : 0.2),
                                        borderColor: pillBorder,
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
