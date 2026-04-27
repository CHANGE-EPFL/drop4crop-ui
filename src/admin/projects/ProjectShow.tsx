import { useState } from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    BooleanField,
    NumberField,
    FunctionField,
    TopToolbar,
    EditButton,
    useGetList,
    useRecordContext,
    List,
    Datagrid,
    ReferenceField,
    SearchInput,
    Pagination,
    ReferenceInput,
    SelectInput,
    BooleanInput,
} from 'react-admin';
import {
    Box,
    Chip,
    Typography,
    Button,
    Link as MuiLink,
    Tab,
    Tabs,
    Stack,
    Card,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LayersIcon from '@mui/icons-material/Layers';
import SettingsIcon from '@mui/icons-material/Settings';
import ProjectCardPreview from './ProjectCardPreview';
import ProjectConfigEditor from './ProjectConfigEditor';
import UploadDialog from '../layers/uploader/UploadDialog';

const ProjectLayerCount = () => {
    const record = useRecordContext();
    const { total, isLoading } = useGetList(
        'layers',
        {
            pagination: { page: 1, perPage: 1 },
            filter: record?.id ? { project_id: record.id } : undefined,
        },
        { enabled: !!record?.id },
    );
    if (!record?.id) return null;
    return (
        <Chip
            icon={<LayersIcon sx={{ fontSize: 16 }} />}
            label={
                isLoading
                    ? 'Layers: …'
                    : `${(total ?? 0).toLocaleString()} layer${total === 1 ? '' : 's'}`
            }
            size="small"
            variant="outlined"
            color="primary"
        />
    );
};

const CardPreviewField = () => {
    const record = useRecordContext();
    if (!record) return null;

    return (
        <Box>
            <MuiLink
                href={`/projects/${record.slug}`}
                sx={{
                    color: '#acd8d8',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline', color: '#c4e3e3' },
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
    <TopToolbar sx={{ gap: 1, alignItems: 'center' }}>
        <ProjectLayerCount />
        <ProjectUploadAction />
        <EditButton />
    </TopToolbar>
);

const YEAR_CHOICES = [
    2000, 2010, 2020, 2030, 2040, 2050, 2060, 2070, 2080, 2090,
].map((y) => ({ id: y, name: String(y) }));

const ProjectLayersPagination = (props: any) => (
    <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />
);

const projectLayerFilters = [
    <SearchInput source="q" alwaysOn key="q" />,
    <BooleanInput source="enabled" label="Enabled" key="enabled" />,
    <ReferenceInput source="crop_id" reference="crops" label="Crop" sort={{ field: 'sort_order', order: 'ASC' }} perPage={500} key="crop_id">
        <SelectInput optionText="name" />
    </ReferenceInput>,
    <ReferenceInput source="water_model_id" reference="water-models" label="Water Model" sort={{ field: 'sort_order', order: 'ASC' }} perPage={500} key="water_model_id">
        <SelectInput optionText="name" />
    </ReferenceInput>,
    <ReferenceInput source="climate_model_id" reference="climate-models" label="Climate Model" sort={{ field: 'sort_order', order: 'ASC' }} perPage={500} key="climate_model_id">
        <SelectInput optionText="name" />
    </ReferenceInput>,
    <ReferenceInput source="scenario_id" reference="scenarios" label="Scenario" sort={{ field: 'sort_order', order: 'ASC' }} perPage={500} key="scenario_id">
        <SelectInput optionText="name" />
    </ReferenceInput>,
    <ReferenceInput source="variable_id" reference="variables" label="Variable" sort={{ field: 'sort_order', order: 'ASC' }} perPage={500} key="variable_id">
        <SelectInput optionText="name" />
    </ReferenceInput>,
    <SelectInput source="year" label="Year" choices={YEAR_CHOICES} key="year" />,
];

const ProjectLayerList = () => {
    const record = useRecordContext();
    if (!record?.id) return null;

    return (
        <List
            resource="layers"
            storeKey={`project-layers-${record.id}`}
            filter={{ project_id: record.id }}
            filters={projectLayerFilters}
            sort={{ field: 'uploaded_at', order: 'DESC' }}
            perPage={25}
            pagination={<ProjectLayersPagination />}
            actions={false}
            title=" "
            disableSyncWithLocation
            empty={
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="textSecondary">No layers found for this project.</Typography>
                </Box>
            }
        >
            <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                <Datagrid
                    size="small"
                    rowClick="show"
                    bulkActionButtons={false}
                    rowStyle={(record) => ({
                        backgroundColor: record.enabled ? 'inherit' : 'rgba(0, 0, 0, 0.04)',
                        opacity: record.enabled ? 1 : 0.6,
                        borderLeft: record.enabled ? '6px solid #4caf50' : '6px solid #f44336',
                    })}
                    sx={{
                        '& .RaDatagrid-headerCell': {
                            fontWeight: 600,
                            backgroundColor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? theme.palette.grey[900]
                                    : theme.palette.grey[50],
                            py: 0.25,
                            px: 0.5,
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap',
                        },
                        '& .RaDatagrid-rowCell': {
                            py: 0.25,
                            px: 0.5,
                            fontSize: '0.75rem',
                        },
                    }}
                >
                    <ReferenceField source="crop_id" reference="crops" link={false} label="Crop">
                        <TextField source="name" />
                    </ReferenceField>
                    <ReferenceField source="water_model_id" reference="water-models" link={false} label="Water Model">
                        <TextField source="name" />
                    </ReferenceField>
                    <ReferenceField source="climate_model_id" reference="climate-models" link={false} label="Climate Model">
                        <TextField source="name" />
                    </ReferenceField>
                    <ReferenceField source="scenario_id" reference="scenarios" link={false} label="Scenario">
                        <TextField source="name" />
                    </ReferenceField>
                    <ReferenceField source="variable_id" reference="variables" link={false} label="Variable">
                        <TextField source="name" />
                    </ReferenceField>
                    <TextField source="year" label="Year" />
                    <FunctionField
                        label="Min"
                        sortable
                        source="min_value"
                        render={(record: any) => record.min_value != null ? record.min_value.toFixed(1) : '-'}
                    />
                    <FunctionField
                        label="Max"
                        sortable
                        source="max_value"
                        render={(record: any) => record.max_value != null ? record.max_value.toFixed(1) : '-'}
                    />
                    <FunctionField
                        label="Avg"
                        sortable
                        source="global_average"
                        render={(record: any) => record.global_average != null ? record.global_average.toFixed(1) : '-'}
                    />
                    <FunctionField
                        label="Enabled"
                        render={(record: any) => (
                            <Chip
                                label={record.enabled ? 'Yes' : 'No'}
                                size="small"
                                color={record.enabled ? 'success' : 'default'}
                                variant="outlined"
                            />
                        )}
                    />
                </Datagrid>
            </Card>
        </List>
    );
};

const ProjectShowContent = () => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <>
            <Stack direction="row" spacing={3} sx={{ p: 2 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <SimpleShowLayout>
                        <TextField source="id" />
                        <TextField source="title" />
                        <TextField source="slug" />
                        <BooleanField source="enabled" />
                        <NumberField source="sort_order" label="Sort Order" />
                        <TextField source="description" />
                        <NumberField source="latitude" />
                        <NumberField source="longitude" />
                        <NumberField source="zoom_level" label="Zoom Level" />
                        <FunctionField
                            source="year_axis"
                            label="Year Axis (Timeline)"
                            render={(record: any) => {
                                if (!record?.year_axis) return 'Disabled';
                                const ya = record.year_axis;
                                return `${ya.min} – ${ya.max} (step ${ya.step})`;
                            }}
                        />
                        <FunctionField
                            source="historical_year"
                            label="Historical Year"
                            render={(record: any) =>
                                record?.historical_year != null
                                    ? `${record.historical_year} → "historical" scenario`
                                    : 'None'
                            }
                        />
                    </SimpleShowLayout>
                </Box>
                <Box sx={{ width: 340, flexShrink: 0 }}>
                    <CardPreviewField />
                </Box>
            </Stack>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: 2 }}>
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                    <Tab
                        icon={<SettingsIcon />}
                        label="Configuration"
                        iconPosition="start"
                    />
                    <Tab
                        icon={<LayersIcon />}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Layers
                                <ProjectLayerCount />
                            </Box>
                        }
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            {activeTab === 0 && (
                <Box sx={{ p: 2 }}>
                    <ProjectConfigEditor readOnly />
                </Box>
            )}
            {activeTab === 1 && (
                <Box sx={{ p: 2 }}>
                    <ProjectLayerList />
                </Box>
            )}
        </>
    );
};

const ProjectShow = () => {
    return (
        <Show actions={<ShowActions />}>
            <ProjectShowContent />
        </Show>
    );
};

export default ProjectShow;
