/* eslint react/jsx-key: off */
import {
    Edit,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    required
} from 'react-admin';

const AreaEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput disabled label="Id" source="id" />
                <TextInput source="name" validate={required()} />
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
        </Edit>
    )
};

export default AreaEdit;
