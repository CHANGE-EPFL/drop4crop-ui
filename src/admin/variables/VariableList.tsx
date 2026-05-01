import {
    List,
    Datagrid,
    TextField,
    NumberField,
    BooleanField,
    ReferenceField,
} from 'react-admin';

const VariableList = () => {
    return (
        <List perPage={25} storeKey={false}>
            <Datagrid rowClick="edit">
                <TextField source="slug" />
                <TextField source="name" />
                <TextField source="abbreviation" />
                <TextField source="unit" />
                <BooleanField source="is_crop_specific" />
                <BooleanField source="has_time" label="Has time" />
                <TextField source="group_name" />
                <ReferenceField source="group_id" reference="variable-groups" link="edit" emptyText="—">
                    <TextField source="name" />
                </ReferenceField>
                <NumberField source="sort_order" />
            </Datagrid>
        </List>
    );
};

export default VariableList;
