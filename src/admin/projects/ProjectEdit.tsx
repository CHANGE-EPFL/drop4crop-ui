import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    BooleanInput,
    required,
} from 'react-admin';
import MapPreview from './MapPreview';

const ProjectEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="title" validate={[required()]} fullWidth />
                <TextInput
                    source="slug"
                    validate={[required()]}
                    helperText="URL-friendly identifier (e.g., 'water-footprints')"
                    fullWidth
                />
                <TextInput source="description" multiline rows={3} fullWidth />
                <MapPreview />
                <NumberInput source="latitude" step={0.1} />
                <NumberInput source="longitude" step={0.1} />
                <NumberInput
                    source="zoom_level"
                    min={1}
                    max={18}
                    helperText="Map zoom level for splash page preview (1-18)"
                />
                <BooleanInput source="enabled" />
                <NumberInput
                    source="sort_order"
                    helperText="Lower numbers appear first on the splash page"
                />
            </SimpleForm>
        </Edit>
    );
};

export default ProjectEdit;
