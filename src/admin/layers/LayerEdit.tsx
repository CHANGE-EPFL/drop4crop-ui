/* eslint react/jsx-key: off */
import {
    BooleanInput,
    Edit,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    required
} from 'react-admin';
import {
    globalWaterModelsItems,
    climateModelsItems,
    cropItems,
    scenariosItems,
    variablesItems,
    yearItems
} from '../options';

const LayerEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput disabled label="Id" source="id" />
                <TextInput source="layer_name" disabled />
                <SelectInput source="crop" choices={cropItems} required />
                <SelectInput source="water_model" choices={globalWaterModelsItems} />
                <SelectInput source="climate_model" choices={climateModelsItems} />
                <SelectInput source="scenario" choices={scenariosItems} />
                <SelectInput source="variable" choices={variablesItems} />
                <SelectInput source="year" choices={yearItems} />
                <BooleanInput source="enabled" />
                <ReferenceInput source="style_id" reference="styles" >
                    <SelectInput />
                </ReferenceInput>
            </SimpleForm>
        </Edit>
    )
};

export default LayerEdit;
