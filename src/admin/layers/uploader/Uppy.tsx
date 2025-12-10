import React, { useRef, useState, useContext } from "react";
import { useNotify, useRefresh, AuthContext } from "react-admin";
import { Box, Stack, Typography, List, ListItem, ListItemText, CircularProgress, IconButton, Tooltip, Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import ReplayIcon from "@mui/icons-material/Replay";

import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import XHR from "@uppy/xhr-upload";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import "./UppyUploader.css"; // Import custom CSS

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
    <Box sx={{ border: '1px solid #ddd', borderRadius: 1, bgcolor: 'background.paper' }}>
      {/* Summary header */}
      <Box sx={{ p: 1, borderBottom: '1px solid #ddd', bgcolor: 'grey.50' }}>
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
                  borderBottom: '1px solid #f0f0f0',
                  '&:last-child': { borderBottom: 'none' },
                  bgcolor: 'error.50'
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

export const UppyUploader = ({ onUploadProgress, actionButton }) => {
  const refresh = useRefresh();
  const notify = useNotify();
  const pondRef = useRef(null);
  const authProvider = useContext(AuthContext);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadState, setUploadState] = useState({
    totalFiles: 0,
    completedFiles: 0,
    successfulFiles: 0,
    failedFiles: 0,
    isUploading: false
  });

  // Get the token using the auth provider
  const token = authProvider?.getToken() || "dev-token";
  const instructionText =
    "Format: {crop}_{watermodel}_{climatemodel}_{scenario}_{variable}_{year}.tif (e.g., rice_pcr-globwb_miroc5_rcp60_rg_2080)";
  const headers = {
    authorization: `Bearer ${token}`,
  };

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
      endpoint: "/api/layers/uploads",
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

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      if (
        file.name.toLowerCase().endsWith(".tif") ||
        file.name.toLowerCase().endsWith(".tiff")
      ) {
        uppy.addFile({
          name: file.name,
          type: file.type,
          data: file,
          source: "Local",
          isRemote: false,
        });
      } else {
        notify(`File ${file.name} is not a valid GeoTIFF file`, {
          type: "warning",
        });
      }
    });
  };

  return (
    <Box>
      {/* Upload Area */}
      <Box
        sx={{
          border: `2px dashed ${isDragOver ? "primary.main" : "#ccc"}`,
          borderRadius: 2,
          p: 2,
          textAlign: "center",
          backgroundColor: isDragOver ? "primary.50" : "#fafafa",
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
            const files = Array.from(e.target.files);
            files.forEach((file) => {
              uppy.addFile({
                name: file.name,
                type: file.type,
                data: file,
                source: "Local",
                isRemote: false,
              });
            });
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
                color: "white",
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

      {/* Instructions below */}
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.3 }}
          >
            <strong>Filename format:</strong> {instructionText}
          </Typography>
          <Tooltip
            title={
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Filename Examples:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1.5 }}>
                  <strong>Crop-Specific Layers (2 parts):</strong>
                </Typography>
                <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', mb: 0.5 }}>
                  • maize_yield.tif
                </Typography>
                <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', mb: 0.5 }}>
                  • wheat_production.tif
                </Typography>
                <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', mb: 0.5 }}>
                  • rice_mirca_area_irrigated.tif
                </Typography>
                <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', mb: 1.5 }}>
                  • soy_mirca_area_total.tif
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>General/Climate Layers (6-7 parts):</strong>
                </Typography>
                <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', mb: 0.5 }}>
                  • barley_pcr-globwb_hadgem2-es_rcp26_vwc_2080.tif
                </Typography>
                <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', mb: 0.5 }}>
                  • wheat_lpjml_gfdl-esm4_historical_yield_2020.tif
                </Typography>
                <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', mb: 0.5 }}>
                  • rice_lpjml_gfdl-esm4_historical_yield_perc_2020.tif
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1.5, fontStyle: 'italic' }}>
                  Format: {'{crop}_{variable}.tif'} OR {'{crop}_{water_model}_{climate_model}_{scenario}_{variable}_{year}.tif'}
                </Typography>
              </Box>
            }
            arrow
            placement="right"
          >
            <InfoIcon sx={{ fontSize: 18, color: 'info.main', cursor: 'help' }} />
          </Tooltip>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Existing files with the same name will be replaced
        </Typography>
      </Box>

      {/* Action button - positioned between drop area and file list */}
      {actionButton}

      {/* Upload status - shows success count and error details only */}
      <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
        <UppyFileList uppy={uppy} uploadState={uploadState} />
      </Box>
    </Box>
  );
};
