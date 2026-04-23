import type { DataProvider } from 'ra-core';
import type { ParsedFilename, SlugField } from './parseFilename';
import { extractSlugs, FIELD_TO_RESOURCE } from './parseFilename';
import type { ProjectConfig, ReferenceItem } from './useProjectConfig';

/**
 * One unresolved slug surfaced by the pre-flight check. `kind` drives the
 * action the resolution panel offers:
 *   - `attach`: slug exists globally, just not in this project's junction.
 *               We only need a PUT to append the UUID to the relation.
 *   - `create`: slug doesn't exist anywhere yet. We need a POST to create
 *               the reference entity, then a PUT to attach it.
 */
export interface MissingSlug {
    field: SlugField;
    slug: string;
    kind: 'attach' | 'create';
    /** UUID if the entity exists globally (kind === 'attach'). */
    existingId?: string;
    /** Filenames that reference this slug (for the UI summary). */
    affectedFiles: string[];
}

export interface PreflightResult {
    /** Files whose filenames failed to parse — need user rename, not resolution. */
    invalid: { filename: string; error: string }[];
    /** Files that parsed cleanly AND whose slugs are all resolved in the project. */
    ready: { filename: string; parsed: ParsedFilename }[];
    /** Missing slugs grouped by (field, slug). */
    missing: MissingSlug[];
}

interface FileInput {
    filename: string;
    parsed: ParsedFilename;
}

/**
 * Given a batch of filename parse results and the current project config,
 * returns which files are ready to upload and which slugs need resolution.
 * Also runs a per-slug `findReferenceBySlug` to tell whether a missing slug
 * already exists globally (kind: 'attach') or not at all (kind: 'create').
 */
export async function classifyMissingSlugs(
    files: FileInput[],
    projectConfig: ProjectConfig,
    dataProvider: DataProvider & {
        findReferenceBySlug: (
            resource: string,
            slug: string,
        ) => Promise<{ data: { id: string } | null }>;
    },
): Promise<PreflightResult> {
    const invalid: PreflightResult['invalid'] = [];
    const ready: PreflightResult['ready'] = [];

    // Collect unique (field, slug) pairs across all parsed files, tracking
    // which filenames reference each one so the UI can show affected counts.
    const bySlug = new Map<string, { field: SlugField; slug: string; files: string[] }>();
    const filesNeedingResolution = new Set<string>();

    for (const f of files) {
        if (!f.parsed.ok) {
            invalid.push({ filename: f.filename, error: f.parsed.error });
            continue;
        }
        const slugs = extractSlugs(f.parsed);
        let unresolvedHere = false;
        for (const { field, slug } of slugs) {
            if (isInProjectConfig(projectConfig, field, slug)) continue;
            unresolvedHere = true;
            const key = `${field}:${slug}`;
            const entry = bySlug.get(key) ?? { field, slug, files: [] };
            entry.files.push(f.filename);
            bySlug.set(key, entry);
            filesNeedingResolution.add(f.filename);
        }
        if (!unresolvedHere) ready.push({ filename: f.filename, parsed: f.parsed });
    }

    // Classify each unique missing slug — does it exist globally?
    const missing: MissingSlug[] = await Promise.all(
        [...bySlug.values()].map(async ({ field, slug, files }) => {
            const { resource } = FIELD_TO_RESOURCE[field];
            const { data } = await dataProvider.findReferenceBySlug(resource, slug);
            return {
                field,
                slug,
                kind: data ? 'attach' : 'create',
                existingId: data?.id,
                affectedFiles: files,
            };
        }),
    );

    return { invalid, ready, missing };
}

function isInProjectConfig(
    config: ProjectConfig,
    field: SlugField,
    slug: string,
): boolean {
    const key = configKey(field);
    const list: ReferenceItem[] = config[key] ?? [];
    return list.some((item) => item.slug === slug);
}

function configKey(field: SlugField): keyof ProjectConfig {
    switch (field) {
        case 'crop':
            return 'crops';
        case 'variable':
            return 'variables';
        case 'water_model':
            return 'water_models';
        case 'climate_model':
            return 'climate_models';
        case 'scenario':
            return 'scenarios';
    }
}

/**
 * Form payload the UI collects when the user clicks "Create & attach" for a
 * missing slug. Fields are a superset — only `variables` uses the richer set.
 */
export interface CreatePayload {
    slug: string;
    name: string;
    sort_order?: number;
    // Variable-only fields
    abbreviation?: string;
    unit?: string;
    is_crop_specific?: boolean;
    subscript?: string;
    has_time?: boolean;
    group_name?: string;
}

export interface ResolutionChoice {
    field: SlugField;
    slug: string;
    kind: 'attach' | 'create';
    /** When kind === 'attach' */
    existingId?: string;
    /** When kind === 'create' */
    createPayload?: CreatePayload;
}

/**
 * Executes all resolution choices against the backend in two phases:
 *   1. POST each new reference entity → collect resulting UUIDs.
 *   2. For each relation that needs new members, APPEND to the project's
 *      current list via dataProvider.appendProjectRelation.
 * Returns the set of (field, slug) pairs successfully resolved, so the caller
 * can refetch the project config and (re-)check which files are now ready.
 */
export async function executeResolution(
    choices: ResolutionChoice[],
    projectId: string,
    projectSlug: string,
    dataProvider: DataProvider & {
        createReferenceEntity: (
            resource: string,
            payload: Record<string, unknown>,
        ) => Promise<{ data: { id: string; slug: string } }>;
        appendProjectRelation: (
            projectId: string,
            projectSlug: string,
            relation: string,
            newIds: string[],
        ) => Promise<unknown>;
    },
): Promise<{ field: SlugField; slug: string }[]> {
    // Phase 1: create any new entities, collect their ids per field.
    const idsByField = new Map<SlugField, string[]>();
    const resolved: { field: SlugField; slug: string }[] = [];

    for (const choice of choices) {
        let id: string | undefined = choice.existingId;
        if (choice.kind === 'create') {
            if (!choice.createPayload) {
                throw new Error(
                    `Missing create payload for ${choice.field}:${choice.slug}`,
                );
            }
            const { resource } = FIELD_TO_RESOURCE[choice.field];
            const { data } = await dataProvider.createReferenceEntity(
                resource,
                choice.createPayload,
            );
            id = data.id;
        }
        if (!id) {
            throw new Error(
                `No UUID available for ${choice.field}:${choice.slug}`,
            );
        }
        const bucket = idsByField.get(choice.field) ?? [];
        bucket.push(id);
        idsByField.set(choice.field, bucket);
        resolved.push({ field: choice.field, slug: choice.slug });
    }

    // Phase 2: append each bucket to the project's relation list.
    for (const [field, newIds] of idsByField) {
        const { relation } = FIELD_TO_RESOURCE[field];
        await dataProvider.appendProjectRelation(
            projectId,
            projectSlug,
            relation,
            newIds,
        );
    }

    return resolved;
}
