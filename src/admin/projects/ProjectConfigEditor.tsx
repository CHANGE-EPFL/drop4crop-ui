import { useState, useEffect, useCallback } from 'react';
import { useRecordContext, useGetList, useNotify } from 'react-admin';
import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Button,
    CircularProgress,
    Chip,
    Divider,
    Paper,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';

interface RefItem {
    id: string;
    name: string;
    slug?: string;
    sort_order?: number;
}

const ConfigSectionPanel = ({
    label,
    items,
    selectedIds,
    onToggle,
    onSelectAll,
    onDeselectAll,
}: {
    label: string;
    items: RefItem[];
    selectedIds: Set<string>;
    onToggle: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
}) => {
    const sorted = [...items].sort((a, b) => {
        if (a.sort_order != null && b.sort_order != null) return a.sort_order - b.sort_order;
        return a.name.localeCompare(b.name);
    });

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {label}
                </Typography>
                <Chip
                    label={`${selectedIds.size} / ${items.length}`}
                    size="small"
                    color={selectedIds.size > 0 ? 'primary' : 'default'}
                    variant="outlined"
                />
                <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                    <Button size="small" onClick={onSelectAll}>
                        Select All
                    </Button>
                    <Button size="small" onClick={onDeselectAll}>
                        Clear
                    </Button>
                </Box>
            </Box>
            <FormGroup row sx={{ gap: 0.5 }}>
                {sorted.map((item) => (
                    <FormControlLabel
                        key={item.id}
                        control={
                            <Checkbox
                                checked={selectedIds.has(item.id)}
                                onChange={() => onToggle(item.id)}
                                size="small"
                            />
                        }
                        label={item.name}
                        sx={{
                            border: '1px solid',
                            borderColor: selectedIds.has(item.id) ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            px: 1,
                            py: 0,
                            m: 0,
                            backgroundColor: selectedIds.has(item.id) ? 'primary.50' : 'transparent',
                            '&:hover': { borderColor: 'primary.main' },
                        }}
                    />
                ))}
            </FormGroup>
        </Box>
    );
};

const ProjectConfigEditor = () => {
    const record = useRecordContext();
    const notify = useNotify();

    const [selections, setSelections] = useState<Record<string, Set<string>>>({
        crops: new Set(),
        'water-models': new Set(),
        'climate-models': new Set(),
        scenarios: new Set(),
        variables: new Set(),
    });
    const [configLoading, setConfigLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    // Fetch all reference items via useGetList
    const { data: cropsData, isLoading: cropsLoading } = useGetList('crops', {
        pagination: { page: 1, perPage: 500 },
        sort: { field: 'sort_order', order: 'ASC' },
    });
    const { data: waterModelsData, isLoading: wmLoading } = useGetList('water-models', {
        pagination: { page: 1, perPage: 500 },
        sort: { field: 'sort_order', order: 'ASC' },
    });
    const { data: climateModelsData, isLoading: cmLoading } = useGetList('climate-models', {
        pagination: { page: 1, perPage: 500 },
        sort: { field: 'sort_order', order: 'ASC' },
    });
    const { data: scenariosData, isLoading: scLoading } = useGetList('scenarios', {
        pagination: { page: 1, perPage: 500 },
        sort: { field: 'sort_order', order: 'ASC' },
    });
    const { data: variablesData, isLoading: varLoading } = useGetList('variables', {
        pagination: { page: 1, perPage: 500 },
        sort: { field: 'sort_order', order: 'ASC' },
    });

    // Fetch current config via the public config endpoint
    useEffect(() => {
        if (!record?.slug) return;

        setConfigLoading(true);
        fetch(`/api/projects/config/${record.slug}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch config');
                return res.json();
            })
            .then((data) => {
                setSelections({
                    crops: new Set((data.crops || []).map((c: any) => c.id)),
                    'water-models': new Set((data.water_models || []).map((w: any) => w.id)),
                    'climate-models': new Set((data.climate_models || []).map((c: any) => c.id)),
                    scenarios: new Set((data.scenarios || []).map((s: any) => s.id)),
                    variables: new Set((data.variables || []).map((v: any) => v.id)),
                });
                setDirty(false);
            })
            .catch((err) => {
                console.warn('Could not load project config:', err);
                // Not critical -- sections just start empty
            })
            .finally(() => setConfigLoading(false));
    }, [record?.slug]);

    const handleToggle = useCallback((endpoint: string, id: string) => {
        setSelections((prev) => {
            const next = new Set(prev[endpoint]);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return { ...prev, [endpoint]: next };
        });
        setDirty(true);
    }, []);

    const handleSelectAll = useCallback((endpoint: string, allIds: string[]) => {
        setSelections((prev) => ({
            ...prev,
            [endpoint]: new Set(allIds),
        }));
        setDirty(true);
    }, []);

    const handleDeselectAll = useCallback((endpoint: string) => {
        setSelections((prev) => ({
            ...prev,
            [endpoint]: new Set<string>(),
        }));
        setDirty(true);
    }, []);

    const handleSave = async () => {
        if (!record?.id) return;

        setSaving(true);
        try {
            const endpoints = [
                { key: 'crops', path: 'crops' },
                { key: 'water-models', path: 'water-models' },
                { key: 'climate-models', path: 'climate-models' },
                { key: 'scenarios', path: 'scenarios' },
                { key: 'variables', path: 'variables' },
            ];

            await Promise.all(
                endpoints.map(({ key, path }) =>
                    fetch(`/api/projects/${record.id}/${path}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(Array.from(selections[key])),
                    }).then((res) => {
                        if (!res.ok) throw new Error(`Failed to update ${path}`);
                    })
                )
            );

            notify('Project configuration saved', { type: 'success' });
            setDirty(false);
        } catch (err: any) {
            notify(`Error saving configuration: ${err.message}`, { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (!record) return null;

    const listsLoading = cropsLoading || wmLoading || cmLoading || scLoading || varLoading;

    if (configLoading || listsLoading) {
        return (
            <Paper variant="outlined" sx={{ p: 3, my: 2, textAlign: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography variant="body2" component="span">
                    Loading project configuration...
                </Typography>
            </Paper>
        );
    }

    const sectionData: Array<{
        label: string;
        endpoint: string;
        items: RefItem[];
    }> = [
        { label: 'Crops', endpoint: 'crops', items: (cropsData || []) as RefItem[] },
        { label: 'Water Models', endpoint: 'water-models', items: (waterModelsData || []) as RefItem[] },
        { label: 'Climate Models', endpoint: 'climate-models', items: (climateModelsData || []) as RefItem[] },
        { label: 'Scenarios', endpoint: 'scenarios', items: (scenariosData || []) as RefItem[] },
        { label: 'Variables', endpoint: 'variables', items: (variablesData || []) as RefItem[] },
    ];

    return (
        <Paper variant="outlined" sx={{ p: 3, my: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SettingsIcon color="primary" />
                <Typography variant="h6">Project Configuration</Typography>
                {dirty && (
                    <Chip label="Unsaved changes" color="warning" size="small" sx={{ ml: 1 }} />
                )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select which crops, water models, climate models, scenarios, and variables are
                available for this project. Changes are saved separately from the project form above.
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {sectionData.map(({ label, endpoint, items }) => (
                <ConfigSectionPanel
                    key={endpoint}
                    label={label}
                    items={items}
                    selectedIds={selections[endpoint]}
                    onToggle={(id) => handleToggle(endpoint, id)}
                    onSelectAll={() => handleSelectAll(endpoint, items.map((i) => i.id))}
                    onDeselectAll={() => handleDeselectAll(endpoint)}
                />
            ))}

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving || !dirty}
                >
                    {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
            </Box>
        </Paper>
    );
};

export default ProjectConfigEditor;
