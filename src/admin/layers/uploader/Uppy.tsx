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

export const UppyUploader = () => {
  const refresh = useRefresh();
  const notify = useNotify();
  const pondRef = useRef(null);
  const authProvider = useContext(AuthContext);
  const [isDragOver, setIsDragOver] = useState(false);

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
        maxNumberOfFiles: 25,
      },
      autoProceed: true,
      debug: true, // Enable debug mode
    }).use(XHR, {
      endpoint: "/api/layers/uploads",
      headers: headers,
      limit: 25,
      timeout: 15 * 60 * 1000, // 15 minutes timeout
      onBeforeRequest: (request) => {
        console.log("Uppy: Starting upload request", request);
      },
      onAfterResponse: (response) => {
        console.log("Uppy: Upload response received", {
          status: response.status,
          responseText: response.response,
          headers: response.headers,
        });

        // Try to parse response safely
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(response.response);
        } catch (e) {
          console.error("Uppy: Failed to parse response as JSON", e);
          notify(`Upload failed: Invalid server response`, {
            type: "error",
          });
          return;
        }

        if (response.status === 200 || response.status === 201) {
          notify("File uploaded successfully", { type: "success" });
          refresh();
        } else {
          console.error("Uppy: Upload failed", parsedResponse);
          const errorMsg =
            parsedResponse?.detail?.message ||
            parsedResponse?.message ||
            parsedResponse?.error ||
            "Unknown upload error";
          notify(`Upload failed: ${errorMsg}`, { type: "error" });
        }
      },
      onProgress: (progress) => {
        console.log("Uppy: Upload progress", progress);
      },
      onUploadError: (error) => {
        console.error("Uppy: Upload error", error);
        notify(`Upload error: ${error.message}`, { type: "error" });
      },
    })
  );

  // Add Uppy event listeners for debugging
  uppy.on("file-added", (file) => {
    console.log("Uppy: File added", file);
  });

  uppy.on("upload-started", (data) => {
    console.log("Uppy: Upload started", data);
  });

  uppy.on("upload-success", (file, response) => {
    console.log("Uppy: Upload success", file, response);
  });

  uppy.on("upload-error", (file, error, response) => {
    console.error("Uppy: Upload error", file, error, response);
    notify(`Upload failed for ${file.name}: ${error.message}`, {
      type: "error",
    });
  });

  uppy.on("error", (error) => {
    console.error("Uppy: General error", error);
  });

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

      {/* Simple file list for uploads */}
      <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
        <UppyFileList uppy={uppy} />
      </Box>
    </Box>
  );
};
