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
} from "react-admin";
import { useState } from 'react';
import { FilterList, FilterListItem } from 'react-admin';
import { Card, CardContent, Typography } from '@mui/material';
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

export const ColorBar = () => {
    const record = useRecordContext();
    if (!record || !record.style || record.style.length == 0) return null;
    const style = record.style;
    const gradient = `linear-gradient(to right, ${style.map(
        color => `rgba(${color.red},${color.green},${color.blue},${color.opacity / 255})`
    ).join(", ")})`;
    return (
        <div style={{ height: '20px', marginBottom: '10px', background: gradient }} />
    );
};


const StyleSelectMenu = () => {
    const { data, loading } = useGetList('styles');
    const [updateMany] = useUpdateMany();
    const { selectedIds } = useListContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll('layers');
    const [selectedStyle, setSelectedStyle] = useState('');  // State for the selected value

    if (loading) return <Loading />;
    if (!data) return null;

    const handleChange = (event) => {
        const newStyleId = event.target.value;
        setSelectedStyle(newStyleId);  // Update the selected value state

        // Update the selected style for all selected layers
        updateMany(
            'layers',
            { ids: selectedIds, data: { style_id: newStyleId } }
        ).then(() => {
            notify('Updating layers with new style: ' + newStyleId);
            refresh(); // Refresh the list to reflect the changes
            unselectAll(); // Unselect all after update
            setSelectedStyle(''); // Reset the selected style to empty
        }).catch(() => {
            notify('Error updating layer style', { type: 'error' });
        });
    };

    const MenuItems = data.map(style => (
        <MenuItem key={style.id} value={style.id}>
            {style.name}
        </MenuItem>
    ));

    return (
        <>
            <Select
                label="Style"
                value={selectedStyle}  // Bind value to the state
                onChange={handleChange}  // Handle changes
                displayEmpty
                renderValue={(value) => value ? data.find(style => style.id === value)?.name : "Select style"}
                sx={{ height: '32px' }}
            >
                <MenuItem disabled value="">
                    <em>Select style</em>
                </MenuItem>
                {MenuItems}
            </Select>
        </>
    );
};

const BulkActionButtons = () => {
    // Use the data from the styles endpoint to populate a drop down to
    // use with the BulkUpdateButton
    return (
        <Fragment>
            <BulkUpdateButton
                label="Disable"
                mutationMode="pessimistic"
                data={{ enabled: false }}
            />
            <BulkUpdateButton
                label="Enable"
                mutationMode="pessimistic"
                data={{ enabled: true }}
            />
            <BulkDeleteButton mutationMode="pessimistic" />
            <StyleSelectMenu />
            <BulkExportButton />
            {/* <BulkDeleteButton mutationMode="pessimistic"/> */}
        </Fragment >
    )
};


export const FilterSidebar = () => {
    return (
        <Card sx={{
            order: -1, mr: 2, mt: 6, width:
                400
        }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Filters
                </Typography>

                <FilterList label="Enabled" icon={<CategoryIcon />}>
                    <FilterListItem label="True" value={{ enabled: true }} />
                    <FilterListItem label="False" value={{ enabled: false }} />
                </FilterList>
                <FilterList label="Crop Specific" icon={<CheckCircleIcon />}>
                    <FilterListItem label="True" value={{ is_crop_specific: true }} />
                    <FilterListItem label="False" value={{ is_crop_specific: false }} />
                </FilterList>

                <FilterList label="Crop" icon={<GrassIcon />}>
                    {cropItems.map(item => (
                        <FilterListItem
                            key={item.id}
                            label={item.name}
                            value={{ crop: item.id }}
                        />
                    ))}
                </FilterList>
                <FilterList label="Water model" icon={<FontAwesomeIcon icon={faWater} />}>
                    {globalWaterModelsItems.map(item => (
                        <FilterListItem
                            key={item.id}
                            label={item.name}
                            value={{ water_model: item.id }}
                        />
                    ))}
                </FilterList>
                <FilterList label="Climate model" icon={<FontAwesomeIcon icon={faCloudSun} />}>
                    {climateModelsItems.map(item => (
                        <FilterListItem
                            key={item.id}
                            label={item.name}
                            value={{ climate_model: item.id }}
                        />
                    ))}
                </FilterList>
                <FilterList label="Scenario" icon={<FontAwesomeIcon icon={faCogs} />}>
                    {scenariosItems.map(item => (
                        <FilterListItem
                            key={item.id}
                            label={item.name}
                            value={{ scenario: item.id }}
                        />
                    ))}
                </FilterList>
                <FilterList label="Variable" icon={<FontAwesomeIcon icon={faLayerGroup} />}>
                    {variablesItems.map(item => (
                        <FilterListItem
                            key={item.id}
                            label={item.name}
                            value={{ variable: item.id }}
                        />
                    ))}
                </FilterList>
                <FilterList label="Year" icon={<FontAwesomeIcon icon={faCalendarAlt} />}>
                    {yearItems.map(item => (
                        <FilterListItem
                            key={item.id}
                            label={item.name}
                            value={{ year: item.id }}
                        />
                    ))}
                </FilterList>

            </CardContent>
        </Card>
    )
};
const ListActions = () => (
    <TopToolbar>
        <SelectColumnsButton />
        <CreateButton />
        <ExportButton />
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
        >
            <UppyUploader />
            <DatagridConfigurable
                rowClick="show"
                bulkActionButtons={<BulkActionButtons />}
                size="small"
            >
                <TextField source="crop" />
                <TextField source="water_model" />
                <TextField source="climate_model" />
                <TextField source="scenario" />
                <TextField source="variable" />
                <TextField source="year" />
                <BooleanField source="enabled" />
                <BooleanField source="is_crop_specific" label="Crop specific" />
                <TextField source="style.name" label="Style" />
                <ColorBar label="Style Bar" />
            </DatagridConfigurable>
        </List>
    );
};

export default LayerList;
