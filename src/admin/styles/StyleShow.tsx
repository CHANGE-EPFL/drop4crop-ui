import React from 'react';
import {
    ArrayField,
    Datagrid,
    Show,
    SimpleShowLayout,
    TextField,
    useRecordContext,
} from "react-admin";

// Custom ColorBar component
export const ColorBar = () => {
    const record = useRecordContext();
    if (!record || !record.style) return null;
    const style = record.style;

    const gradient = `linear-gradient(to right, ${style.map(
        color => `rgba(${color.red},${color.green},${color.blue},${color.opacity / 255})`
    ).join(", ")})`;

    return (
        <div style={{ height: '20px', marginBottom: '10px', background: gradient }} />
    );
};

export const StyleShow = () => {
    return (
        <Show>
            <SimpleShowLayout>
                <ColorBar />
                <TextField source="name" />
                <ArrayField source="style">
                    <Datagrid bulkActionButtons={false}>
                        <TextField source="value" />
                        <TextField source="red" />
                        <TextField source="green" />
                        <TextField source="blue" />
                        <TextField source="opacity" />
                        <TextField source="label" />
                    </Datagrid>
                </ArrayField>
                {/* Adding the ColorBar component */}
            </SimpleShowLayout>
        </Show>
    );
};

export default StyleShow;
