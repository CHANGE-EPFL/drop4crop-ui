import {
    List,
    TextField,
    BooleanField,
    BulkDeleteButton,
    Datagrid,
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
    useDataProvider,
    Button,
} from "react-admin";
import { useState } from 'react';
import { createStyleGradient } from '../../utils/styleUtils';
import { FilterList, FilterListItem } from 'react-admin';
import { Card, CardContent, Typography, Box, Chip, Stack, Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
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
import DeleteIcon from '@mui/icons-material/Delete';
import MapIcon from '@mui/icons-material/Map';

// Style name and color bar component
const StyleDisplay = () => {
    const record = useRecordContext();
    const { data: styleData, loading } = useGetList('styles', {
        filter: { id: record?.style_id },
        pagination: { page: 1, perPage: 1 }
    });

    if (!record?.style_id) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No style
                </Typography>
                <Box
                    sx={{
                        height: '8px',
                        width: '60px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                />
            </Box>
        );
    }

    if (loading) {
        return <Typography variant="body2">Loading...</Typography>;
    }

    const style = styleData?.[0];
    const gradient = style?.style ? createStyleGradient(style.style) : null;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
                {style?.name || 'Applied style'}
            </Typography>
            <Box
                sx={{
                    height: '8px',
                    width: '60px',
                    background: gradient || '#e0e0e0',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
            />
        </Box>
    );
};

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

    const gradient = createStyleGradient(record.style);

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


// ColorBar wrapper for dropdown use
const DropdownColorBar = ({ styleData, ...props }) => {
    // Debug: Log the data structure
    console.log('DropdownColorBar received:', styleData);

    let processedStyleData = [];

    if (!styleData) {
        // Empty data, show grey bar
        return (
            <Box
                sx={{
                    height: '8px',
                    width: '60px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                }}
                {...props}
            />
        );
    }

    // If styleData is the complete style object with nested style array
    if (styleData.style && Array.isArray(styleData.style)) {
        processedStyleData = styleData.style;
        console.log('Using styleData.style:', processedStyleData);
    }
    // If styleData is an array of StyleItem objects
    else if (Array.isArray(styleData) && styleData.length > 0 && styleData[0].red !== undefined) {
        processedStyleData = styleData;
        console.log('Using direct StyleItem array:', processedStyleData);
    }
    // If styleData is an array of style records (CRUD response)
    else if (Array.isArray(styleData)) {
        styleData.forEach(styleRecord => {
            if (styleRecord.style && Array.isArray(styleRecord.style)) {
                processedStyleData = processedStyleData.concat(styleRecord.style);
            }
        });
        console.log('Using concatenated style records:', processedStyleData);
    }

    // If no valid data, show grey bar
    if (processedStyleData.length === 0) {
        console.log('No valid style data found, showing grey bar');
        return (
            <Box
                sx={{
                    height: '8px',
                    width: '60px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                }}
                {...props}
            />
        );
    }

    console.log('Final processed style data:', processedStyleData);

    // Create gradient
    const gradient = createStyleGradient(processedStyleData);
    console.log('Generated gradient:', gradient);

    return (
        <Box
            sx={{
                height: '8px',
                width: '60px',
                backgroundImage: gradient,
                borderRadius: '4px',
                border: '1px solid #ddd',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                backgroundColor: '#e0e0e0', // Fallback color
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat'
            }}
            {...props}
        />
    );
};

// Custom Enable/Disable buttons that use individual updates
const BulkEnableButton = () => {
    const dataProvider = useDataProvider();
    const { selectedIds } = useListContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll('layers');
    const [isUpdating, setIsUpdating] = useState(false);

    if (selectedIds.length === 0) return null;

    const handleClick = async () => {
        setIsUpdating(true);
        try {
            const updatePromises = selectedIds.map(layerId =>
                dataProvider.update('layers', {
                    id: layerId,
                    data: { enabled: true },
                    previousData: { id: layerId }
                })
            );
            await Promise.all(updatePromises);
            notify(`✅ Enabled ${selectedIds.length} layer(s)`, { type: 'success' });
            refresh();
            unselectAll();
        } catch (error) {
            console.error('Error enabling layers:', error);
            notify('❌ Error enabling layers', { type: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Button
            label="Enable"
            onClick={handleClick}
            disabled={isUpdating}
            startIcon={<CheckCircleIcon />}
            sx={{ color: 'success.main' }}
        />
    );
};

const BulkDisableButton = () => {
    const dataProvider = useDataProvider();
    const { selectedIds } = useListContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll('layers');
    const [isUpdating, setIsUpdating] = useState(false);

    if (selectedIds.length === 0) return null;

    const handleClick = async () => {
        setIsUpdating(true);
        try {
            const updatePromises = selectedIds.map(layerId =>
                dataProvider.update('layers', {
                    id: layerId,
                    data: { enabled: false },
                    previousData: { id: layerId }
                })
            );
            await Promise.all(updatePromises);
            notify(`✅ Disabled ${selectedIds.length} layer(s)`, { type: 'success' });
            refresh();
            unselectAll();
        } catch (error) {
            console.error('Error disabling layers:', error);
            notify('❌ Error disabling layers', { type: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Button
            label="Disable"
            onClick={handleClick}
            disabled={isUpdating}
            sx={{ color: 'error.main' }}
        />
    );
};

const StyleSelectMenu = () => {
    const { data, loading } = useGetList('styles');
    const dataProvider = useDataProvider();
    const { selectedIds } = useListContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll('layers');
    const [selectedStyle, setSelectedStyle] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    if (loading) return <Loading small />;
    if (!data || selectedIds.length === 0) return null;

    const handleChange = async (event) => {
        const newStyleId = event.target.value;
        setSelectedStyle(newStyleId);
        setIsUpdating(true);

        try {
            // Update each layer individually
            const updatePromises = selectedIds.map(layerId =>
                dataProvider.update('layers', {
                    id: layerId,
                    data: { style_id: newStyleId === 'remove' ? null : newStyleId },
                    previousData: { id: layerId }
                })
            );

            await Promise.all(updatePromises);

            if (newStyleId === 'remove') {
                notify(`✅ Removed style from ${selectedIds.length} layer(s)`, { type: 'success' });
            } else {
                const styleName = data.find(style => style.id === newStyleId)?.name || newStyleId;
                notify(`✅ Applied style "${styleName}" to ${selectedIds.length} layer(s)`, { type: 'success' });
            }
            refresh();
            unselectAll();
            setSelectedStyle('');
        } catch (error) {
            console.error('Error updating layer styles:', error);
            notify('❌ Error updating layer style', { type: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Box sx={{ minWidth: 250 }}>
            <Select
                size="small"
                value={selectedStyle}
                onChange={handleChange}
                displayEmpty
                placeholder="Apply Style"
                disabled={isUpdating}
                sx={{
                    height: '36px',
                    minWidth: 250,
                    '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center'
                    }
                }}
            >
                <MenuItem disabled value="">
                    <em>🎨 Apply Style to {selectedIds.length} selected</em>
                </MenuItem>
                <MenuItem value="remove">
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <DeleteIcon sx={{ fontSize: '1rem', mr: 1, color: 'error.main' }} />
                        <Typography variant="body2" sx={{ flex: 1, color: 'error.main' }}>
                            Remove Style
                        </Typography>
                    </Box>
                </MenuItem>
                {data.map(style => {
                    return (
                        <MenuItem key={style.id} value={style.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                    🎨 {style.name}
                                </Typography>
                                <Box sx={{ width: 60, height: 8, borderRadius: '4px', border: '1px solid #ddd', backgroundImage: createStyleGradient(style.style), backgroundColor: '#e0e0e0', backgroundSize: '100% 100%' }} />
                            </Box>
                        </MenuItem>
                    );
                })}
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
            <BulkEnableButton />
            <BulkDisableButton />
            <StyleSelectMenu />
            <BulkExportButton />
            <BulkDeleteButton
                mutationMode="pessimistic"
                confirmColor="error"
                confirmContent={`Are you sure you want to delete ${selectedIds.length} selected layers and their associated S3 files? This action cannot be undone.`}
                confirmTitle="Confirm Bulk Delete"
                label="Delete"
                icon={<DeleteIcon />}
            />
        </Stack>
    );
};


const ListActions = ({ setUploadDialogOpen }) => {
    const { selectedIds } = useListContext();

    return (
        <TopToolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" component="h2" sx={{ mr: 2 }}>
                    Layers
                </Typography>
                <FilterButton />
                {selectedIds.length > 0 && (
                    <>
                        <Divider orientation="vertical" flexItem />
                        <Typography variant="body2" color="text.secondary">
                            {selectedIds.length} selected
                        </Typography>
                        <Divider orientation="vertical" flexItem />
                        <BulkEnableButton />
                        <BulkDisableButton />
                        <StyleSelectMenu />
                        <BulkExportButton />
                        <BulkDeleteButton
                            mutationMode="pessimistic"
                            confirmColor="error"
                            confirmContent={`Are you sure you want to delete ${selectedIds.length} selected layers and their associated S3 files? This action cannot be undone.`}
                            confirmTitle="Confirm Bulk Delete"
                            label="Delete"
                            icon={<DeleteIcon />}
                        />
                    </>
                )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                    size="small"
                    onClick={() => window.location.reload()}
                    title="Refresh"
                >
                    <RefreshIcon />
                </IconButton>
                <ExportButton />
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => setUploadDialogOpen(true)}
                    label="UPLOAD"
                />
            </Box>
        </TopToolbar>
    );
};

// Upload Dialog with UppyUploader
const UploadDialog = ({ open, onClose }) => {
    const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0, isUploading: false });

    const isComplete = uploadProgress.completed === uploadProgress.total && uploadProgress.total > 0;
    const isUploading = uploadProgress.isUploading && uploadProgress.total > 0;

    return (
        <Dialog open={open} maxWidth="lg" fullWidth onClose={onClose}>
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}>
                {isComplete ? (
                    <CheckCircleIcon color="success" />
                ) : isUploading ? (
                    <CloudUploadIcon color="primary" />
                ) : (
                    <CloudUploadIcon />
                )}
                <Typography variant="h6">
                    Upload New Layer
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ pb: 3 }}>
                <UppyUploader
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
                                        transform: 'scale(1.02)'
                                    },
                                    transition: 'all 0.2s ease-in-out'
                                }}
                            >
                                {isUploading ? (
                                    `📤 Uploading ${uploadProgress.completed} of ${uploadProgress.total} files...`
                                ) : uploadProgress.total > 0 ? (
                                    `✅ Uploaded ${uploadProgress.completed} of ${uploadProgress.total} files`
                                ) : (
                                    'Close'
                                )}
                            </Button>
                        </Box>
                    }
                    isComplete={isComplete}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                />
            </DialogContent>
        </Dialog>
    );
};

export const LayerList = () => {
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    const PostPagination = props => (
        <Pagination
            rowsPerPageOptions={[10, 25, 50, 100, 250, 500, 1000]}
            {...props}
        />
    );

    return (
        <>
            <List
                queryOptions={{ refetchInterval: 5000 }}
                storeKey={false}
                perPage={25}
                pagination={<PostPagination />}
                actions={<ListActions setUploadDialogOpen={setUploadDialogOpen} />}
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
            {/* Layers Table */}
            <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                <Datagrid
                    size="small"
                    rowSelect={true}
                    sx={{
                        '& .RaDatagrid-headerCell': {
                            fontWeight: 600,
                            backgroundColor: 'grey.50',
                            py: 0.5,
                            px: 1,
                            fontSize: '0.8rem'
                        },
                        '& .RaDatagrid-row': {
                            '&:hover': {
                                backgroundColor: 'action.hover'
                            }
                        },
                        '& .RaDatagrid-rowCell': {
                            py: 0.5,
                            px: 1,
                            fontSize: '0.8rem'
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
                        sx={{ textTransform: 'capitalize' }}
                    />
                    <TextField
                        source="water_model"
                        label="Water Model"
                    />
                    <TextField
                        source="climate_model"
                        label="Climate Model"
                    />
                    <TextField
                        source="scenario"
                        label="Scenario"
                        sx={{ textTransform: 'uppercase' }}
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
                        render={() => <StyleDisplay />}
                    />
                    <FunctionField
                        label="Actions"
                        textAlign="center"
                        render={record => {
                            // Construct the frontend URL with layer parameters
                            const params = new URLSearchParams({
                                crop: record.crop,
                                water_model: record.water_model,
                                climate_model: record.climate_model,
                                scenario: record.scenario,
                                variable: record.variable,
                                year: record.year
                            });
                            const mapUrl = `/?${params.toString()}`;

                            return (
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                    <Tooltip title={record.enabled ? "Open in map" : "Layer is disabled"}>
                                        <span>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (record.enabled) {
                                                        window.open(mapUrl, '_blank');
                                                    }
                                                }}
                                                disabled={!record.enabled}
                                                sx={{
                                                    color: record.enabled ? 'primary.main' : 'action.disabled'
                                                }}
                                            >
                                                <MapIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
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
                            );
                        }}
                    />
                </Datagrid>
            </Card>
        </List>

        {/* Upload Dialog */}
        <UploadDialog
            open={uploadDialogOpen}
            onClose={() => setUploadDialogOpen(false)}
        />
        </>
    );
};

export default LayerList;
