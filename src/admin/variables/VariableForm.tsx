import { BooleanInput, NumberInput, TextInput, required } from 'react-admin';

interface VariableFormProps {
    isEdit?: boolean;
}

const VariableForm = ({ isEdit = false }: VariableFormProps) => {
    return (
        <>
            {isEdit && <TextInput source="id" disabled />}
            <TextInput source="slug" validate={[required()]} fullWidth helperText="URL-friendly identifier matching layer filenames" />
            <TextInput source="name" validate={[required()]} fullWidth />
            <TextInput source="abbreviation" validate={[required()]} fullWidth helperText="Short label for UI display (e.g., VWC, WF, ET)" />
            <TextInput source="subscript" fullWidth helperText="Optional subscript (e.g., b for blue, g for green)" />
            <TextInput source="unit" validate={[required()]} fullWidth />
            <BooleanInput source="is_crop_specific" defaultValue={false} />
            <TextInput source="group_name" fullWidth helperText="UI grouping name (e.g., Water Footprint, Evapotranspiration)" />
            <NumberInput source="sort_order" defaultValue={0} />
        </>
    );
};

export default VariableForm;
