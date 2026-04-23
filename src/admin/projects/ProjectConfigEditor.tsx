import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, type DragEvent as ReactDragEvent } from 'react';
import { useRecordContext, useGetList, useNotify, useDataProvider } from 'react-admin';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Chip,
    Divider,
    Paper,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface RefItem {
    id: string;
    name: string;
    slug?: string;
    sort_order?: number;
    abbreviation?: string;
    subscript?: string;
}

type RelationPath = 'crops' | 'water-models' | 'climate-models' | 'scenarios' | 'variables';

// Variables render as abbreviation + subscript (e.g. WFg, WFb); everything else
// falls back to the slug as the machine-identifier subheading.
const getSubheading = (item: RefItem, endpoint: RelationPath): string | null => {
    if (endpoint === 'variables') {
        const abbr = item.abbreviation?.trim();
        if (!abbr) return null;
        const sub = item.subscript?.trim();
        return sub ? `${abbr}${sub}` : abbr;
    }
    return item.slug?.trim() || null;
};

// Selections are ordered arrays — the position in each array is the per-project
// sort_order sent to the API.
type SelectionsMap = Record<RelationPath, string[]>;

const emptySelections = (): SelectionsMap => ({
    crops: [],
    'water-models': [],
    'climate-models': [],
    scenarios: [],
    variables: [],
});

const chipLabel = (item: RefItem, sub: string | null) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, py: 0.25 }}>
        <Typography variant="body2" component="span">
            {item.name}
        </Typography>
        {sub && (
            <Typography
                variant="caption"
                component="span"
                sx={{ fontFamily: 'monospace', fontSize: '0.7rem', opacity: 0.75 }}
            >
                {sub}
            </Typography>
        )}
    </Box>
);

const ConfigSectionPanel = ({
    label,
    endpoint,
    items,
    selectedOrder,
    onChange,
    readOnly,
}: {
    label: string;
    endpoint: RelationPath;
    items: RefItem[];
    selectedOrder: string[];
    // Emits the new ordered id list for this endpoint. Parent persists.
    onChange: (orderedIds: string[]) => void;
    readOnly?: boolean;
}) => {
    const byId = new Map(items.map((i) => [i.id, i]));
    const selectedItems = selectedOrder
        .map((id) => byId.get(id))
        .filter((i): i is RefItem => !!i);

    const unselectedItems = items
        .filter((i) => !selectedOrder.includes(i.id))
        .sort((a, b) => {
            if (a.sort_order != null && b.sort_order != null) return a.sort_order - b.sort_order;
            return a.name.localeCompare(b.name);
        });

    const [dragId, setDragId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);

    const handleDragStart = (id: string) => (e: ReactDragEvent) => {
        setDragId(id);
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', id); } catch { /* Firefox quirks */ }
    };
    const handleDragOver = (id: string) => (e: ReactDragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (overId !== id) setOverId(id);
    };
    const handleDragEnd = () => {
        setDragId(null);
        setOverId(null);
    };
    const handleDrop = (targetId: string) => (e: ReactDragEvent) => {
        e.preventDefault();
        const sourceId = dragId;
        setDragId(null);
        setOverId(null);
        if (!sourceId || sourceId === targetId) return;
        const order = [...selectedOrder];
        const from = order.indexOf(sourceId);
        const to = order.indexOf(targetId);
        if (from < 0 || to < 0) return;
        order.splice(to, 0, order.splice(from, 1)[0]);
        onChange(order);
    };

    const handleToggleOn = (id: string) => {
        if (selectedOrder.includes(id)) return;
        onChange([...selectedOrder, id]);
    };
    const handleToggleOff = (id: string) => {
        onChange(selectedOrder.filter((x) => x !== id));
    };

    const handleSelectAll = () => {
        const newly = items.map((i) => i.id).filter((id) => !selectedOrder.includes(id));
        if (newly.length === 0) return;
        onChange([...selectedOrder, ...newly]);
    };
    const handleDeselectAll = () => {
        if (selectedOrder.length === 0) return;
        onChange([]);
    };

    const renderChip = (item: RefItem, isSelected: boolean) => {
        const sub = getSubheading(item, endpoint);
        const isOver = overId === item.id && dragId && dragId !== item.id;
        const draggable = !readOnly && isSelected;
        return (
            <Chip
                key={item.id}
                label={chipLabel(item, sub)}
                clickable={!readOnly}
                onClick={readOnly ? undefined : () => (isSelected ? handleToggleOff(item.id) : handleToggleOn(item.id))}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                icon={draggable ? (
                    <DragIndicatorIcon
                        fontSize="small"
                        sx={{ cursor: 'grab', opacity: 0.6, '&:active': { cursor: 'grabbing' } }}
                    />
                ) : undefined}
                draggable={draggable}
                onDragStart={draggable ? handleDragStart(item.id) : undefined}
                onDragOver={draggable ? handleDragOver(item.id) : undefined}
                onDrop={draggable ? handleDrop(item.id) : undefined}
                onDragEnd={draggable ? handleDragEnd : undefined}
                sx={{
                    height: 'auto',
                    py: 0.5,
                    '& .MuiChip-label': { display: 'block', px: 1 },
                    opacity: dragId === item.id ? 0.4 : (!readOnly && !isSelected ? 0.65 : 1),
                    color: !readOnly && !isSelected ? 'text.secondary' : undefined,
                    borderColor: !readOnly && !isSelected ? 'divider' : undefined,
                    '&:hover': !readOnly && !isSelected ? { opacity: 0.9 } : undefined,
                    outline: isOver ? '2px dashed' : 'none',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                }}
            />
        );
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {label}
                </Typography>
                <Chip
                    label={readOnly ? `${selectedOrder.length}` : `${selectedOrder.length} / ${items.length}`}
                    size="small"
                    color={selectedOrder.length > 0 ? 'primary' : 'default'}
                    variant="outlined"
                />
                {!readOnly && (
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                        <Button size="small" onClick={handleSelectAll}>
                            Select All
                        </Button>
                        <Button size="small" onClick={handleDeselectAll}>
                            Clear
                        </Button>
                    </Box>
                )}
            </Box>

            {readOnly ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {selectedItems.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            None selected.
                        </Typography>
                    ) : (
                        selectedItems.map((item) => renderChip(item, true))
                    )}
                </Box>
            ) : (
                <>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {selectedItems.length === 0 ? (
                            <Typography variant="caption" color="text.secondary" sx={{ py: 0.5 }}>
                                No items selected. Click a chip below to add it.
                            </Typography>
                        ) : (
                            selectedItems.map((item) => renderChip(item, true))
                        )}
                    </Box>
                    {unselectedItems.length > 0 && (
                        <>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mt: 1, mb: 0.5 }}
                            >
                                Available
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                {unselectedItems.map((item) => renderChip(item, false))}
                            </Box>
                        </>
                    )}
                </>
            )}
        </Box>
    );
};

// Fetches the five reference lists admins can pick from. Both the edit and the
// create surfaces iterate the same sections, so centralising the fetch avoids
// drift if a new reference type is added.
const useReferenceSections = () => {
    const crops = useGetList('crops', {
        pagination: { page: 1, perPage: 500 },
        sort: { field: 'sort_order', order: 'ASC' },
    });
    const waterModels = useGetList('water-models', {
        pagination: { page: 1, perPage: 500 },
        sort: { field: 'sort_order', order: 'ASC' },
    });
    const climateModels = useGetList('climate-models', {
        pagination: { page: 1, perPage: 500 },
        sort: { field: 'sort_order', order: 'ASC' },
    });
    const scenarios = useGetList('scenarios', {
        pagination: { page: 1, perPage: 500 },
        sort: { field: 'sort_order', order: 'ASC' },
    });
    const variables = useGetList('variables', {
        pagination: { page: 1, perPage: 500 },
        sort: { field: 'sort_order', order: 'ASC' },
    });

    const listsLoading =
        crops.isLoading || waterModels.isLoading || climateModels.isLoading ||
        scenarios.isLoading || variables.isLoading;

    const sections: Array<{
        label: string;
        endpoint: RelationPath;
        items: RefItem[];
    }> = [
        { label: 'Crops', endpoint: 'crops', items: (crops.data || []) as RefItem[] },
        { label: 'Water Models', endpoint: 'water-models', items: (waterModels.data || []) as RefItem[] },
        { label: 'Climate Models', endpoint: 'climate-models', items: (climateModels.data || []) as RefItem[] },
        { label: 'Scenarios', endpoint: 'scenarios', items: (scenarios.data || []) as RefItem[] },
        { label: 'Variables', endpoint: 'variables', items: (variables.data || []) as RefItem[] },
    ];

    return { sections, listsLoading };
};

const ProjectConfigEditor = ({ readOnly = false }: { readOnly?: boolean } = {}) => {
    const record = useRecordContext();
    const notify = useNotify();
    const dataProvider = useDataProvider();

    const [selections, setSelections] = useState<SelectionsMap>(emptySelections);
    const [configLoading, setConfigLoading] = useState(true);

    const { sections, listsLoading } = useReferenceSections();

    // Fetch current project config. Goes through the data provider so the
    // Keycloak bearer is attached; otherwise the request is unauthenticated
    // and mutation endpoints rejected the caller with 403.
    const loadConfig = useCallback(() => {
        if (!record?.slug) return;
        setConfigLoading(true);
        (dataProvider as any)
            .getProjectConfig(record.slug)
            .then(({ data }: { data: any }) => {
                setSelections({
                    crops: (data.crops || []).map((c: any) => c.id as string),
                    'water-models': (data.water_models || []).map((w: any) => w.id as string),
                    'climate-models': (data.climate_models || []).map((c: any) => c.id as string),
                    scenarios: (data.scenarios || []).map((s: any) => s.id as string),
                    variables: (data.variables || []).map((v: any) => v.id as string),
                });
            })
            .catch((err: any) => {
                console.warn('Could not load project config:', err);
            })
            .finally(() => setConfigLoading(false));
    }, [record?.slug, dataProvider]);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    // Single auto-save path: optimistically update local state, then PUT the
    // ordered id list. On failure, reload from the server so the UI snaps back
    // to the authoritative state instead of lying to the admin.
    const handleChange = useCallback(
        async (endpoint: RelationPath, orderedIds: string[]) => {
            if (!record?.id || readOnly) return;
            setSelections((prev) => ({ ...prev, [endpoint]: orderedIds }));
            try {
                await (dataProvider as any).updateProjectRelation(
                    record.id as string,
                    endpoint,
                    orderedIds,
                );
            } catch (err: any) {
                notify(`Error saving ${endpoint}: ${err?.message || err}`, { type: 'error' });
                loadConfig();
            }
        },
        [record?.id, readOnly, dataProvider, notify, loadConfig],
    );

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
            </Box>
            {!readOnly && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Click chips to include them in this project; drag selected chips to reorder how
                    they appear in the public UI. Changes save automatically.
                </Typography>
            )}
            <Divider sx={{ mb: 2 }} />

            {sections.map(({ label, endpoint, items }) => (
                <ConfigSectionPanel
                    key={endpoint}
                    label={label}
                    endpoint={endpoint}
                    items={items}
                    selectedOrder={selections[endpoint]}
                    onChange={(orderedIds) => handleChange(endpoint, orderedIds)}
                    readOnly={readOnly}
                />
            ))}
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

        const handleChange = useCallback((endpoint: RelationPath, orderedIds: string[]) => {
            setSelections((prev) => ({ ...prev, [endpoint]: orderedIds }));
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
                    project will expose. Drag selected chips to set their order. Saved when the
                    project is created.
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {sections.map(({ label, endpoint, items }) => (
                    <ConfigSectionPanel
                        key={endpoint}
                        label={label}
                        endpoint={endpoint}
                        items={items}
                        selectedOrder={selections[endpoint]}
                        onChange={(orderedIds) => handleChange(endpoint, orderedIds)}
                    />
                ))}
            </Paper>
        );
    },
);

ProjectConfigCreateSection.displayName = 'ProjectConfigCreateSection';

export default ProjectConfigEditor;
