import { stringify } from 'query-string';
import { fetchUtils, DataProvider } from 'ra-core';
import { useNotify } from 'react-admin';

const convertFileToBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file.rawFile);
    });

const handleBinaryUpload = async (resource, params) => {
    const { data } = params;

    if ((resource === 'plots' || resource === 'soil_types')
        && data.image && data.image.rawFile instanceof File) {
        data.image = await convertFileToBase64(data.image);
    }
    if (resource === 'gnss' && data.attachments && data.attachments.rawFile instanceof File) {
        data.data_base64 = await convertFileToBase64(data.attachments);
        data.filename = data.attachments.title;
    }

    if (resource === 'soil_profiles') {
        const imagePromises = [];

        if (data.photo && data.photo.rawFile instanceof File) {
            imagePromises.push(
                convertFileToBase64(data.photo).then(base64 => {
                    data.photo = base64;
                })
            );
        }

        if (data.soil_diagram && data.soil_diagram.rawFile instanceof File) {
            imagePromises.push(
                convertFileToBase64(data.soil_diagram).then(base64 => {
                    data.soil_diagram = base64;
                })
            );
        }

        await Promise.all(imagePromises);
    }

    return params;
};

// Helper function to convert string boolean values to actual booleans and handle null markers
const convertBooleanStrings = (filter: any) => {
    const converted = { ...filter };
    Object.keys(converted).forEach(key => {
        if (converted[key] === 'true') {
            converted[key] = true;
        } else if (converted[key] === 'false') {
            converted[key] = false;
        } else if (converted[key] === '__null__') {
            converted[key] = null;
        }
    });
    return converted;
};

const dataProvider = (
    apiUrl: string,
    httpClient = fetchUtils.fetchJson,
    countHeader: string = 'Content-Range'
): DataProvider => ({
    getList: (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;

        const rangeStart = (page - 1) * perPage;
        const rangeEnd = page * perPage - 1;

        // Convert boolean string values to actual booleans
        const processedFilter = convertBooleanStrings(params.filter);

        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([rangeStart, rangeEnd]),
            filter: JSON.stringify(processedFilter),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        const options =
            countHeader === 'Content-Range'
                ? {
                    // Chrome doesn't return `Content-Range` header if no `Range` is provided in the request.
                    headers: new Headers({
                        Range: `${resource}=${rangeStart}-${rangeEnd}`,
                    }),
                }
                : {};

        return httpClient(url, options).then(({ headers, json }) => {
            if (!headers.has(countHeader)) {
                throw new Error(
                    `The ${countHeader} header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare ${countHeader} in the Access-Control-Expose-Headers header?`
                );
            }
            return {
                data: json,
                total:
                    countHeader === 'Content-Range'
                        ? parseInt(
                            headers.get('content-range').split('/').pop(),
                            10
                        )
                        : parseInt(headers.get(countHeader.toLowerCase())),
            };
        });
    },

    getOne: (resource, params) => {
        return httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
            data: json,
        }));
    },

    getMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids }),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        return httpClient(url).then(({ json }) => ({ data: json }));
    },

    getManyReference: (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;

        const rangeStart = (page - 1) * perPage;
        const rangeEnd = page * perPage - 1;

        // Convert boolean string values to actual booleans
        const processedFilter = convertBooleanStrings({
            ...params.filter,
            [params.target]: params.id,
        });

        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify(processedFilter),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        const options =
            countHeader === 'Content-Range'
                ? {
                    // Chrome doesn't return `Content-Range` header if no `Range` is provided in the request.
                    headers: new Headers({
                        Range: `${resource}=${rangeStart}-${rangeEnd}`,
                    }),
                }
                : {};

        return httpClient(url, options).then(({ headers, json }) => {
            if (!headers.has(countHeader)) {
                throw new Error(
                    `The ${countHeader} header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare ${countHeader} in the Access-Control-Expose-Headers header?`
                );
            }
            return {
                data: json,
                total:
                    countHeader === 'Content-Range'
                        ? parseInt(
                            headers.get('content-range').split('/').pop(),
                            10
                        )
                        : parseInt(headers.get(countHeader.toLowerCase())),
            };
        });
    },

    update: async (resource, params) => {
        params = await handleBinaryUpload(resource, params);
        return httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json }));
    },
    // simple-rest doesn't handle provide an updateMany route, so we fallback to calling update n times instead
    updateMany: async (resource, params) => {
        return httpClient(`${apiUrl}/${resource}/batch`, {
            method: 'PUT',
            body: JSON.stringify({ ids: params.ids, data: params.data }),
        }).then(({ json }) => ({ data: json }));
    },
    create: async (resource, params) => {
        params = await handleBinaryUpload(resource, params);
        return httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json }));
    },
    delete: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
            headers: new Headers({
                'Content-Type': 'text/plain',
            }),
        }).then(({ json }) => ({ data: json })),
    deleteMany: (resource, params) => {
        // Send a list of ids to delete
        // The API should return an array of the deleted ids
        // So that the dataProvider can update the redux store
        // and the view
        if (params.ids.length === 0) {
            return Promise.resolve({ data: [] });
        } else {
            return httpClient(`${apiUrl}/${resource}/batch`, {
                method: 'DELETE',
                body: JSON.stringify(params.ids),
            }).then(({ json }) => ({ data: json }));
        }
    },
    createMany: async (resource, params) => {
        const items = params.data;
        return httpClient(`${apiUrl}/${resource}/batch`, {
            method: 'POST',
            body: JSON.stringify(items),
        }).then(({ json }) => ({ data: json }));
    },
    updateManyArray: async (resource, params) => {
        const items = params.data;
        return httpClient(`${apiUrl}/${resource}/batch`, {
            method: 'PUT',
            body: JSON.stringify(items),
        }).then(({ json }) => ({ data: json }));
    },
    syncStylesToLayer: async () => {
        return httpClient(`${apiUrl}/layers/sync_styles`, {
            method: 'POST'
        }).then(({ json }) => ({ data: json }));
    },
    // Statistics endpoints
    getStatsSummary: async () => {
        return httpClient(`${apiUrl}/statistics/summary`).then(({ json }) => ({ data: json }));
    },
    getStatsLayers: async (params) => {
        const query = {
            start_date: params?.start_date,
            end_date: params?.end_date,
            limit: params?.limit || 100,
            offset: params?.offset || 0,
        };
        const url = `${apiUrl}/statistics?${stringify(query)}`;
        return httpClient(url).then(({ json }) => ({ data: json }));
    },
    getStatsLayer: async (layerId) => {
        return httpClient(`${apiUrl}/statistics/${layerId}`).then(({ json }) => ({ data: json }));
    },
    getStatsTimeline: async (layerId) => {
        return httpClient(`${apiUrl}/statistics/${layerId}/timeline`).then(({ json }) => ({ data: json }));
    },
    getLiveStats: async () => {
        return httpClient(`${apiUrl}/statistics/live`).then(({ json }) => ({ data: json }));
    },
    // Cache endpoints
    getCacheInfo: async () => {
        return httpClient(`${apiUrl}/cache/info`).then(({ json }) => ({ data: json }));
    },
    getCacheKeys: async () => {
        return httpClient(`${apiUrl}/cache/keys`).then(({ json }) => ({ data: json }));
    },
    clearAllCache: async () => {
        return httpClient(`${apiUrl}/cache/clear`, {
            method: 'POST'
        }).then(({ json }) => ({ data: json }));
    },
    clearLayerCache: async (layerName) => {
        return httpClient(`${apiUrl}/cache/layers/${layerName}`, {
            method: 'DELETE'
        }).then(({ json }) => ({ data: json }));
    },
    getCacheTtl: async () => {
        return httpClient(`${apiUrl}/cache/ttl`).then(({ json }) => ({ data: json }));
    },
    updateCacheTtl: async (ttlSeconds) => {
        return httpClient(`${apiUrl}/cache/ttl`, {
            method: 'PATCH',
            body: JSON.stringify({ ttl_seconds: ttlSeconds })
        }).then(({ json }) => ({ data: json }));
    },
    warmLayerCache: async (layerName) => {
        return httpClient(`${apiUrl}/cache/layers/${layerName}/warm`, {
            method: 'POST'
        }).then(({ json }) => ({ data: json }));
    },
    persistLayerCache: async (layerName) => {
        return httpClient(`${apiUrl}/cache/layers/${layerName}/persist`, {
            method: 'POST'
        }).then(({ json }) => ({ data: json }));
    },
    unpersistLayerCache: async (layerName) => {
        return httpClient(`${apiUrl}/cache/layers/${layerName}/persist`, {
            method: 'DELETE'
        }).then(({ json }) => ({ data: json }));
    },
    // Layer statistics recalculation endpoints
    recalculateLayerStats: async (layerId) => {
        return httpClient(`${apiUrl}/layers/${layerId}/recalculate-stats`, {
            method: 'POST'
        }).then(({ json }) => ({ data: json }));
    },
    recalculateAllLayerStats: async (params?: {
        crop?: string,
        variable?: string,
        water_model?: string,
        climate_model?: string,
        scenario?: string,
        year?: number,
        only_null_stats?: boolean,
        limit?: number,
        stats_status_value?: string,
        force?: boolean,
    }) => {
        const query = params ? stringify(params) : '';
        return httpClient(`${apiUrl}/layers/recalculate-stats${query ? '?' + query : ''}`, {
            method: 'POST'
        }).then(({ json }) => ({ data: json }));
    },
    // Get recalculation job status
    getRecalculateJobStatus: async () => {
        return httpClient(`${apiUrl}/layers/recalculate-stats/status`, {
            method: 'GET'
        }).then(({ json }) => ({ data: json }));
    },
    // Cancel running recalculation job
    cancelRecalculateJob: async () => {
        return httpClient(`${apiUrl}/layers/recalculate-stats/cancel`, {
            method: 'POST'
        }).then(({ json }) => ({ data: json }));
    },
    // Bulk recalculate stats by specific IDs (single request)
    recalculateStatsByIds: async (ids: string[]) => {
        return httpClient(`${apiUrl}/layers/recalculate-stats-by-ids`, {
            method: 'POST',
            body: JSON.stringify({ ids })
        }).then(({ json }) => ({ data: json }));
    },
});


export default dataProvider;
