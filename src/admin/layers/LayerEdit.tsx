/* eslint react/jsx-key: off */
import {
    AutocompleteInput,
    BooleanInput,
    Edit,
    NumberInput,
    ReferenceInput,
    SimpleForm,
    TextInput,
} from 'react-admin';

const LayerEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput disabled label="Id" source="id" />
                <ReferenceInput source="project_id" reference="projects">
                    <AutocompleteInput optionText="title" />
                </ReferenceInput>
                <TextInput source="layer_name" disabled />
                <ReferenceInput source="crop_id" reference="crops" sort={{ field: 'sort_order', order: 'ASC' }} perPage={500}>
                    <AutocompleteInput optionText="name" />
                </ReferenceInput>
                <ReferenceInput source="water_model_id" reference="water-models" sort={{ field: 'sort_order', order: 'ASC' }} perPage={500}>
                    <AutocompleteInput optionText="name" />
                </ReferenceInput>
                <ReferenceInput source="climate_model_id" reference="climate-models" sort={{ field: 'sort_order', order: 'ASC' }} perPage={500}>
                    <AutocompleteInput optionText="name" />
                </ReferenceInput>
                <ReferenceInput source="scenario_id" reference="scenarios" sort={{ field: 'sort_order', order: 'ASC' }} perPage={500}>
                    <AutocompleteInput optionText="name" />
                </ReferenceInput>
                <ReferenceInput source="variable_id" reference="variables" sort={{ field: 'sort_order', order: 'ASC' }} perPage={500}>
                    <AutocompleteInput optionText="name" />
                </ReferenceInput>
                <NumberInput source="year" />
                <BooleanInput source="enabled" />
                <ReferenceInput source="style_id" reference="styles">
                    <AutocompleteInput optionText="name" />
                </ReferenceInput>
            </SimpleForm>
        </Edit>
    );
};

export default LayerEdit;
