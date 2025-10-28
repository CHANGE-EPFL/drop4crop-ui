/* eslint react/jsx-key: off */
import {
    Create,
    SimpleForm,
    TextField,
    TextInput,
    required,
    useCreate,
    Toolbar,
    SaveButton,
    useRedirect,
    ReferenceInput,
    SelectInput,
} from 'react-admin';
import { useState } from 'react';
import { LocationFieldAreasCreate } from '../maps/Areas';

const AreaCreate = () => {

    return (
        <Create redirect="show">
            <SimpleForm  >
                <TextField source="id" />
                <TextInput source="name" validate={[required()]} />
                <TextInput source="description" />
                <ReferenceInput
                    source="project_id"
                    reference="projects"
                    sort={{ field: 'name', order: 'ASC' }}
                >
                    <SelectInput
                        label="Associated project"
                        source="projects_id"
                        optionText={(record) => `${record.name}`}
                        validate={required()}
                    />
                </ReferenceInput>
            </SimpleForm>
        </Create >

    )
};

export default AreaCreate;
