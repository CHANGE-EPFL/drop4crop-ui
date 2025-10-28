import {
    List,
    TextField,
    BooleanField,
    BulkDeleteButton,
    DatagridConfigurable,
    SelectColumnsButton,
    BulkExportButton,
    BulkUpdateButton,
    useGetList,
    Loading,
    Pagination,
    TopToolbar,
    CreateButton,
    ExportButton,
    useUpdateMany,
    useListContext,
    useNotify,
    useRefresh,
    useUnselectAll,
    useRecordContext,
    FilterButton,
    SearchInput,
    SaveButton,
    FunctionField,
    TextInput,
    BooleanInput,
    SelectInput,
} from "react-admin";
import { useState } from 'react';
import { FilterList, FilterListItem } from 'react-admin';
import { Card, CardContent, Typography, Box, Chip, Stack, Divider, IconButton } from '@mui/material';
import CategoryIcon from '@mui/icons-material/LocalOffer';
import {
    globalWaterModelsItems,
    climateModelsItems,
    cropItems,
    scenariosItems,
    variablesItems,
    yearItems
} from '../options';
import { Fragment } from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { UppyUploader } from "./uploader/Uppy";
import {
    faWater, faCloudSun, faCogs, faLayerGroup, faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GrassIcon from '@mui/icons-material/Grass';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';

export const ColorBar = () => {
    const record = useRecordContext();
    if (!record || !record.style || record.style.length == 0) {
        return (
            <Box
                sx={{
                    height: '8px',
                    width: '60px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
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
                height: '8px',
                width: '60px',
                background: gradient,
                borderRadius: '4px',
                border: '1px solid #ddd',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
        />
    );
};


const StyleSelectMenu = () => {
    const { data, loading } = useGetList('styles');
    const [updateMany] = useUpdateMany();
    const { selectedIds } = useListContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll('layers');
    const [selectedStyle, setSelectedStyle] = useState('');

    if (loading) return <Loading small />;
    if (!data || selectedIds.length === 0) return null;

    const handleChange = (event) => {
        const newStyleId = event.target.value;
        setSelectedStyle(newStyleId);

        updateMany(
            'layers',
            { ids: selectedIds, data: { style_id: newStyleId } }
        ).then(() => {
            const styleName = data.find(style => style.id === newStyleId)?.name || newStyleId;
            notify(`Applied style "${styleName}" to ${selectedIds.length} layer(s)`, { type: 'success' });
            refresh();
            unselectAll();
            setSelectedStyle('');
        }).catch(() => {
            notify('Error updating layer style', { type: 'error' });
        });
    };

    return (
        <Box sx={{ minWidth: 120 }}>
            <Select
                size="small"
                value={selectedStyle}
                onChange={handleChange}
                displayEmpty
                placeholder="Apply Style"
                sx={{ height: '36px' }}
            >
                <MenuItem disabled value="">
                    <em>Apply Style to {selectedIds.length} selected</em>
                </MenuItem>
                {data.map(style => (
                    <MenuItem key={style.id} value={style.id}>
                        {style.name}
                    </MenuItem>
                ))}
            </Select>
        </Box>
    );
};

const BulkActionButtons = () => {
    const { selectedIds } = useListContext();

    if (selectedIds.length === 0) return null;

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Divider orientation="vertical" flexItem />
            <Typography variant="body2" color="text.secondary">
                {selectedIds.length} selected
            </Typography>
            <Divider orientation="vertical" flexItem />
            <BulkUpdateButton
                label="Enable"
                mutationMode="pessimistic"
                data={{ enabled: true }}
                icon={<CheckCircleIcon />}
                color="success"
            />
            <BulkUpdateButton
                label="Disable"
                mutationMode="pessimistic"
                data={{ enabled: false }}
                color="error"
            />
            <StyleSelectMenu />
            <BulkExportButton />
            <BulkDeleteButton
                mutationMode="pessimistic"
                confirmColor="error"
                confirmContent={`Are you sure you want to delete ${selectedIds.length} selected layers?`}
            />
        </Stack>
    );
};


export const FilterSidebar = () => {
    return (
        <Card sx={{
            order: -1,
            mr: 2,
            mt: 1,
            width: 280,
            borderRadius: 2,
            boxShadow: 1
        }}>
            <CardContent sx={{ pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                        Filters
                    </Typography>
                </Box>

                <Stack spacing={2}>
                    <FilterList
                        label="Status"
                        icon={<CategoryIcon sx={{ fontSize: 16 }} />}
                        sx={{ '& .RaFilterList-item': { py: 0.5 } }}
                    >
                        <FilterListItem
                            label={<Chip size="small" color="success" label="Enabled" />}
                            value={{ enabled: true }}
                        />
                        <FilterListItem
                            label={<Chip size="small" color="default" label="Disabled" />}
                            value={{ enabled: false }}
                        />
                    </FilterList>

                    <FilterList
                        label="Type"
                        icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                        sx={{ '& .RaFilterList-item': { py: 0.5 } }}
                    >
                        <FilterListItem
                            label={<Chip size="small" color="primary" label="Crop Specific" />}
                            value={{ is_crop_specific: true }}
                        />
                        <FilterListItem
                            label={<Chip size="small" variant="outlined" label="General" />}
                            value={{ is_crop_specific: false }}
                        />
                    </FilterList>

                    <Divider sx={{ my: 1 }} />

                    <FilterList
                        label="Crop"
                        icon={<GrassIcon sx={{ fontSize: 16 }} />}
                        sx={{ maxHeight: 250, overflow: 'auto' }}
                    >
                        {cropItems.map(item => (
                            <FilterListItem
                                key={item.id}
                                label={item.name}
                                value={{ crop: item.id }}
                                sx={{ fontSize: '0.875rem' }}
                            />
                        ))}
                    </FilterList>

                    <FilterList
                        label="Water Model"
                        icon={<FontAwesomeIcon icon={faWater} style={{ fontSize: 14 }} />}
                        sx={{ maxHeight: 200, overflow: 'auto' }}
                    >
                        {globalWaterModelsItems.map(item => (
                            <FilterListItem
                                key={item.id}
                                label={item.name}
                                value={{ water_model: item.id }}
                                sx={{ fontSize: '0.875rem' }}
                            />
                        ))}
                    </FilterList>

                    <FilterList
                        label="Climate Model"
                        icon={<FontAwesomeIcon icon={faCloudSun} style={{ fontSize: 14 }} />}
                        sx={{ maxHeight: 200, overflow: 'auto' }}
                    >
                        {climateModelsItems.map(item => (
                            <FilterListItem
                                key={item.id}
                                label={item.name}
                                value={{ climate_model: item.id }}
                                sx={{ fontSize: '0.875rem' }}
                            />
                        ))}
                    </FilterList>

                    <FilterList
                        label="Scenario"
                        icon={<FontAwesomeIcon icon={faCogs} style={{ fontSize: 14 }} />}
                        sx={{ maxHeight: 150, overflow: 'auto' }}
                    >
                        {scenariosItems.map(item => (
                            <FilterListItem
                                key={item.id}
                                label={item.name}
                                value={{ scenario: item.id }}
                                sx={{ fontSize: '0.875rem' }}
                            />
                        ))}
                    </FilterList>

                    <FilterList
                        label="Variable"
                        icon={<FontAwesomeIcon icon={faLayerGroup} style={{ fontSize: 14 }} />}
                        sx={{ maxHeight: 200, overflow: 'auto' }}
                    >
                        {variablesItems.map(item => (
                            <FilterListItem
                                key={item.id}
                                label={item.name}
                                value={{ variable: item.id }}
                                sx={{ fontSize: '0.875rem' }}
                            />
                        ))}
                    </FilterList>

                    <FilterList
                        label="Year"
                        icon={<FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: 14 }} />}
                        sx={{ maxHeight: 150, overflow: 'auto' }}
                    >
                        {yearItems.map(item => (
                            <FilterListItem
                                key={item.id}
                                label={item.name}
                                value={{ year: item.id }}
                                sx={{ fontSize: '0.875rem' }}
                            />
                        ))}
                    </FilterList>
                </Stack>
            </CardContent>
        </Card>
    )
};
const ListActions = () => (
    <TopToolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="h2" sx={{ mr: 2 }}>
                Layers
            </Typography>
            <FilterButton />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
                size="small"
                onClick={() => window.location.reload()}
                title="Refresh"
            >
                <RefreshIcon />
            </IconButton>
            <SelectColumnsButton />
            <ExportButton />
            <CreateButton />
        </Box>
    </TopToolbar>
);

export const LayerList = () => {
    const PostPagination = props => (
        <Pagination
            rowsPerPageOptions={[10, 25, 50, 100, 250, 500, 1000]}
            {...props}
        />
    );

    return (
        <List
            queryOptions={{ refetchInterval: 5000 }}
            aside={<FilterSidebar />}
            storeKey={false}
            perPage={25}
            pagination={<PostPagination />}
            actions={<ListActions />}
            sort={{ field: 'uploaded_at', order: 'DESC' }}
            empty={false}
            sx={{ '& .RaList-content': { mt: 2 } }}
            filters={[
                <SearchInput source="q" alwaysOn />,
                <BooleanInput source="enabled" />,
                <BooleanInput source="is_crop_specific" />,
                <SelectInput source="crop" choices={cropItems} />,
                <SelectInput source="water_model" choices={globalWaterModelsItems} />,
                <SelectInput source="climate_model" choices={climateModelsItems} />,
                <SelectInput source="scenario" choices={scenariosItems} />,
                <SelectInput source="variable" choices={variablesItems} />,
                <SelectInput source="year" choices={yearItems} />,
            ]}
        >
            {/* Upload Section */}
            <Box sx={{ mb: 3 }}>
                <Card sx={{ borderRadius: 2, boxShadow: 1, maxWidth: 600, mx: 'auto' }}>
                    <CardContent sx={{ pb: 2, pt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CloudUploadIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" component="h3">
                                Upload New Layer
                            </Typography>
                        </Box>
                        <UppyUploader />
                    </CardContent>
                </Card>
            </Box>

            {/* Layers Table */}
            <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                <DatagridConfigurable
                    rowClick="show"
                    bulkActionButtons={<BulkActionButtons />}
                    size="medium"
                    sx={{
                        '& .RaDatagrid-headerCell': {
                            fontWeight: 600,
                            backgroundColor: 'grey.50',
                            py: 1
                        },
                        '& .RaDatagrid-row': {
                            '&:hover': {
                                backgroundColor: 'action.hover'
                            }
                        },
                        '& .RaDatagrid-even': {
                            backgroundColor: 'grey.50'
                        }
                    }}
                >
                    <FunctionField
                        label="Status"
                        render={record => (
                            <Chip
                                size="small"
                                color={record.enabled ? 'success' : 'default'}
                                label={record.enabled ? 'Enabled' : 'Disabled'}
                                variant={record.enabled ? 'filled' : 'outlined'}
                            />
                        )}
                    />
                    <TextField
                        source="crop"
                        label="Crop"
                        sx={{ fontWeight: 500 }}
                    />
                    <FunctionField
                        label="Model Configuration"
                        render={record => (
                            <Stack spacing={0.5}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {record.water_model}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {record.climate_model} • {record.scenario}
                                </Typography>
                            </Stack>
                        )}
                    />
                    <TextField
                        source="variable"
                        label="Variable"
                        sx={{ textTransform: 'capitalize' }}
                    />
                    <TextField
                        source="year"
                        label="Year"
                        align="center"
                    />
                    <FunctionField
                        label="Type"
                        render={record => (
                            <Chip
                                size="small"
                                color={record.is_crop_specific ? 'primary' : 'secondary'}
                                label={record.is_crop_specific ? 'Crop Specific' : 'General'}
                                variant="outlined"
                            />
                        )}
                    />
                    <FunctionField
                        label="Style"
                        render={record => (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {record.style?.name ? (
                                    <Typography variant="body2">
                                        {record.style.name}
                                    </Typography>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        No style
                                    </Typography>
                                )}
                                <ColorBar />
                            </Box>
                        )}
                    />
                    <FunctionField
                        label="Actions"
                        textAlign="center"
                        render={record => (
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Navigate to show view
                                        window.location.href = `#/layers/${record.id}`;
                                    }}
                                    title="View details"
                                >
                                    <VisibilityIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Navigate to edit view
                                        window.location.href = `#/layers/${record.id}`;
                                    }}
                                    title="Edit layer"
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        )}
                    />
                </DatagridConfigurable>
            </Card>
        </List>
    );
};

export default LayerList;
