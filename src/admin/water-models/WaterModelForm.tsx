import { NumberInput, TextInput, required } from 'react-admin';

interface WaterModelFormProps {
    isEdit?: boolean;
}

const WaterModelForm = ({ isEdit = false }: WaterModelFormProps) => {
    return (
        <>
            {isEdit && <TextInput source="id" disabled />}
            <TextInput source="slug" validate={[required()]} fullWidth helperText="URL-friendly identifier (lowercase, no spaces)" />
            <TextInput source="name" validate={[required()]} fullWidth />
            <NumberInput source="sort_order" defaultValue={0} />
        </>
    );
};

export default WaterModelForm;
