import {
    BooleanField,
    DateField,
    ReferenceField,
    Show,
    SimpleShowLayout,
    TextField,
    useRecordContext,
} from "react-admin";
import { Typography } from '@mui/material';

export const ColorBar = () => {
    const record = useRecordContext();
    if (!record || !record.style || record.style.length == 0) return null;
    const style = record.style;
    const gradient = `linear-gradient(to right, ${style.map(
        color => `rgba(${color.red},${color.green},${color.blue},${color.opacity / 255})`
    ).join(", ")})`;

    return (
        <div style={{ height: '20px', marginBottom: '10px', background: gradient }} />
    );
};

export const LayerShow = () => {
    return (
        <Show >
            <SimpleShowLayout>
                <TextField source="id" />
                <ColorBar />
                <ReferenceField source="style_id" reference="styles" link="show">
                    <TextField source="name" />
                </ReferenceField>
                <TextField source="layer_name" />
                <TextField source="filename" />
                <TextField source="crop" />
                <BooleanField source="is_crop_specific" />
                <TextField source="water_model" />
                <TextField source="climate_model" />
                <TextField source="scenario" />
                <TextField source="variable" />
                <TextField source="year" />
                <BooleanField source="enabled" />
            </SimpleShowLayout>
        </Show>
    )
};

export default LayerShow;
