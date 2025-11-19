import React, { useRef, useState, useContext } from "react";
import { useNotify, useRefresh, AuthContext } from "react-admin";
import { Box, Stack, Typography, List, ListItem, ListItemText, CircularProgress, IconButton } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CancelIcon from "@mui/icons-material/Cancel";

import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import XHR from "@uppy/xhr-upload";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import "./UppyUploader.css"; // Import custom CSS

// Simple file list component for efficient bulk uploads
const UppyFileList = ({ uppy }) => {
  const [files, setFiles] = useState([]);

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

  const handleRemoveFile = (fileId) => {
    uppy.removeFile(fileId);
  };

  const getStatusIcon = (file) => {
    if (file.error) {
      return <ErrorIcon color="error" fontSize="small" />;
    }
    if (file.progress.complete) {
      return <CheckCircleIcon color="success" fontSize="small" />;
    }
    if (file.progress.uploadStarted) {
      return <CircularProgress size={16} thickness={2} />;
    }
    return <CircularProgress size={16} thickness={2} variant="indeterminate" />;
  };

  const getStatusText = (file) => {
    if (file.error) {
      return `Error: ${file.error.message || 'Upload failed'}`;
    }
    if (file.progress.complete) {
      return 'Upload complete';
    }
    if (file.progress.uploadStarted) {
      return `Uploading... ${Math.round(file.progress.percentage)}%`;
    }
    return 'Waiting to upload';
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <Box sx={{ border: '1px solid #ddd', borderRadius: 1, bgcolor: 'background.paper' }}>
      <Typography variant="subtitle2" sx={{ p: 1, borderBottom: '1px solid #ddd', bgcolor: 'grey.50' }}>
        Upload Queue ({files.length} files)
      </Typography>
      <List dense sx={{ maxHeight: 280, overflow: 'auto', p: 0 }}>
        {files.map((file) => (
          <ListItem
            key={file.id}
            sx={{
              px: 1,
              py: 0.5,
              borderBottom: '1px solid #f0f0f0',
              '&:last-child': { borderBottom: 'none' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
              {getStatusIcon(file)}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontSize: '0.85rem' }}>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {getStatusText(file)}
                </Typography>
              </Box>
              {!file.progress.uploadStarted && (
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFile(file.id)}
                  sx={{ p: 0.5 }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </ListItem>
        ))}
      </List>
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
      onAfterResponse: (response) => {
        // Track actual HTTP completion
        if (response.status === 200 || response.status === 201) {
          refresh();

          // Update state to track actual HTTP completion
          setUploadState(prev => {
            const newState = {
              ...prev,
              completedFiles: prev.completedFiles + 1,
              successfulFiles: prev.successfulFiles + 1
            };

            // Check if all files are actually complete
            if (newState.completedFiles === newState.totalFiles && newState.totalFiles > 0) {
              setTimeout(() => showSummaryNotification(newState), 500); // Small delay to ensure all processing is done
            }

            return newState;
          });
        } else {
          // Track HTTP failure
          setUploadState(prev => {
            const newState = {
              ...prev,
              completedFiles: prev.completedFiles + 1,
              failedFiles: prev.failedFiles + 1
            };

            // Check if all files are complete (including failures)
            if (newState.completedFiles === newState.totalFiles && newState.totalFiles > 0) {
              setTimeout(() => showSummaryNotification(newState), 500);
            }

            return newState;
          });
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
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.3 }}
        >
          <strong>Filename format:</strong> {instructionText}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Existing files with the same name will be replaced
        </Typography>
      </Box>

      {/* Action button - positioned between drop area and file list */}
      {actionButton}

      {/* Simple file list for uploads */}
      <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
        <UppyFileList uppy={uppy} />
      </Box>
    </Box>
  );
};
