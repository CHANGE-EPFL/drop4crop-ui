import { useState } from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    BooleanField,
    NumberField,
    TopToolbar,
    EditButton,
    useRecordContext,
} from 'react-admin';
import { Box, Typography, Button, Link as MuiLink } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ProjectCardPreview from './ProjectCardPreview';
import ProjectConfigEditor from './ProjectConfigEditor';
import UploadDialog from '../layers/uploader/UploadDialog';

const CardPreviewField = () => {
    const record = useRecordContext();
    if (!record) return null;

    return (
        <Box sx={{ mt: 3, mb: 2 }}>
            <MuiLink
                href={`/projects/${record.slug}`}
                sx={{
                    color: '#d1a766',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline', color: '#e8c896' },
                    display: 'inline-block',
                    mb: 0.5,
                }}
            >
                View project →
            </MuiLink>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                /projects/{record.slug}
            </Typography>
            <ProjectCardPreview project={record} />
        </Box>
    );
};

// Project-scoped upload action. `record.id` is passed straight to the uploader,
// which appends it as ?project_id= on every XHR — so every layer uploaded here
// lands with project_id already set (no global/unassigned uploads anymore).
const ProjectUploadAction = () => {
    const record = useRecordContext();
    const [open, setOpen] = useState(false);
    if (!record?.id) return null;

    return (
        <>
            <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<CloudUploadIcon />}
                onClick={() => setOpen(true)}
                sx={{ textTransform: 'none' }}
            >
                Upload Layers
            </Button>
            <UploadDialog
                open={open}
                onClose={() => setOpen(false)}
                projectId={record.id}
                projectSlug={record.slug}
                projectTitle={record.title}
            />
        </>
    );
};

const ShowActions = () => (
    <TopToolbar sx={{ gap: 1 }}>
        <ProjectUploadAction />
        <EditButton />
    </TopToolbar>
);

const ProjectShow = () => {
    return (
        <Show actions={<ShowActions />}>
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="title" />
                <TextField source="slug" />
                <TextField source="description" />
                <NumberField source="latitude" />
                <NumberField source="longitude" />
                <NumberField source="zoom_level" label="Zoom Level" />
                <BooleanField source="enabled" />
                <NumberField source="sort_order" label="Sort Order" />
                <CardPreviewField />
                <ProjectConfigEditor readOnly />
            </SimpleShowLayout>
        </Show>
    );
};

export default ProjectShow;
