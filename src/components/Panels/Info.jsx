import React from "react";

const InfoPanel = () => {
  return (
    <div className="popup">
      <h3>Info & Attribution</h3>
      <p style={{ margin: "5px 0", fontSize: "12px" }}></p>
      <p style={{ margin: "5px 0", fontSize: "12px" }}>
        Data and content provided by the{" "}
        <a
          href="https://www.epfl.ch/labs/change/"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          CHANGE lab
        </a>
        :
        <br />• Francesca Bassani
        <br />• Qiming Sun
        <br />• Sara Bonetti
      </p>

      <div
        style={{
          marginTop: "20px",
          borderTop: "1px solid #d1a766",
          paddingTop: "15px",
        }}
      >
        <p style={{ margin: "5px 0", fontSize: "12px" }}>
          © 2025 - Developed by{" "}
          <a
            href="https://github.com/evanjt"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            Evan Thomas
          </a>
        </p>
        <p style={{ margin: "5px 0", fontSize: "12px" }}>
          <a
            href="https://github.com/CHANGE-EPFL/drop4crop-api"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            API Repository <span style={{ fontSize: "10px" }}>🔗</span>
          </a>
          <br />
          <a
            href="https://github.com/CHANGE-EPFL/drop4crop-ui"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            UI Repository <span style={{ fontSize: "10px" }}>🔗</span>
          </a>
        </p>
      </div>

      {/* <br />
            <p>
                <a href="https://www.epfl.ch/labs/change/publications" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    Our publications
                </a>
            </p> */}
    </div>
  );
};

export default InfoPanel;

const linkStyle = {
  color: "#d1a766",
  textDecoration: "none",
};
