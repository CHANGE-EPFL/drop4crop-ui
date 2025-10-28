import {
    BooleanField,
    DateField,
    ReferenceField,
    Show,
    SimpleShowLayout,
    TextField,
    useRecordContext,
    TopToolbar,
    EditButton,
    DeleteButton,
    ListButton,
} from "react-admin";
import { Typography, Box, Chip, Card, CardContent, Stack, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ListIcon from '@mui/icons-material/List';

export const ColorBar = () => {
    const record = useRecordContext();
    if (!record || !record.style || record.style.length == 0) {
        return (
            <Box
                sx={{
                    height: '12px',
                    width: '100%',
                    maxWidth: '200px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '6px',
                    border: '1px solid #ddd'
                }}
            />
        );
    }
    const style = record.style;
    const gradient = `linear-gradient(to right, ${style.map(
        color => `rgba(${color.red},${color.green},${color.blue},${color.opacity / 255})`
    ).join(", ")})`;

    return (
        <Box
            sx={{
                height: '12px',
                width: '100%',
                maxWidth: '200px',
                background: gradient,
                borderRadius: '6px',
                border: '1px solid #ddd',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
        />
    );
};

const LayerShowActions = () => (
    <TopToolbar>
        <ListButton />
        <EditButton />
        <DeleteButton mutationMode="pessimistic" />
    </TopToolbar>
);

export const LayerShow = () => {
    return (
        <Show actions={<LayerShowActions />}>
            <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                <CardContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                        {/* Header Section */}
                        <Box>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Layer Details
                            </Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Chip
                                    color="primary"
                                    label={useRecordContext()?.crop || 'Unknown Crop'}
                                    size="medium"
                                />
                                <Chip
                                    color={useRecordContext()?.enabled ? 'success' : 'default'}
                                    label={useRecordContext()?.enabled ? 'Enabled' : 'Disabled'}
                                    variant={useRecordContext()?.enabled ? 'filled' : 'outlined'}
                                />
                                <Chip
                                    color={useRecordContext()?.is_crop_specific ? 'secondary' : 'default'}
                                    label={useRecordContext()?.is_crop_specific ? 'Crop Specific' : 'General'}
                                    variant="outlined"
                                />
                            </Stack>
                        </Box>

                        <Divider />

                        {/* Basic Information */}
                        <Box>
                            <Typography variant="h6" gutterBottom color="primary">
                                Basic Information
                            </Typography>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Layer Name
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {useRecordContext()?.layer_name}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Filename
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                            {useRecordContext()?.filename}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Box>

                        <Divider />

                        {/* Model Configuration */}
                        <Box>
                            <Typography variant="h6" gutterBottom color="primary">
                                Model Configuration
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Water Model
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {useRecordContext()?.water_model}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Climate Model
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {useRecordContext()?.climate_model}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Scenario
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {useRecordContext()?.scenario}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Variable
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                        {useRecordContext()?.variable}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Year
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {useRecordContext()?.year}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        ID
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                        {useRecordContext()?.id}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Divider />

                        {/* Style Information */}
                        <Box>
                            <Typography variant="h6" gutterBottom color="primary">
                                Style Configuration
                            </Typography>
                            <Stack spacing={2}>
                                {useRecordContext()?.style_id ? (
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Applied Style
                                        </Typography>
                                        <ReferenceField source="style_id" reference="styles" link="show">
                                            <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                                                {useRecordContext()?.style?.name}
                                            </Typography>
                                        </ReferenceField>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Applied Style
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                            No style applied
                                        </Typography>
                                    </Box>
                                )}
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Style Preview
                                    </Typography>
                                    <ColorBar />
                                </Box>
                            </Stack>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Show>
    )
};

export default LayerShow;
