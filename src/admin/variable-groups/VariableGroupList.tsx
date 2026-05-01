import {
    List,
    Datagrid,
    TextField,
    NumberField,
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
            </Datagrid>
        </List>
    );
};

export default VariableGroupList;
