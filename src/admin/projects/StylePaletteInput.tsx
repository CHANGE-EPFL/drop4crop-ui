import { useGetList } from 'react-admin';
import { useController } from 'react-hook-form';
import { Box, FormControl, IconButton, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { createStyleGradient } from '../../utils/styleUtils';

interface StylePreviewProps {
    style: any;
    height?: number;
    width?: number;
}

const StylePreview: React.FC<StylePreviewProps> = ({ style, height = 12, width = 80 }) => {
    if (!style?.style?.length) {
        return (
            <Box
                sx={{
                    height: `${height}px`,
                    width: `${width}px`,
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                }}
            />
        );
    }

    if (style.interpolation_type === 'discrete') {
        const stops = [...style.style].sort((a: any, b: any) => a.value - b.value);
        return (
            <Box
                sx={{
                    display: 'flex',
                    height: `${height}px`,
                    width: `${width}px`,
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid #ddd',
                }}
            >
                {stops.map((stop: any, i: number) => (
                    <Box
                        key={i}
                        sx={{
                            flex: 1,
                            backgroundColor: `rgba(${stop.red},${stop.green},${stop.blue},${(stop.opacity || 255) / 255})`,
                        }}
                    />
                ))}
            </Box>
        );
    }

    return (
        <Box
            sx={{
                height: `${height}px`,
                width: `${width}px`,
                background: createStyleGradient(style.style),
                borderRadius: '4px',
                border: '1px solid #ddd',
            }}
        />
    );
};

interface StylePaletteInputProps {
    source: string;
    label?: string;
    helperText?: string;
}

const StylePaletteInput: React.FC<StylePaletteInputProps> = ({
    source,
    label = 'Card preview style',
    helperText,
}) => {
    const { field } = useController({ name: source });
    const { data: styles } = useGetList('styles', {
        pagination: { page: 1, perPage: 200 },
        sort: { field: 'name', order: 'ASC' },
    });

    const value = field.value ?? '';

    return (
        <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id={`${source}-label`}>{label}</InputLabel>
            <Select
                labelId={`${source}-label`}
                label={label}
                value={value}
                onChange={(e) => field.onChange(e.target.value || null)}
                endAdornment={
                    value ? (
                        <IconButton
                            size="small"
                            sx={{ mr: 3 }}
                            onMouseDown={(e) => {
                                // Stop the Select from opening when clicking the clear button.
                                e.stopPropagation();
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                field.onChange(null);
                            }}
                        >
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    ) : null
                }
                renderValue={(selected) => {
                    if (!selected) return <em>Use layer default</em>;
                    const s = styles?.find((s: any) => s.id === selected);
                    if (!s) return String(selected);
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{s.name}</Typography>
                            <StylePreview style={s} />
                        </Box>
                    );
                }}
            >
                <MenuItem value="">
                    <em>Use layer default</em>
                </MenuItem>
                {styles?.map((s: any) => (
                    <MenuItem key={s.id} value={s.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%' }}>
                            <Typography variant="body2">{s.name}</Typography>
                            <StylePreview style={s} />
                        </Box>
                    </MenuItem>
                ))}
            </Select>
            {helperText && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5 }}>
                    {helperText}
                </Typography>
            )}
        </FormControl>
    );
};

export default StylePaletteInput;
