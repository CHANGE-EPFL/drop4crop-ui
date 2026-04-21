import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useRecordContext, useGetList, useNotify, useDataProvider } from 'react-admin';
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

type RelationPath = 'crops' | 'water-models' | 'climate-models' | 'scenarios' | 'variables';

type SelectionsMap = Record<RelationPath, Set<string>>;

const emptySelections = (): SelectionsMap => ({
    crops: new Set(),
    'water-models': new Set(),
    'climate-models': new Set(),
    scenarios: new Set(),
    variables: new Set(),
});

// Shared reducer helpers so both the edit and the create surfaces behave identically.
const toggleSelection = (prev: SelectionsMap, endpoint: RelationPath, id: string): SelectionsMap => {
    const next = new Set(prev[endpoint]);
    if (next.has(id)) {
        next.delete(id);
    } else {
        next.add(id);
    }
    return { ...prev, [endpoint]: next };
};

const setAllSelection = (
    prev: SelectionsMap,
    endpoint: RelationPath,
    allIds: string[],
): SelectionsMap => ({ ...prev, [endpoint]: new Set(allIds) });

const clearSelection = (prev: SelectionsMap, endpoint: RelationPath): SelectionsMap => ({
    ...prev,
    [endpoint]: new Set<string>(),
});

const ConfigSectionPanel = ({
    label,
    items,
    selectedIds,
    onToggle,
    onSelectAll,
    onDeselectAll,
    readOnly,
}: {
    label: string;
    items: RefItem[];
    selectedIds: Set<string>;
    onToggle: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    readOnly?: boolean;
}) => {
    const sorted = [...items].sort((a, b) => {
        if (a.sort_order != null && b.sort_order != null) return a.sort_order - b.sort_order;
        return a.name.localeCompare(b.name);
    });

    // In read-only mode we hide un-selected rows entirely — the section
    // becomes a compact "what this project exposes" summary for the Show page.
    const visible = readOnly ? sorted.filter((i) => selectedIds.has(i.id)) : sorted;

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {label}
                </Typography>
                <Chip
                    label={readOnly ? `${selectedIds.size}` : `${selectedIds.size} / ${items.length}`}
                    size="small"
                    color={selectedIds.size > 0 ? 'primary' : 'default'}
                    variant="outlined"
                />
                {!readOnly && (
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                        <Button size="small" onClick={onSelectAll}>
                            Select All
                        </Button>
                        <Button size="small" onClick={onDeselectAll}>
                            Clear
                        </Button>
                    </Box>
                )}
            </Box>
            {readOnly ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {visible.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            None selected.
                        </Typography>
                    ) : (
                        visible.map((item) => (
                            <Chip key={item.id} label={item.name} size="small" variant="outlined" />
                        ))
                    )}
                </Box>
            ) : (
                <FormGroup row sx={{ gap: 0.5 }}>
                    {visible.map((item) => (
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
            )}
        </Box>
    );
};

// Fetches the five reference lists admins can pick from. Both the edit and the
// create surfaces iterate the same sections, so centralising the fetch avoids
// drift if a new reference type is added.
const useReferenceSections = () => {
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

    const listsLoading = cropsLoading || wmLoading || cmLoading || scLoading || varLoading;

    const sections: Array<{ label: string; endpoint: RelationPath; items: RefItem[] }> = [
        { label: 'Crops', endpoint: 'crops', items: (cropsData || []) as RefItem[] },
        { label: 'Water Models', endpoint: 'water-models', items: (waterModelsData || []) as RefItem[] },
        { label: 'Climate Models', endpoint: 'climate-models', items: (climateModelsData || []) as RefItem[] },
        { label: 'Scenarios', endpoint: 'scenarios', items: (scenariosData || []) as RefItem[] },
        { label: 'Variables', endpoint: 'variables', items: (variablesData || []) as RefItem[] },
    ];

    return { sections, listsLoading };
};

const ProjectConfigEditor = ({ readOnly = false }: { readOnly?: boolean } = {}) => {
    const record = useRecordContext();
    const notify = useNotify();
    const dataProvider = useDataProvider();

    const [selections, setSelections] = useState<SelectionsMap>(emptySelections);
    const [configLoading, setConfigLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    const { sections, listsLoading } = useReferenceSections();

    // Fetch current project config. Goes through the data provider so the
    // Keycloak bearer is attached; otherwise the request is unauthenticated
    // and mutation endpoints rejected the caller with 403.
    useEffect(() => {
        if (!record?.slug) return;

        setConfigLoading(true);
        dataProvider
            .getProjectConfig(record.slug)
            .then(({ data }: { data: any }) => {
                setSelections({
                    crops: new Set((data.crops || []).map((c: any) => c.id)),
                    'water-models': new Set((data.water_models || []).map((w: any) => w.id)),
                    'climate-models': new Set((data.climate_models || []).map((c: any) => c.id)),
                    scenarios: new Set((data.scenarios || []).map((s: any) => s.id)),
                    variables: new Set((data.variables || []).map((v: any) => v.id)),
                });
                setDirty(false);
            })
            .catch((err: any) => {
                console.warn('Could not load project config:', err);
            })
            .finally(() => setConfigLoading(false));
    }, [record?.slug, dataProvider]);

    const handleToggle = useCallback((endpoint: RelationPath, id: string) => {
        setSelections((prev) => toggleSelection(prev, endpoint, id));
        setDirty(true);
    }, []);

    const handleSelectAll = useCallback((endpoint: RelationPath, allIds: string[]) => {
        setSelections((prev) => setAllSelection(prev, endpoint, allIds));
        setDirty(true);
    }, []);

    const handleDeselectAll = useCallback((endpoint: RelationPath) => {
        setSelections((prev) => clearSelection(prev, endpoint));
        setDirty(true);
    }, []);

    const handleSave = async () => {
        if (!record?.id) return;

        setSaving(true);
        try {
            const endpoints: Array<{ key: string; path: RelationPath }> = [
                { key: 'crops', path: 'crops' },
                { key: 'water-models', path: 'water-models' },
                { key: 'climate-models', path: 'climate-models' },
                { key: 'scenarios', path: 'scenarios' },
                { key: 'variables', path: 'variables' },
            ];

            await Promise.all(
                endpoints.map(({ key, path }) =>
                    dataProvider.updateProjectRelation(
                        record.id as string,
                        path,
                        Array.from(selections[key])
                    )
                )
            );

            notify('Project configuration saved', { type: 'success' });
            setDirty(false);
        } catch (err: any) {
            notify(`Error saving configuration: ${err.message || err}`, { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (!record) return null;

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

    return (
        <Paper variant="outlined" sx={{ p: 3, my: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SettingsIcon color="primary" />
                <Typography variant="h6">Project Configuration</Typography>
                {dirty && !readOnly && (
                    <Chip label="Unsaved changes" color="warning" size="small" sx={{ ml: 1 }} />
                )}
            </Box>
            {!readOnly && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select which crops, water models, climate models, scenarios, and variables are
                    available for this project. Changes are saved separately from the project form above.
                </Typography>
            )}
            <Divider sx={{ mb: 2 }} />

            {sections.map(({ label, endpoint, items }) => (
                <ConfigSectionPanel
                    key={endpoint}
                    label={label}
                    items={items}
                    selectedIds={selections[endpoint]}
                    onToggle={(id) => handleToggle(endpoint, id)}
                    onSelectAll={() => handleSelectAll(endpoint, items.map((i) => i.id))}
                    onDeselectAll={() => handleDeselectAll(endpoint)}
                    readOnly={readOnly}
                />
            ))}

            {!readOnly && (
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
            )}
        </Paper>
    );
};

// Create-mode surface. Uses the same panels and state shape as the editor but
// has no fetch (there's no record yet) and no save button (the parent Create
// form triggers the five PUTs after the project row is persisted).
export interface ProjectConfigCreateSectionHandle {
    getSelections: () => SelectionsMap;
}

export const ProjectConfigCreateSection = forwardRef<ProjectConfigCreateSectionHandle>(
    (_props, ref) => {
        const [selections, setSelections] = useState<SelectionsMap>(emptySelections);
        const { sections, listsLoading } = useReferenceSections();

        useImperativeHandle(ref, () => ({ getSelections: () => selections }), [selections]);

        const handleToggle = useCallback((endpoint: RelationPath, id: string) => {
            setSelections((prev) => toggleSelection(prev, endpoint, id));
        }, []);

        const handleSelectAll = useCallback((endpoint: RelationPath, allIds: string[]) => {
            setSelections((prev) => setAllSelection(prev, endpoint, allIds));
        }, []);

        const handleDeselectAll = useCallback((endpoint: RelationPath) => {
            setSelections((prev) => clearSelection(prev, endpoint));
        }, []);

        if (listsLoading) {
            return (
                <Paper variant="outlined" sx={{ p: 3, my: 2, textAlign: 'center' }}>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    <Typography variant="body2" component="span">
                        Loading reference data...
                    </Typography>
                </Paper>
            );
        }

        return (
            <Paper variant="outlined" sx={{ p: 3, my: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SettingsIcon color="primary" />
                    <Typography variant="h6">Project Configuration</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select which crops, water models, climate models, scenarios, and variables this
                    project will expose in the public UI. Any category left empty will not show a
                    button in the map view. You can change these later from the Edit page.
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {sections.map(({ label, endpoint, items }) => (
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
            </Paper>
        );
    },
);

ProjectConfigCreateSection.displayName = 'ProjectConfigCreateSection';

export default ProjectConfigEditor;
