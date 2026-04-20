import {
    List,
    Datagrid,
    TextField,
    NumberField,
} from 'react-admin';

const CropList = () => {
    return (
        <List perPage={25} storeKey={false}>
            <Datagrid rowClick="edit">
                <TextField source="slug" />
                <TextField source="name" />
                <NumberField source="sort_order" />
            </Datagrid>
        </List>
    );
};

export default CropList;
