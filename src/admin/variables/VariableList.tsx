import {
    List,
    Datagrid,
    TextField,
    NumberField,
    BooleanField,
    ReferenceField,
} from 'react-admin';
import { LayerCountField } from '../shared/LayerCountField';

const VariableList = () => {
    return (
        <List perPage={25} storeKey={false}>
            <Datagrid rowClick="edit">
                <TextField source="slug" />
                <TextField source="name" />
                <LayerCountField label="Layers" />
                <TextField source="abbreviation" />
                <TextField source="unit" />
                <BooleanField source="is_crop_specific" />
                <BooleanField source="has_time" label="Has time" />
                <ReferenceField source="group_id" reference="variable-groups" link="edit" emptyText="—" label="Group">
                    <TextField source="name" />
                </ReferenceField>
                <NumberField source="sort_order" />
            </Datagrid>
        </List>
    );
};

export default VariableList;
