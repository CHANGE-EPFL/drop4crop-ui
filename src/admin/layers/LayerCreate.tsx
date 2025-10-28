/* eslint react/jsx-key: off */
import {
    Create,
    SimpleForm,
    TextField,
    TextInput,
    required,
} from 'react-admin';


const LayerCreate = () => {
    return (
        <Create redirect="show">
            <SimpleForm  >
                <TextField source="id" />
                <TextInput source="name" validate={[required()]} />
                <TextInput source="description" />
            </SimpleForm>
        </Create >
    )
};

export default LayerCreate;
