import {
    AutocompleteInput,
    BooleanInput,
    NumberInput,
    ReferenceInput,
    TextInput,
    required,
} from 'react-admin';

interface ShowcaseItemFormProps {
    isEdit?: boolean;
}

const ShowcaseItemForm = ({ isEdit = false }: ShowcaseItemFormProps) => {
    return (
        <>
            {isEdit && <TextInput source="id" disabled />}
            <ReferenceInput source="project_id" reference="projects" fullWidth>
                <AutocompleteInput optionText="title" validate={[required()]} />
            </ReferenceInput>
            <ReferenceInput source="layer_id" reference="layers" fullWidth>
                <AutocompleteInput optionText="layer_name" validate={[required()]} />
            </ReferenceInput>
            <TextInput source="title" validate={[required()]} fullWidth />
            <TextInput source="description" multiline rows={3} fullWidth />
            <NumberInput source="sort_order" defaultValue={0} />
            <BooleanInput source="enabled" defaultValue={true} />
        </>
    );
};

export default ShowcaseItemForm;
