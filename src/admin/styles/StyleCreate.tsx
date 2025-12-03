/* eslint react/jsx-key: off */
import {
    ArrayInput,
    Create,
    NumberInput,
    SelectInput,
    SimpleForm,
    SimpleFormIterator,
    TextInput,
    required,
} from 'react-admin';
import { UpdateFromQGIS } from './StyleEdit';

const interpolationTypeChoices = [
    { id: 'linear', name: 'Linear (smooth gradient)' },
    { id: 'discrete', name: 'Discrete (stepped/bucketed)' },
];

const StyleCreate = () => {
    return (
        <Create redirect="show">
            <SimpleForm>
                <TextInput source="name" validate={[required()]} fullWidth />
                <SelectInput
                    source="interpolation_type"
                    choices={interpolationTypeChoices}
                    defaultValue="linear"
                    helperText="Linear: smooth gradient between colors. Discrete: each value falls into a bucket."
                />
                <UpdateFromQGIS />
                <ArrayInput source="style" validate={[required()]}>
                    <SimpleFormIterator inline>
                        <NumberInput source="value" validate={[required()]} sx={{ width: '12%' }} helperText="Threshold value" />
                        <NumberInput source="red" validate={[required()]} sx={{ width: '10%' }} min={0} max={255} />
                        <NumberInput source="green" validate={[required()]} sx={{ width: '10%' }} min={0} max={255} />
                        <NumberInput source="blue" validate={[required()]} sx={{ width: '10%' }} min={0} max={255} />
                        <NumberInput source="opacity" validate={[required()]} sx={{ width: '10%' }} min={0} max={255} defaultValue={255} />
                        <TextInput source="label" sx={{ width: '20%' }} helperText="e.g., '0.1 - 0.2'" />
                    </SimpleFormIterator>
                </ArrayInput>
            </SimpleForm>
        </Create>
    );
};

export default StyleCreate;
