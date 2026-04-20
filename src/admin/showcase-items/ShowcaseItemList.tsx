import {
    List,
    Datagrid,
    TextField,
    NumberField,
    BooleanField,
    ReferenceField,
} from 'react-admin';

const ShowcaseItemList = () => {
    return (
        <List perPage={25} storeKey={false}>
            <Datagrid rowClick="edit">
                <TextField source="title" />
                <ReferenceField source="project_id" reference="projects">
                    <TextField source="title" />
                </ReferenceField>
                <ReferenceField source="layer_id" reference="layers">
                    <TextField source="layer_name" />
                </ReferenceField>
                <BooleanField source="enabled" />
                <NumberField source="sort_order" />
            </Datagrid>
        </List>
    );
};

export default ShowcaseItemList;
