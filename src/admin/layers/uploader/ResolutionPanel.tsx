import { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Collapse,
    Divider,
    FormControlLabel,
    IconButton,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { SlugField } from './parseFilename';
import type { CreatePayload, MissingSlug, ResolutionChoice } from './resolveMissing';

interface Props {
    missing: MissingSlug[];
    invalid: { filename: string; error: string }[];
    onResolve: (choices: ResolutionChoice[]) => Promise<void>;
    onCancel: () => void;
    resolving: boolean;
}

const FIELD_LABEL: Record<SlugField, string> = {
    crop: 'Crops',
    variable: 'Variables',
    water_model: 'Water models',
    climate_model: 'Climate models',
    scenario: 'Scenarios',
};

/**
 * Blocks the upload until every unresolved slug has an action chosen (either
 * "attach" for entities that exist globally, or "create & attach" for new
 * ones). Groups by entity type so the user scans a short list even when 50
 * files reference the same missing slug.
 */
export function ResolutionPanel({
    missing,
    invalid,
    onResolve,
    onCancel,
    resolving,
}: Props) {
    const grouped = useMemo(() => {
        const out = new Map<SlugField, MissingSlug[]>();
        for (const m of missing) {
            const bucket = out.get(m.field) ?? [];
            bucket.push(m);
            out.set(m.field, bucket);
        }
        return out;
    }, [missing]);

    // One draft CreatePayload per (field, slug) for entries with kind === 'create'.
    // Pre-seed from the slug — user can refine name / abbreviation / etc.
    const [drafts, setDrafts] = useState<Record<string, CreatePayload>>(() => {
        const out: Record<string, CreatePayload> = {};
        for (const m of missing) {
            if (m.kind === 'create') {
                out[slugKey(m)] = defaultPayload(m.field, m.slug);
            }
        }
        return out;
    });

    const [submitError, setSubmitError] = useState<string | null>(null);

    const allValid = useMemo(
        () =>
            missing.every((m) =>
                m.kind === 'attach'
                    ? true
                    : isDraftValid(m.field, drafts[slugKey(m)]),
            ),
        [missing, drafts],
    );

    const handleResolve = async () => {
        setSubmitError(null);
        const choices: ResolutionChoice[] = missing.map((m) =>
            m.kind === 'attach'
                ? { field: m.field, slug: m.slug, kind: 'attach', existingId: m.existingId }
                : {
                      field: m.field,
                      slug: m.slug,
                      kind: 'create',
                      createPayload: drafts[slugKey(m)],
                  },
        );
        try {
            await onResolve(choices);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : String(err));
        }
    };

    return (
        <Paper
            variant="outlined"
            sx={{ p: 2, mb: 2, borderColor: 'warning.main' }}
        >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <WarningAmberIcon color="warning" />
                <Typography variant="subtitle1" fontWeight={600}>
                    Some files reference values that aren't available in this
                    project yet
                </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={2}>
                Create or attach the missing entries below and the upload will
                continue automatically.
            </Typography>

            {invalid.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={600}>
                        {invalid.length} file{invalid.length === 1 ? '' : 's'}{' '}
                        could not be parsed — rename and re-drop them:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        {invalid.map((f) => (
                            <li key={f.filename}>
                                <code>{f.filename}</code> — {f.error}
                            </li>
                        ))}
                    </Box>
                </Alert>
            )}

            <Stack spacing={2}>
                {[...grouped.entries()].map(([field, items]) => (
                    <Box key={field}>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                        >
                            {FIELD_LABEL[field]} · {items.length} missing
                        </Typography>
                        <List dense disablePadding>
                            {items.map((m) => (
                                <MissingRow
                                    key={slugKey(m)}
                                    missing={m}
                                    draft={drafts[slugKey(m)]}
                                    onDraftChange={(next) =>
                                        setDrafts((prev) => ({
                                            ...prev,
                                            [slugKey(m)]: next,
                                        }))
                                    }
                                />
                            ))}
                        </List>
                    </Box>
                ))}
            </Stack>

            {submitError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {submitError}
                </Alert>
            )}

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={onCancel} disabled={resolving}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleResolve}
                    disabled={!allValid || resolving || missing.length === 0}
                    startIcon={
                        resolving ? <CircularProgress size={16} /> : undefined
                    }
                >
                    {resolving ? 'Resolving…' : 'Resolve all & upload'}
                </Button>
            </Stack>
        </Paper>
    );
}

interface MissingRowProps {
    missing: MissingSlug;
    draft: CreatePayload | undefined;
    onDraftChange: (next: CreatePayload) => void;
}

function MissingRow({ missing, draft, onDraftChange }: MissingRowProps) {
    const [expanded, setExpanded] = useState(missing.kind === 'create');

    return (
        <ListItem
            disableGutters
            sx={{ flexDirection: 'column', alignItems: 'stretch', py: 0.5 }}
        >
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
                width="100%"
            >
                <ListItemText
                    primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                            <code>{missing.slug}</code>
                            <Typography
                                variant="caption"
                                color={
                                    missing.kind === 'attach'
                                        ? 'info.main'
                                        : 'warning.main'
                                }
                            >
                                {missing.kind === 'attach'
                                    ? 'exists globally — will attach to project'
                                    : 'new — will create & attach'}
                            </Typography>
                        </Stack>
                    }
                    secondary={`Referenced by ${missing.affectedFiles.length} file${missing.affectedFiles.length === 1 ? '' : 's'}`}
                />
                {missing.kind === 'create' && (
                    <IconButton
                        size="small"
                        onClick={() => setExpanded((e) => !e)}
                    >
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                )}
            </Stack>
            {missing.kind === 'create' && draft && (
                <Collapse in={expanded} unmountOnExit>
                    <CreateForm
                        field={missing.field}
                        draft={draft}
                        onChange={onDraftChange}
                    />
                </Collapse>
            )}
        </ListItem>
    );
}

interface CreateFormProps {
    field: SlugField;
    draft: CreatePayload;
    onChange: (next: CreatePayload) => void;
}

function CreateForm({ field, draft, onChange }: CreateFormProps) {
    const update = (patch: Partial<CreatePayload>) =>
        onChange({ ...draft, ...patch });

    return (
        <Box sx={{ pl: 2, pr: 1, pb: 1.5, pt: 0.5 }}>
            <Stack spacing={1.5}>
                <Stack direction="row" spacing={1}>
                    <TextField
                        label="Slug"
                        size="small"
                        value={draft.slug}
                        disabled
                        sx={{ flex: 1 }}
                        helperText="Locked to match the filename"
                    />
                    <TextField
                        label="Name"
                        size="small"
                        value={draft.name}
                        onChange={(e) => update({ name: e.target.value })}
                        required
                        sx={{ flex: 1 }}
                    />
                </Stack>
                {field === 'variable' && (
                    <>
                        <Stack direction="row" spacing={1}>
                            <TextField
                                label="Abbreviation"
                                size="small"
                                value={draft.abbreviation ?? ''}
                                onChange={(e) =>
                                    update({ abbreviation: e.target.value })
                                }
                                required
                                sx={{ flex: 1 }}
                                helperText="Short label, e.g., VWC"
                            />
                            <TextField
                                label="Unit"
                                size="small"
                                value={draft.unit ?? ''}
                                onChange={(e) =>
                                    update({ unit: e.target.value })
                                }
                                required
                                sx={{ flex: 1 }}
                            />
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <TextField
                                label="Subscript"
                                size="small"
                                value={draft.subscript ?? ''}
                                onChange={(e) =>
                                    update({ subscript: e.target.value })
                                }
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="Group"
                                size="small"
                                value={draft.group_name ?? ''}
                                onChange={(e) =>
                                    update({ group_name: e.target.value })
                                }
                                sx={{ flex: 1 }}
                            />
                        </Stack>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                select
                                label="Kind"
                                size="small"
                                value={
                                    draft.is_crop_specific ? 'crop' : 'general'
                                }
                                onChange={(e) =>
                                    update({
                                        is_crop_specific:
                                            e.target.value === 'crop',
                                    })
                                }
                                sx={{ minWidth: 180 }}
                            >
                                <MenuItem value="general">
                                    General (climate form)
                                </MenuItem>
                                <MenuItem value="crop">
                                    Crop-specific (2-part form)
                                </MenuItem>
                            </TextField>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={draft.has_time ?? true}
                                        onChange={(e) =>
                                            update({
                                                has_time: e.target.checked,
                                            })
                                        }
                                    />
                                }
                                label="Has time axis"
                            />
                        </Stack>
                    </>
                )}
            </Stack>
        </Box>
    );
}

function slugKey(m: MissingSlug): string {
    return `${m.field}:${m.slug}`;
}

function defaultPayload(field: SlugField, slug: string): CreatePayload {
    const base: CreatePayload = {
        slug,
        name: humanize(slug),
        sort_order: 0,
    };
    if (field === 'variable') {
        return {
            ...base,
            abbreviation: slug.toUpperCase().slice(0, 8),
            unit: '',
            is_crop_specific: false,
            has_time: true,
        };
    }
    return base;
}

function humanize(slug: string): string {
    return slug
        .split(/[-_]/)
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');
}

function isDraftValid(field: SlugField, draft: CreatePayload | undefined): boolean {
    if (!draft) return false;
    if (!draft.slug.trim() || !draft.name.trim()) return false;
    if (field === 'variable') {
        if (!draft.abbreviation?.trim()) return false;
        if (!draft.unit?.trim()) return false;
    }
    return true;
}
