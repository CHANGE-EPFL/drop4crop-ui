import { useRecordContext } from 'react-admin';

type Props = {
    label?: string;
};

export const LayerCountField = (_: Props) => {
    const record = useRecordContext();
    if (!record) return null;
    return <span>{record.layer_count ?? 0}</span>;
};

export default LayerCountField;
