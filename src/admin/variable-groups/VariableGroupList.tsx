import {
    List,
    Datagrid,
    TextField,
    NumberField,
    BooleanField,
    ReferenceField,
} from 'react-admin';

const VariableGroupList = () => {
    return (
        <List perPage={25} storeKey={false}>
            <Datagrid rowClick="edit">
                <TextField source="name" />
                <TextField source="help_text" />
                <NumberField source="sort_order" />
                <ReferenceField source="parent_id" reference="variable-groups" link="edit" emptyText="—">
                    <TextField source="name" />
                </ReferenceField>
                <ReferenceField source="required_crop_id" reference="crops" link={false} emptyText="—">
                    <TextField source="name" />
                </ReferenceField>
                <BooleanField source="display_stacked" label="Stacked" />
            </Datagrid>
        </List>
    );
};

export default VariableGroupList;
