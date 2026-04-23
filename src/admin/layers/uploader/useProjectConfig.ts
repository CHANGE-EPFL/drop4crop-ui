import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export interface ReferenceItem {
    id: string;
    name: string;
    slug: string;
    sort_order?: number;
    is_crop_specific?: boolean;
    abbreviation?: string;
    subscript?: string;
}

export interface ProjectConfig {
    id?: string;
    slug?: string;
    title?: string;
    crops: ReferenceItem[];
    water_models: ReferenceItem[];
    climate_models: ReferenceItem[];
    scenarios: ReferenceItem[];
    variables: ReferenceItem[];
}

const EMPTY_CONFIG: ProjectConfig = {
    crops: [],
    water_models: [],
    climate_models: [],
    scenarios: [],
    variables: [],
};

/**
 * Fetches `/api/projects/config/{slug}` and exposes the current state plus a
 * `refetch` callback. Used by the upload modal for the filename hint AND by
 * the resolution panel to re-read membership after attaching a new entity.
 */
export function useProjectConfig(projectSlug: string | undefined) {
    const [config, setConfig] = useState<ProjectConfig | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchConfig = useCallback(async () => {
        if (!projectSlug) {
            setConfig(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`/api/projects/config/${projectSlug}`);
            setConfig({ ...EMPTY_CONFIG, ...res.data });
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }, [projectSlug]);

    useEffect(() => {
        void fetchConfig();
    }, [fetchConfig]);

    return { config, loading, error, refetch: fetchConfig };
}
