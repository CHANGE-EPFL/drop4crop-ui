import React, { useRef, useState, useContext, useEffect, useCallback } from "react";
import { useNotify, useRefresh, AuthContext, useDataProvider } from "react-admin";
import { Box, Chip, Stack, Typography, List, ListItem, ListItemText, CircularProgress, IconButton, Tooltip, Button, alpha, useTheme } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import ReplayIcon from "@mui/icons-material/Replay";

import Uppy from "@uppy/core";
import XHR from "@uppy/xhr-upload";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import "./UppyUploader.css"; // Import custom CSS

import { parseFilename, extractSlugs } from "./parseFilename";
import type { ParsedFilename, SlugField } from "./parseFilename";
import { useProjectConfig } from "./useProjectConfig";
import type { ProjectConfig } from "./useProjectConfig";
import {
  classifyMissingSlugs,
  executeResolution,
} from "./resolveMissing";
import type { MissingSlug, ResolutionChoice } from "./resolveMissing";
import { ResolutionPanel } from "./ResolutionPanel";

// Error-only file list component - shows success count summary and only displays errors
const UppyFileList = ({ uppy, uploadState }) => {
  const [files, setFiles] = useState([]);
  const [errorMessages, setErrorMessages] = useState({});

  React.useEffect(() => {
    const updateFiles = () => {
      setFiles(Object.values(uppy.getFiles()));
    };

    // Initial load
    updateFiles();

    // Listen for file changes
    uppy.on('file-added', updateFiles);
    uppy.on('file-removed', updateFiles);
    uppy.on('upload-progress', updateFiles);
    uppy.on('upload-success', updateFiles);
    uppy.on('upload-error', updateFiles);

    return () => {
      uppy.off('file-added', updateFiles);
      uppy.off('file-removed', updateFiles);
      uppy.off('upload-progress', updateFiles);
      uppy.off('upload-success', updateFiles);
      uppy.off('upload-error', updateFiles);
    };
  }, [uppy]);

  // Store error messages when they occur
  const updateErrorMessage = (fileId, message) => {
    setErrorMessages(prev => ({ ...prev, [fileId]: message }));
  };

  // Expose the updateErrorMessage function via a ref-like pattern
  React.useEffect(() => {
    uppy.__updateErrorMessage = updateErrorMessage;
  }, [uppy]);

  const handleRemoveFile = (fileId) => {
    uppy.removeFile(fileId);
    // Clean up error message
    setErrorMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[fileId];
      return newMessages;
    });
  };

  const handleRetryFile = (fileId) => {
    // Clear the error message before retry
    setErrorMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[fileId];
      return newMessages;
    });
    uppy.retryUpload(fileId);
  };

  const handleRetryAllFailed = () => {
    // Clear all error messages before retry
    setErrorMessages({});
    uppy.retryAll();
  };

  // Filter to only show files with errors
  const errorFiles = files.filter(file => file.error);

  // Calculate counts
  const totalFiles = files.length;
  const completedFiles = files.filter(file => file.progress.complete || file.error).length;
  const successfulFiles = files.filter(file => file.progress.complete && !file.error).length;
  const pendingFiles = files.filter(file => !file.progress.complete && !file.error).length;

  if (totalFiles === 0) {
    return null;
  }

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
      {/* Summary header */}
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
        <Typography variant="subtitle2">
          Upload Status
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
          {successfulFiles > 0 && (
            <Typography variant="caption" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircleIcon sx={{ fontSize: 14 }} />
              {successfulFiles} successful
            </Typography>
          )}
          {errorFiles.length > 0 && (
            <Typography variant="caption" sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ErrorIcon sx={{ fontSize: 14 }} />
              {errorFiles.length} failed
            </Typography>
          )}
          {pendingFiles > 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CircularProgress size={12} thickness={3} />
              {pendingFiles} pending
            </Typography>
          )}
        </Box>
      </Box>

      {/* Only show error list if there are errors */}
      {errorFiles.length > 0 && (
        <>
          <Box sx={{ p: 1, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 500 }}>
              Errors:
            </Typography>
            {errorFiles.length > 1 && (
              <Button
                size="small"
                startIcon={<ReplayIcon sx={{ fontSize: 14 }} />}
                onClick={handleRetryAllFailed}
                sx={{ fontSize: '0.75rem', py: 0, minHeight: 24 }}
              >
                Retry All ({errorFiles.length})
              </Button>
            )}
          </Box>
          <List dense sx={{ maxHeight: 220, overflow: 'auto', p: 0 }}>
            {errorFiles.map((file) => (
              <ListItem
                key={file.id}
                sx={{
                  px: 1,
                  py: 0.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                  bgcolor: (theme) =>
                    alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                  <ErrorIcon color="error" fontSize="small" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="error" sx={{ fontSize: '0.75rem' }}>
                      {errorMessages[file.id] || file.error?.message || 'Upload failed'}
                    </Typography>
                  </Box>
                  <Tooltip title="Retry upload">
                    <IconButton
                      size="small"
                      onClick={() => handleRetryFile(file.id)}
                      sx={{ p: 0.5 }}
                      color="primary"
                    >
                      <ReplayIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove file">
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFile(file.id)}
                      sx={{ p: 0.5 }}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );
};

export const UppyUploader = ({ onUploadProgress, actionButton, projectId, projectSlug }) => {
  const refresh = useRefresh();
  const notify = useNotify();
  const pondRef = useRef(null);
  const authProvider = useContext(AuthContext);
  const dataProvider = useDataProvider();
  const theme = useTheme();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadState, setUploadState] = useState({
    totalFiles: 0,
    completedFiles: 0,
    successfulFiles: 0,
    failedFiles: 0,
    isUploading: false
  });

  // Project config drives both the filename hint AND the pre-flight check.
  // `refetch` is called after a resolution run so newly-attached entities show up.
  const { config: projectConfig, refetch: refetchProjectConfig } = useProjectConfig(projectSlug);

  // Pre-flight state. Files the user drops/selects are held here until we know
  // their slugs are all attached to the project. Files that resolve cleanly
  // pass straight through to Uppy.
  const [pendingFiles, setPendingFiles] = useState<{ file: File; parsed: ParsedFilename }[]>([]);
  const [preflightMissing, setPreflightMissing] = useState<MissingSlug[]>([]);
  const [preflightInvalid, setPreflightInvalid] = useState<{ filename: string; error: string }[]>([]);
  const [resolving, setResolving] = useState(false);

  // `hasCropSpecificVariables` drives whether the hint shows the 2-part form.
  const hasCropSpecificVariables = (projectConfig?.variables ?? []).some(
    (v) => v.is_crop_specific
  );
  const hasGeneralVariables = (projectConfig?.variables ?? []).some(
    (v) => !v.is_crop_specific
  );

  // Get the token using the auth provider
  const token = authProvider?.getToken() || "dev-token";
  const headers = {
    authorization: `Bearer ${token}`,
  };

  // Append the project UUID so every uploaded layer is bound to the current project.
  // Caller is responsible for passing projectId (the global upload entry has been removed).
  const uploadEndpoint = projectId
    ? `/api/layers/uploads?project_id=${encodeURIComponent(projectId)}`
    : "/api/layers/uploads";

  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        allowedFileTypes: [".tif", ".tiff"],
        maxFileSize: 250 * 1024 * 1024, // 250MB
        // maxNumberOfFiles removed - no limit on number of files
      },
      autoProceed: true,
      debug: true, // Enable debug mode
    }).use(XHR, {
      endpoint: uploadEndpoint,
      headers: headers,
      limit: 50, // Increased concurrent uploads from 25 to 50
      timeout: 15 * 60 * 1000, // 15 minutes timeout
      // onAfterResponse is called after fetch completes but BEFORE Uppy processes the response.
      // If we throw here, the error message will be used instead of Uppy's generic "network error".
      // This is the only way to extract error messages from non-2xx responses in Uppy v5.
      onAfterResponse: (xhr) => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Success - track completion and refresh the list
          refresh();

          setUploadState(prev => {
            const newState = {
              ...prev,
              completedFiles: prev.completedFiles + 1,
              successfulFiles: prev.successfulFiles + 1
            };

            if (newState.completedFiles === newState.totalFiles && newState.totalFiles > 0) {
              setTimeout(() => showSummaryNotification(newState), 500);
            }

            return newState;
          });
        } else {
          // Error - parse the response body and throw with the actual error message
          let errorMessage = `Upload failed (HTTP ${xhr.status})`;
          try {
            const json = JSON.parse(xhr.responseText);
            if (json.message && json.error) {
              errorMessage = `${json.message}: ${json.error}`;
            } else if (json.message) {
              errorMessage = json.message;
            } else if (json.error) {
              errorMessage = json.error;
            }
          } catch (e) {
            // If not JSON, use responseText or statusText
            if (xhr.responseText) {
              errorMessage = xhr.responseText;
            } else if (xhr.statusText) {
              errorMessage = `${xhr.statusText} (HTTP ${xhr.status})`;
            }
          }

          // Track the failure
          setUploadState(prev => {
            const newState = {
              ...prev,
              completedFiles: prev.completedFiles + 1,
              failedFiles: prev.failedFiles + 1
            };

            if (newState.completedFiles === newState.totalFiles && newState.totalFiles > 0) {
              setTimeout(() => showSummaryNotification(newState), 500);
            }

            return newState;
          });

          // Throw the error so Uppy uses our message instead of the generic "network error"
          throw new Error(errorMessage);
        }
      },
    })
  );

  // Track upload progress for summary notification
  uppy.on("upload", (data) => {
    // Upload is starting - initialize tracking
    const fileIDs = data?.fileIDs || uppy.getFiles().map(f => f.id);
    const fileCount = fileIDs.length;
    setUploadState({
      totalFiles: fileCount,
      completedFiles: 0,
      successfulFiles: 0,
      failedFiles: 0,
      isUploading: true
    });
  });

  // Capture HTTP error messages from failed uploads
  // The error message is extracted from the JSON response body in onAfterResponse
  uppy.on("upload-error", (file, error) => {
    // The error.message should now contain the actual server error message
    // If it's still the generic NetworkError message, try to get the cause
    let errorMessage = error?.message || 'Upload failed';

    // NetworkError wraps the actual error in .cause
    if (error?.cause?.message) {
      errorMessage = error.cause.message;
    }

    // Store the error message for display in the file list
    if (uppy.__updateErrorMessage && file) {
      uppy.__updateErrorMessage(file.id, errorMessage);
    }
  });

  
  // Update parent component with progress
  React.useEffect(() => {
    if (onUploadProgress) {
      onUploadProgress({
        completed: uploadState.completedFiles,
        total: uploadState.totalFiles,
        isUploading: uploadState.isUploading
      });
    }
  }, [uploadState, onUploadProgress]);

  // Function to show summary notification
  const showSummaryNotification = (state) => {
    const { successfulFiles, failedFiles, totalFiles } = state;

    if (successfulFiles === totalFiles) {
      // All files successful
      notify(`✅ Successfully uploaded ${successfulFiles} of ${totalFiles} files`, {
        type: "success",
        autoHideDuration: 5000
      });
    } else if (successfulFiles > 0) {
      // Partial success
      notify(`⚠️ Uploaded ${successfulFiles} of ${totalFiles} files successfully (${failedFiles} failed)`, {
        type: "warning",
        autoHideDuration: 8000
      });
    } else {
      // All failed
      notify(`❌ Failed to upload all ${totalFiles} files`, {
        type: "error",
        autoHideDuration: 8000
      });
    }

    // Reset upload state
    setUploadState({
      totalFiles: 0,
      completedFiles: 0,
      successfulFiles: 0,
      failedFiles: 0,
      isUploading: false
    });
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Add a file to Uppy after pre-flight has approved it.
  const pushToUppy = useCallback((file: File) => {
    uppy.addFile({
      name: file.name,
      type: file.type,
      data: file,
      source: "Local",
      isRemote: false,
    });
  }, [uppy]);

  // Central intake: called from both drop and file-input handlers. Parses
  // each filename, classifies slugs against the current project config, and
  // routes files into Uppy (if ready) or into the resolution queue.
  const intakeFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      if (!projectConfig) {
        // Config not loaded yet — fall back to direct upload; backend will validate.
        files.forEach(pushToUppy);
        return;
      }
      const parsedFiles = files
        .filter((f) => {
          const name = f.name.toLowerCase();
          if (name.endsWith(".tif") || name.endsWith(".tiff")) return true;
          notify(`File ${f.name} is not a valid GeoTIFF file`, { type: "warning" });
          return false;
        })
        .map((f) => ({ file: f, parsed: parseFilename(f.name) }));

      const { invalid, ready, missing } = await classifyMissingSlugs(
        parsedFiles.map((p) => ({ filename: p.file.name, parsed: p.parsed })),
        projectConfig,
        dataProvider as any,
      );

      // Files that parsed cleanly AND have all slugs in the project — upload now.
      const readyNames = new Set(ready.map((r) => r.filename));
      parsedFiles
        .filter((p) => readyNames.has(p.file.name))
        .forEach((p) => pushToUppy(p.file));

      if (missing.length === 0 && invalid.length === 0) return;

      // Stash the rest for resolution. Invalid files are reported but not stashed
      // (they need a user rename before anything else can help).
      const heldNames = new Set([
        ...missing.flatMap((m) => m.affectedFiles),
      ]);
      setPendingFiles((prev) => [
        ...prev,
        ...parsedFiles.filter((p) => heldNames.has(p.file.name)),
      ]);
      setPreflightMissing((prev) => mergeMissing(prev, missing));
      setPreflightInvalid((prev) => [...prev, ...invalid]);
    },
    [dataProvider, notify, projectConfig, pushToUppy],
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    void intakeFiles(Array.from(e.dataTransfer.files));
  };

  // Handler for the resolution panel's "Resolve all & upload" button.
  const handleResolve = useCallback(
    async (choices: ResolutionChoice[]) => {
      if (!projectId || !projectSlug) return;
      setResolving(true);
      try {
        await executeResolution(
          choices,
          projectId,
          projectSlug,
          dataProvider as any,
        );
        // Reload config so the newly-attached UUIDs show up in the junctions.
        await refetchProjectConfig();
        // Re-classify the held files against the refreshed config and push the
        // ones that are now ready to Uppy. The config refetch may race the
        // setState, so we re-parse here using the freshly-fetched config.
        const fresh = await dataProvider
          .getProjectConfig(projectSlug)
          .then((r: any) => r.data as ProjectConfig)
          .catch(() => projectConfig);
        const { ready, missing, invalid } = await classifyMissingSlugs(
          pendingFiles.map((p) => ({ filename: p.file.name, parsed: p.parsed })),
          fresh ?? projectConfig!,
          dataProvider as any,
        );
        const readyNames = new Set(ready.map((r) => r.filename));
        pendingFiles
          .filter((p) => readyNames.has(p.file.name))
          .forEach((p) => pushToUppy(p.file));
        // Keep any files whose slugs are still missing (shouldn't happen after a
        // successful resolve, but don't silently drop them).
        const stillHeld = new Set(missing.flatMap((m) => m.affectedFiles));
        setPendingFiles((prev) => prev.filter((p) => stillHeld.has(p.file.name)));
        setPreflightMissing(missing);
        setPreflightInvalid(invalid);
      } catch (err) {
        notify(
          `Resolution failed: ${err instanceof Error ? err.message : String(err)}`,
          { type: "error" },
        );
        throw err;
      } finally {
        setResolving(false);
      }
    },
    [
      dataProvider,
      notify,
      pendingFiles,
      projectConfig,
      projectId,
      projectSlug,
      pushToUppy,
      refetchProjectConfig,
    ],
  );

  const handleCancelResolve = () => {
    setPendingFiles([]);
    setPreflightMissing([]);
    setPreflightInvalid([]);
  };

  return (
    <Box>
      {/* Upload Area */}
      <Box
        sx={{
          border: "2px dashed",
          borderColor: isDragOver ? "primary.main" : "divider",
          borderRadius: 2,
          p: 2,
          textAlign: "center",
          backgroundColor: isDragOver
            ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.15 : 0.08)
            : "background.default",
          transition: "all 0.2s ease-in-out",
          cursor: "pointer",
          minHeight: 100,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".tif,.tiff"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            void intakeFiles(files);
            e.target.value = ""; // Reset input
          }}
          style={{ display: "none" }}
          id="uppy-file-input"
        />
        <label
          htmlFor="uppy-file-input"
          style={{ cursor: "pointer", width: "100%" }}
        >
          <Stack spacing={1} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.contrastText",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.1)",
                },
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="body1" color="primary">
              {isDragOver ? "Drop files here" : "Click or drag files to upload"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              GeoTIFF files (.tif, .tiff) • Max 250MB
            </Typography>
          </Stack>
        </label>
      </Box>

      {/* Per-project filename hint. The canonical 6-part form is shown in full
          with slug chips so the user can assemble a filename by inspection.
          Axes the project doesn't use render as literal `null` / `nan`. */}
      <FilenameHint
        config={projectConfig}
        hasCropSpecificVariables={hasCropSpecificVariables}
        hasGeneralVariables={hasGeneralVariables}
      />

      {/* Pre-flight resolution panel. Only renders when the drop had one or more
          unresolved slugs. Clean files upload immediately; these are blocked
          until the user creates/attaches the missing entries. */}
      {(preflightMissing.length > 0 || preflightInvalid.length > 0) && (
        <ResolutionPanel
          missing={preflightMissing}
          invalid={preflightInvalid}
          onResolve={handleResolve}
          onCancel={handleCancelResolve}
          resolving={resolving}
        />
      )}

      {/* Action button - positioned between drop area and file list */}
      {actionButton}

      {/* Upload status - shows success count and error details only */}
      <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
        <UppyFileList uppy={uppy} uploadState={uploadState} />
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Merge a fresh batch of missing slugs into existing state, deduping by
 *  (field, slug) and unioning the affectedFiles lists. */
function mergeMissing(prev: MissingSlug[], next: MissingSlug[]): MissingSlug[] {
  const byKey = new Map<string, MissingSlug>();
  for (const m of [...prev, ...next]) {
    const key = `${m.field}:${m.slug}`;
    const existing = byKey.get(key);
    if (existing) {
      const merged = new Set([...existing.affectedFiles, ...m.affectedFiles]);
      byKey.set(key, { ...existing, affectedFiles: [...merged] });
    } else {
      byKey.set(key, m);
    }
  }
  return [...byKey.values()];
}

interface FilenameHintProps {
  config: ProjectConfig | null;
  hasCropSpecificVariables: boolean;
  hasGeneralVariables: boolean;
}

/**
 * Renders the filename format for the current project as a chip breakdown.
 * The canonical climate form (6 parts, stable position order) is always shown.
 * For axes the project doesn't use, we display the literal `null` sentinel so
 * scripts renaming files know exactly what to write regardless of project.
 */
function FilenameHint({
  config,
  hasCropSpecificVariables,
  hasGeneralVariables,
}: FilenameHintProps) {
  if (!config) {
    return (
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Loading project configuration…
        </Typography>
      </Box>
    );
  }

  const firstSlug = (arr: { slug: string }[], fallback = "null") =>
    arr[0]?.slug ?? fallback;

  const hasWaterModels = config.water_models.length > 0;
  const hasClimateModels = config.climate_models.length > 0;
  const hasScenarios = config.scenarios.length > 0;
  const hasTimeline = config.project?.year_axis != null;
  const generalVars = config.variables.filter((v) => !v.is_crop_specific);
  const cropVars = config.variables.filter((v) => v.is_crop_specific);

  const climateExample = [
    firstSlug(config.crops, "crop"),
    hasWaterModels ? firstSlug(config.water_models) : "null",
    hasClimateModels ? firstSlug(config.climate_models) : "null",
    hasScenarios ? firstSlug(config.scenarios) : "null",
    hasGeneralVariables ? firstSlug(generalVars) : "null",
    hasTimeline ? "2080" : "null",
  ].join("_") + ".tif";

  const cropExample =
    hasCropSpecificVariables && cropVars.length > 0 && config.crops.length > 0
      ? `${firstSlug(config.crops)}_${firstSlug(cropVars)}.tif`
      : null;

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Filename format
        </Typography>
        <Tooltip
          title={
            <Box sx={{ p: 1, maxWidth: 320 }}>
              <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                The positional order is fixed regardless of which axes this
                project uses — that way a rename script doesn't depend on the
                project config. Slots for axes this project doesn't use should
                be written as <code>null</code> or <code>nan</code>
                (case-insensitive).
              </Typography>
              {cropExample && (
                <Typography variant="caption" component="div">
                  For crop-specific variables, the 2-part form
                  <code>{" {crop}_{crop_variable}.tif"}</code> is also accepted.
                </Typography>
              )}
            </Box>
          }
          arrow
          placement="right"
        >
          <InfoIcon sx={{ fontSize: 16, color: "info.main", cursor: "help" }} />
        </Tooltip>
      </Stack>

      <Box sx={{ fontFamily: "monospace", fontSize: "0.85rem", mb: 1.5 }}>
        <Typography component="span" color="text.secondary">
          {"{crop}"}
        </Typography>
        <Sep />
        <Slot used={hasWaterModels} label="water_model" />
        <Sep />
        <Slot used={hasClimateModels} label="climate_model" />
        <Sep />
        <Slot used={hasScenarios} label="scenario" />
        <Sep />
        <Slot used={hasGeneralVariables} label="variable" />
        <Sep />
        <Slot used={hasTimeline} label="year" />
        <Typography component="span" color="text.secondary">
          .tif
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
        Example: <code>{climateExample}</code>
      </Typography>

      <Stack spacing={0.75}>
        {config.crops.length > 0 && (
          <AxisChips label="crop" items={config.crops} />
        )}
        {hasWaterModels && (
          <AxisChips label="water_model" items={config.water_models} />
        )}
        {hasClimateModels && (
          <AxisChips label="climate_model" items={config.climate_models} />
        )}
        {hasScenarios && (
          <AxisChips label="scenario" items={config.scenarios} />
        )}
        {hasGeneralVariables && (
          <AxisChips label="variable" items={generalVars} />
        )}
      </Stack>

      {cropExample && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            Crop-specific short form:{" "}
            <code>{"{crop}_{crop_variable}.tif"}</code>
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            Example: <code>{cropExample}</code>
          </Typography>
        </Box>
      )}

      {!hasWaterModels && !hasClimateModels && !hasScenarios && !hasTimeline && hasGeneralVariables && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            Since all middle axes and year are disabled, the short form is also
            accepted:{" "}
            <code>{"{crop}_{variable}.tif"}</code>
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            Example: <code>{firstSlug(config.crops, "crop")}_{firstSlug(generalVars)}.tif</code>
          </Typography>
        </Box>
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 1.5, fontStyle: "italic" }}
      >
        Existing files with the same name will be replaced.
      </Typography>
    </Box>
  );
}

const Sep = () => (
  <Typography component="span" color="text.disabled" sx={{ mx: 0.25 }}>
    _
  </Typography>
);

function Slot({ used, label }: { used: boolean; label: string }) {
  if (used) {
    return (
      <Typography component="span" color="text.secondary">
        {`{${label}}`}
      </Typography>
    );
  }
  return (
    <Typography component="span" sx={{ color: "text.disabled", fontStyle: "italic" }}>
      null
    </Typography>
  );
}

interface AxisChipsProps {
  label: string;
  items: { slug: string; name: string }[];
}

function AxisChips({ label, items }: AxisChipsProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ minWidth: 110, fontFamily: "monospace" }}
      >
        {label}:
      </Typography>
      {items.slice(0, 20).map((item) => (
        <Chip
          key={item.slug}
          label={item.slug}
          size="small"
          variant="outlined"
          sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}
        />
      ))}
      {items.length > 20 && (
        <Typography variant="caption" color="text.secondary">
          +{items.length - 20} more
        </Typography>
      )}
    </Stack>
  );
}
