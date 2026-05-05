// Client-side mirror of drop4crop-api/src/routes/layers/utils.rs::parse_filename.
// Keep in sync with that file. The canonical climate form is always
// {crop}_{water_model}_{climate_model}_{scenario}_{variable}_{year}.tif — the
// position order is fixed regardless of which axes the project uses, so that
// scripted renames/generators don't need to know about project config. Unused
// middle slots carry the sentinel `null` or `nan` (case-insensitive).
//
// When the caller passes `axes`, we ALSO accept a project-specific minimised
// form that omits the literal `null`/`nan` slots for axes the project doesn't
// use — so a project that only uses crop+variable+year accepts
// `{crop}_{variable}_{year}.tif` rather than `{crop}_null_null_null_{variable}_{year}.tif`.
// The position order of the remaining slots still matches the canonical form.

export type ParsedFilename =
    | {
          ok: true;
          kind: "climate";
          crop: string;
          water_model: string | null;
          climate_model: string | null;
          scenario: string | null;
          variable: string | null;
          year: number | null;
      }
    | {
          ok: true;
          kind: "crop";
          crop: string;
          variable: string;
      }
    | { ok: false; error: string };

const NULLABLE_SENTINELS = new Set(["null", "nan"]);

function parseNullableSlot(slot: string): string | null {
    return NULLABLE_SENTINELS.has(slot.toLowerCase()) ? null : slot;
}

/** Returns a parsed year if `s` is a 4-digit integer or a null sentinel.
 *  Returns `undefined` when the token is neither — caller can fall through
 *  to a different filename shape. */
function parseYearSlot(s: string): number | null | undefined {
    if (NULLABLE_SENTINELS.has(s)) return null;
    if (!/^\d{4}$/.test(s)) return undefined;
    const parsed = Number.parseInt(s, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
}

/** Which axes the project uses. Drives project-specific minimised filename
 *  parsing — only the axes that are `true` here appear in the minimised form. */
export interface ProjectAxes {
    water_model: boolean;
    climate_model: boolean;
    scenario: boolean;
    year: boolean;
}

export function parseFilename(filename: string, axes?: ProjectAxes): ParsedFilename {
    const lower = filename.toLowerCase();
    let stem: string;
    if (lower.endsWith(".tif")) {
        stem = lower.slice(0, -".tif".length);
    } else if (lower.endsWith(".tiff")) {
        // Backend only recognises .tif, but we normalise early so a user dragging
        // a .tiff sees a clean client-side message rather than a backend 400.
        stem = lower.slice(0, -".tiff".length);
    } else {
        return { ok: false, error: "Filename must end with .tif" };
    }

    const parts = stem.split("_");

    if (parts.length === 6) {
        let year: number | null;
        if (NULLABLE_SENTINELS.has(parts[5])) {
            year = null;
        } else {
            const parsed = Number.parseInt(parts[5], 10);
            if (!Number.isFinite(parsed) || String(parsed) !== parts[5]) {
                return { ok: false, error: `Invalid year in filename: ${parts[5]}` };
            }
            year = parsed;
        }
        return {
            ok: true,
            kind: "climate",
            crop: parts[0],
            water_model: parseNullableSlot(parts[1]),
            climate_model: parseNullableSlot(parts[2]),
            scenario: parseNullableSlot(parts[3]),
            variable: parseNullableSlot(parts[4]),
            year,
        };
    }

    if (parts.length === 7) {
        if (parts[5] !== "perc") {
            return {
                ok: false,
                error: `Unsupported unit in filename: ${parts[5]}`,
            };
        }
        const base = parseNullableSlot(parts[4]);
        if (base === null) {
            return {
                ok: false,
                error: "Cannot use `_perc` suffix with a null/nan variable slot",
            };
        }
        let year: number | null;
        if (NULLABLE_SENTINELS.has(parts[6])) {
            year = null;
        } else {
            const parsed = Number.parseInt(parts[6], 10);
            if (!Number.isFinite(parsed) || String(parsed) !== parts[6]) {
                return { ok: false, error: `Invalid year in filename: ${parts[6]}` };
            }
            year = parsed;
        }
        return {
            ok: true,
            kind: "climate",
            crop: parts[0],
            water_model: parseNullableSlot(parts[1]),
            climate_model: parseNullableSlot(parts[2]),
            scenario: parseNullableSlot(parts[3]),
            variable: `${base}_perc`,
            year,
        };
    }

    // Project-specific minimised form. The shape is:
    //   {crop}_[water_model]_[climate_model]_[scenario]_{variable}_[year].tif
    // where the bracketed slots only appear when the project uses that axis.
    // Total expected parts = 1 (crop) + (axes used) + 1 (variable) + (year ? 1 : 0).
    // Only matches when `axes` is provided AND the count differs from the canonical 6,
    // so the canonical form always still parses without project context.
    if (axes) {
        const middleCount =
            (axes.water_model ? 1 : 0) +
            (axes.climate_model ? 1 : 0) +
            (axes.scenario ? 1 : 0);
        const expected = 1 + middleCount + 1 + (axes.year ? 1 : 0);
        // 2-part filenames stay in the crop-specific branch (existing semantics).
        // 6-part filenames always go through the canonical block above.
        if (parts.length === expected && parts.length >= 3 && parts.length !== 6) {
            let i = 0;
            const crop = parts[i++];
            const water_model = axes.water_model ? parseNullableSlot(parts[i++]) : null;
            const climate_model = axes.climate_model ? parseNullableSlot(parts[i++]) : null;
            const scenario = axes.scenario ? parseNullableSlot(parts[i++]) : null;
            const variableSlot = parts[i++];
            const variable = parseNullableSlot(variableSlot);
            let year: number | null = null;
            if (axes.year) {
                const y = parseYearSlot(parts[i++]);
                if (y === undefined) {
                    return { ok: false, error: `Invalid year in filename: ${parts[i - 1]}` };
                }
                year = y;
            }
            return {
                ok: true,
                kind: "climate",
                crop,
                water_model,
                climate_model,
                scenario,
                variable,
                year,
            };
        }
    }

    if (parts.length >= 2 && parts.length <= 5) {
        return {
            ok: true,
            kind: "crop",
            crop: parts[0],
            variable: parts.slice(1).join("_"),
        };
    }

    return {
        ok: false,
        error:
            "Invalid filename format. Expected either " +
            "{crop}_{water_model}_{climate_model}_{scenario}_{variable}_{year}.tif " +
            "(sentinels `null` or `nan` allowed in any middle slot) or " +
            "{crop}_{crop_variable}.tif",
    };
}

/**
 * Extract the slugs that need to be resolved against the project's junctions.
 * Returns only non-null slugs with their field name, so the caller can check
 * each one against the project config.
 */
export function extractSlugs(
    parsed: ParsedFilename,
): { field: SlugField; slug: string }[] {
    if (!parsed.ok) return [];
    const slugs: { field: SlugField; slug: string }[] = [];
    if (parsed.kind === "climate") {
        slugs.push({ field: "crop", slug: parsed.crop });
        if (parsed.water_model)
            slugs.push({ field: "water_model", slug: parsed.water_model });
        if (parsed.climate_model)
            slugs.push({ field: "climate_model", slug: parsed.climate_model });
        if (parsed.scenario)
            slugs.push({ field: "scenario", slug: parsed.scenario });
        if (parsed.variable)
            slugs.push({ field: "variable", slug: parsed.variable });
    } else {
        slugs.push({ field: "crop", slug: parsed.crop });
        slugs.push({ field: "variable", slug: parsed.variable });
    }
    return slugs;
}

export type SlugField =
    | "crop"
    | "variable"
    | "water_model"
    | "climate_model"
    | "scenario";

/** Maps a SlugField to the react-admin resource name and the project-relation path. */
export const FIELD_TO_RESOURCE: Record<
    SlugField,
    { resource: string; relation: string }
> = {
    crop: { resource: "crops", relation: "crops" },
    variable: { resource: "variables", relation: "variables" },
    water_model: { resource: "water-models", relation: "water-models" },
    climate_model: { resource: "climate-models", relation: "climate-models" },
    scenario: { resource: "scenarios", relation: "scenarios" },
};
