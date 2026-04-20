import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    NumberField,
    useListContext,
    useRedirect,
} from 'react-admin';
import { Box } from '@mui/material';
import ProjectCardPreview from './ProjectCardPreview';

const CardGrid = () => {
    const { data, isLoading } = useListContext();
    const redirect = useRedirect();
    if (isLoading || !data || data.length === 0) return null;

    const sorted = [...data].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '28px',
                maxWidth: 780,
                mx: 'auto',
                mt: 4,
                mb: 2,
                p: 3,
                borderRadius: 2,
                background: 'background.default',
            }}
        >
            {sorted.map((project, index) => {
                const isLast = sorted.length > 2 && sorted.length % 2 === 1 && index === sorted.length - 1;
                return (
                    <Box
                        key={project.id}
                        sx={{
                            height: '100%',
                            ...(isLast ? {
                                gridColumn: '1 / -1',
                                justifySelf: 'center',
                                width: 'calc(50% - 14px)',
                            } : {}),
                        }}
                    >
                        <ProjectCardPreview
                            project={project}
                            fullWidth
                            onClick={() => redirect('show', 'projects', project.id)}
                        />
                    </Box>
                );
            })}
        </Box>
    );
};

const ProjectList = () => {
    return (
        <List sort={{ field: 'sort_order', order: 'ASC' }} storeKey={false} perPage={25}>
            <>
                <Datagrid rowClick="show">
                    <TextField source="title" />
                    <TextField source="slug" />
                    <BooleanField source="enabled" />
                    <NumberField source="sort_order" label="Order" />
                    <NumberField source="latitude" options={{ maximumFractionDigits: 2 }} />
                    <NumberField source="longitude" options={{ maximumFractionDigits: 2 }} />
                    <NumberField source="zoom_level" label="Zoom" />
                </Datagrid>
                <CardGrid />
            </>
        </List>
    );
};

export default ProjectList;
