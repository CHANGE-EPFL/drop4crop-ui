import {
    List,
    Datagrid,
    TextField,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    useRecordContext,
    FunctionField,
} from "react-admin";
import { LocationFieldAreas } from '../maps/Areas';

const AreaListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

export const ColorBox = () => {
    const record = useRecordContext();

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
                style={{
                    width: '20px', // Size of the box
                    height: '20px', // Size of the box
                    backgroundColor: record.project.color, // Use the record color
                    border: '1px solid #ccc', // Optional border for visibility
                    marginRight: '10px', // Space between box and text
                }}
            />
            <TextField source="project.name" />
        </div>
    );
};

export const AreaList = () => {
    return (
        <List actions={<AreaListActions />} storeKey={false}>
            <Datagrid rowClick="show" >
                <TextField source="name" />
                <TextField source="description" />
                <FunctionField render={record => `${record.sensors.length}`} label="Sensors" />
                <FunctionField render={record => `${record.plots.length}`} label="Plots" />
                <FunctionField render={record => `${record.soil_profiles.length}`} label="Soil Profiles" />
                <FunctionField render={record => `${record.transects.length}`} label="Transects" />
                <FunctionField render={() => <ColorBox />} label="Project" />
            </Datagrid>
            <LocationFieldAreas />
        </List>
    );
};

export default AreaList;
