import {
    Show,
    SimpleShowLayout,
    TextField,
    ReferenceManyCount,
    TopToolbar,
    EditButton,
    DeleteButton,
    usePermissions,
    ReferenceField,
    DateField,
} from "react-admin";
import { LocationFieldPoints } from '../maps/Points';

const AreaShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <>
                <EditButton />
                <DeleteButton />
            </>}
        </TopToolbar>
    );
}

export const AreaShow = () => {
    return (
        <Show actions={<AreaShowActions />} >
            <SimpleShowLayout>
                <TextField source="name" />
                <TextField source="description" />
                <DateField source="last_updated" showTime/>
                <ReferenceField
                    label="Project"
                    source="project_id"
                    reference="projects"
                    link="show"
                    emptyText="N/A"
                    sortable={false}
                >
                    <TextField source="name" />
                </ReferenceField>
                <ReferenceManyCount
                    label="Sensors"
                    reference="sensors"
                    target="area_id"
                    link
                />
                <ReferenceManyCount
                    label="Plots"
                    reference="plots"
                    target="area_id"
                    link
                />
                <ReferenceManyCount
                    label="Soil Profiles"
                    reference="soil_profiles"
                    target="area_id"
                    link
                />
                
                <LocationFieldPoints />
            </SimpleShowLayout>
        </Show>
    )
};

export default AreaShow;
