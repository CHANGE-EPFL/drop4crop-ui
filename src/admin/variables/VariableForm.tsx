import { BooleanInput, NumberInput, TextInput, required } from 'react-admin';

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
            <TextInput source="group_name" fullWidth helperText="UI grouping name (e.g., Water Footprint, Evapotranspiration)" />
            <NumberInput source="sort_order" defaultValue={0} />
        </>
    );
};

export default VariableForm;
