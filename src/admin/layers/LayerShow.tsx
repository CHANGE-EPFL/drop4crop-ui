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
import { createStyleGradient } from '../../utils/styleUtils';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ListIcon from '@mui/icons-material/List';

export const ColorBar = ({ record }) => {
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

    const gradient = createStyleGradient(record.style);

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

const LayerShowContent = () => {
    const record = useRecordContext();

    if (!record) {
        return <div>No data available</div>;
    }

    return (
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
                                label={record.crop || 'Unknown Crop'}
                                size="medium"
                            />
                            <Chip
                                color={record.enabled ? 'success' : 'default'}
                                label={record.enabled ? 'Enabled' : 'Disabled'}
                                variant={record.enabled ? 'filled' : 'outlined'}
                            />
                            <Chip
                                color={record.is_crop_specific ? 'secondary' : 'default'}
                                label={record.is_crop_specific ? 'Crop Specific' : 'General'}
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
                                        {record.layer_name}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Filename
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                        {record.filename}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Min Value
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {record.min_value?.toFixed(2) || 'N/A'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Max Value
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {record.max_value?.toFixed(2) || 'N/A'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Global Average
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {record.global_average?.toFixed(2) || 'N/A'}
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
                                    {record.water_model}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Climate Model
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {record.climate_model}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Scenario
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {record.scenario}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Variable
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                    {record.variable}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Year
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {record.year}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    ID
                                </Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                    {record.id}
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
                            {record.style_id ? (
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Applied Style
                                    </Typography>
                                    <ReferenceField source="style_id" reference="styles" link="show">
                                        <TextField source="name" />
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
                                <ColorBar record={record} />
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

export const LayerShow = () => {
    return (
        <Show actions={<LayerShowActions />}>
            <LayerShowContent />
        </Show>
    )
};

export default LayerShow;
