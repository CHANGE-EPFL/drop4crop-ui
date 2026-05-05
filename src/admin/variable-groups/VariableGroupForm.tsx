import {
    NumberInput,
    ReferenceInput,
    AutocompleteInput,
    TextInput,
    BooleanInput,
    required,
} from 'react-admin';

interface VariableGroupFormProps {
    isEdit?: boolean;
}

const VariableGroupForm = ({ isEdit = false }: VariableGroupFormProps) => {
    return (
        <>
            {isEdit && <TextInput source="id" disabled />}
            <TextInput source="name" validate={[required()]} fullWidth helperText="Group display name (e.g., Soil factors). Use <br> for a new line." />
            <TextInput
                source="help_text"
                multiline
                rows={3}
                fullWidth
                helperText="Help text shown as tooltip next to group header (supports markdown)"
            />
            <NumberInput source="sort_order" defaultValue={0} helperText="Lower numbers appear first" />
            <ReferenceInput
                source="parent_id"
                reference="variable-groups"
                perPage={100}
                filter={{ parent_id: null }}
            >
                <AutocompleteInput
                    optionText="name"
                    label="Parent group (tier 1)"
                    helperText="Leave empty for a top-level (tier 1) group. Select a parent to make this a sub-group (tier 2)."
                    fullWidth
                />
            </ReferenceInput>
            <ReferenceInput
                source="required_crop_id"
                reference="crops"
                perPage={100}
            >
                <AutocompleteInput
                    optionText="name"
                    label="Required crop"
                    helperText="If set, selecting a variable from this group auto-switches the crop. Child groups inherit from parent."
                    fullWidth
                />
            </ReferenceInput>
            <BooleanInput
                source="display_stacked"
                label="Stack chips vertically"
                helperText="Show each variable on its own line instead of flowing horizontally"
            />
        </>
    );
};

export default VariableGroupForm;
