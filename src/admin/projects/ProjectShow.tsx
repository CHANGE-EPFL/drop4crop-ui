import {
    Show,
    SimpleShowLayout,
    TextField,
    BooleanField,
    NumberField,
    useRecordContext,
} from 'react-admin';
import { Box, Typography, Link as MuiLink } from '@mui/material';
import ProjectCardPreview from './ProjectCardPreview';

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

const ProjectShow = () => {
    return (
        <Show>
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
            </SimpleShowLayout>
        </Show>
    );
};

export default ProjectShow;
