import { BooleanInput, NumberInput, TextInput, ReferenceInput, AutocompleteInput, required } from 'react-admin';

interface VariableFormProps {
    isEdit?: boolean;
}

const VariableForm = ({ isEdit = false }: VariableFormProps) => {
    return (
        <>
            {isEdit && <TextInput source="id" disabled />}
            <TextInput source="slug" validate={[required()]} fullWidth helperText="URL-friendly identifier matching layer filenames" />
            <TextInput source="name" fullWidth helperText="Display name (optional — leave blank to show only abbreviation)" />
            <TextInput source="abbreviation" fullWidth helperText="Short label for UI display (e.g., VWC, WF, ET). Optional — leave blank to show only name." />
            <TextInput source="subscript" fullWidth helperText="Optional subscript (e.g., b for blue, g for green)" />
            <TextInput source="unit" validate={[required()]} fullWidth />
            <BooleanInput source="is_crop_specific" defaultValue={false} />
            <BooleanInput
                source="has_time"
                defaultValue={true}
                helperText="Whether this variable varies over time. Controls the year slider in the public UI."
            />
            <ReferenceInput source="group_id" reference="variable-groups" perPage={100}>
                <AutocompleteInput optionText={(record: any) => `${record.name} (${record.parent_id ? 'tier 2' : 'tier 1'})`} label="Group" helperText="Assigns this variable to a group in the public UI" fullWidth />
            </ReferenceInput>
            <NumberInput source="sort_order" defaultValue={0} />
        </>
    );
};

export default VariableForm;
