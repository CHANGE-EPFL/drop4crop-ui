import React from "react";
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';

// Populate these three when the paper is published. Any value that is
// non-null activates its corresponding button.
//   PAPER_URL   — URL to the published paper (DOI, journal, etc.)
//   BIBTEX      — BibTeX string; clicking copies it to the clipboard
//   ZOTERO_RIS  — URL to an RIS file Zotero can consume (or a DOI that
//                 Zotero's browser extension already understands)
const PAPER_URL = null;
const BIBTEX = null;
const ZOTERO_RIS = null;

const InfoPanel = ({ onClick, onClose, hasTimeline }) => {
  const bottomClass = hasTimeline ? 'popup-bottom' : 'popup-bottom-no-timeline';

  const handleCopyBibtex = (e) => {
    e.stopPropagation();
    if (!BIBTEX) return;
    navigator.clipboard?.writeText(BIBTEX);
  };

  return (
    <div className={`popup ${bottomClass}`} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" style={{ fontSize: '1rem' }}>Info & Attribution</Typography>
        </div>
        {onClose && (
          <Tooltip
            title="Close panel"
            placement="left"
            disableFocusListener disableTouchListener enterDelay={10}
            arrow
          >
            <CloseIcon
              sx={{
                fontSize: '1.2rem',
                color: '#009da9',
                cursor: 'pointer',
                '&:hover': {
                  color: '#ffffff'
                }
              }}
              onClick={onClose}
            />
          </Tooltip>
        )}
      </div>

      <p style={{ margin: "10px 0 5px", fontSize: "12px" }}>
        Data and content provided by the{" "}
        <a
          href="https://www.epfl.ch/labs/change/"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          CHANGE lab
        </a>.
      </p>

      <div style={{ marginTop: "12px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
          How to cite:
        </div>
        <p style={{ margin: "0 0 8px", fontSize: "12px", lineHeight: 1.5 }}>
          Sun, Q., Bassani, F., Tuninetti, M., and Bonetti, S. (2026).
          Uncertainties in global hydrological and climate models challenge
          future estimates of crop water use and sustainability.{" "}
          <em>Communications Earth &amp; Environment</em>, xx(xx), xx.
        </p>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <CitationAction
            label="Paper"
            tooltip={PAPER_URL ? "Open the published paper" : "Available upon publication"}
            href={PAPER_URL}
          />
          <CitationAction
            label="BibTeX"
            tooltip={BIBTEX ? "Copy BibTeX to clipboard" : "Available upon publication"}
            onClick={BIBTEX ? handleCopyBibtex : undefined}
            disabled={!BIBTEX}
          />
          <CitationAction
            label="Add to Zotero"
            tooltip={ZOTERO_RIS ? "Import this citation into Zotero" : "Available upon publication"}
            href={ZOTERO_RIS}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: "20px",
          borderTop: "1px solid #009da9",
          paddingTop: "15px",
        }}
      >
        <p style={{ margin: "5px 0", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>
            © 2026 - Developed by{" "}
            <a
              href="https://github.com/evanjt"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              Evan Thomas
            </a>
          </span>
          <span>
            Code:{" "}
            <a
              href="https://github.com/CHANGE-EPFL/drop4crop-api"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              API
            </a>
            {" | "}
            <a
              href="https://github.com/CHANGE-EPFL/drop4crop-ui"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              UI
            </a>
          </span>
        </p>
      </div>
    </div>
  );
};

// Small button-styled element for the three citation actions. Renders as a
// clickable anchor or button when activated (href or onClick supplied), and
// as a visibly disabled chip otherwise. Tooltip hints at when it becomes
// available.
const CitationAction = ({ label, tooltip, href, onClick, disabled }) => {
  const isDisabled = disabled || (!href && !onClick);
  const baseStyle = {
    display: "inline-block",
    padding: "3px 10px",
    fontSize: "11px",
    borderRadius: "12px",
    border: "1px solid #009da9",
    textDecoration: "none",
    cursor: isDisabled ? "not-allowed" : "pointer",
    color: isDisabled ? "#666" : "#009da9",
    borderColor: isDisabled ? "#444" : "#009da9",
    opacity: isDisabled ? 0.6 : 1,
    backgroundColor: "transparent",
    fontFamily: "inherit",
  };

  const content = (
    href && !isDisabled ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={baseStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {label}
      </a>
    ) : (
      <button
        type="button"
        style={baseStyle}
        onClick={onClick}
        disabled={isDisabled}
      >
        {label}
      </button>
    )
  );

  return (
    <Tooltip title={tooltip} arrow placement="top" enterDelay={200}>
      <span>{content}</span>
    </Tooltip>
  );
};

export default InfoPanel;

const linkStyle = {
  color: "#009da9",
  textDecoration: "none",
};
