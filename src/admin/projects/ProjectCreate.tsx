import {
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    BooleanInput,
    required,
} from 'react-admin';
import MapPreview from './MapPreview';

const ProjectCreate = () => {
    return (
        <Create redirect="show">
            <SimpleForm>
                <TextInput source="title" validate={[required()]} fullWidth />
                <TextInput
                    source="slug"
                    validate={[required()]}
                    helperText="URL-friendly identifier (e.g., 'water-footprints')"
                    fullWidth
                />
                <TextInput source="description" multiline rows={3} fullWidth />
                <MapPreview />
                <NumberInput source="latitude" defaultValue={20.0} step={0.1} />
                <NumberInput source="longitude" defaultValue={0.0} step={0.1} />
                <NumberInput
                    source="zoom_level"
                    defaultValue={2}
                    min={1}
                    max={18}
                    helperText="Map zoom level for splash page preview (1-18)"
                />
                <BooleanInput source="enabled" defaultValue={true} />
                <NumberInput
                    source="sort_order"
                    defaultValue={0}
                    helperText="Lower numbers appear first on the splash page"
                />
            </SimpleForm>
        </Create>
    );
};

export default ProjectCreate;
