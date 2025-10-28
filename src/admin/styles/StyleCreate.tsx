/* eslint react/jsx-key: off */
import {
    ArrayInput,
    Create,
    NumberInput,
    SimpleForm,
    SimpleFormIterator,
    TextField,
    TextInput,
    required,
} from 'react-admin';
import { UpdateFromCSV } from './StyleEdit';

const StyleCreate = () => {
    return (
        <Create redirect="show">
            <SimpleForm  >
                <TextField source="id" />
                <TextInput source="name" validate={[required()]} />
                <UpdateFromCSV />
                <ArrayInput source="style" validate={[required()]}>
                    <SimpleFormIterator
                        inline
                    >
                        <NumberInput source="value" validate={[required()]} sx={{ width: '10%' }} />
                        <NumberInput source="red" validate={[required()]} sx={{ width: '10%' }} />
                        <NumberInput source="green" validate={[required()]} sx={{ width: '10%' }} />
                        <NumberInput source="blue" validate={[required()]} sx={{ width: '10%' }} />
                        <NumberInput source="opacity" validate={[required()]} sx={{ width: '10%' }} defaultValue={255} />
                        <NumberInput source="label" validate={[required()]} sx={{ width: '10%' }} />
                    </SimpleFormIterator>
                </ArrayInput>
            </SimpleForm>
        </Create >
    )
};

export default StyleCreate;
