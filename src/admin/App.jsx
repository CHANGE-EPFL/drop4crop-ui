/* eslint react/jsx-key: off */
import { useState, useRef, useEffect } from "react";
import { Admin, Resource, Loading } from "react-admin";
// import simpleRestProvider from 'ra-data-simple-rest';
import simpleRestProvider from "./dataProvider/index";
import Keycloak from "keycloak-js";
import { httpClient } from "ra-keycloak";
import { keycloakAuthProvider } from "./authProvider";
import Layout from "./Layout";
import styles from "./styles";
import layers from "./layers";
import statistics from "./statistics";
import cache from "./cache";
import axios from "axios";
import { defaultTheme } from "react-admin";
import Dashboard from "./Dashboard";

const initOptions = {
  onLoad: "login-required",
  checkLoginIframe: false,
  enableLogging: true,
  // Disable silent SSO check to avoid iframe timeout issues
  silentCheckSsoRedirectUri: null,
  pkceMethod: false,
};

const getPermissions = (decoded) => {
  const roles = decoded?.realm_access?.roles;
  if (!roles) {
    return false;
  }
  if (roles.includes("admin")) return "admin";
  if (roles.includes("user")) return "user";
  return false;
};

const UIConfigUrl = "/api/config";
export const apiUrl = "/api";

const App = () => {
  const [keycloak, setKeycloak] = useState();
  const initializingPromise = useRef(undefined);
  const authProvider = useRef();
  const dataProvider = useRef();
  const [deployment, setDeployment] = useState(undefined);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initKeyCloakClient = async () => {
      try {
        console.log('Starting Keycloak initialization...');
        const response = await axios.get("/api/config/keycloak");
        const keycloakConfig = response.data;
        const browserKeycloakUrl = import.meta.env.VITE_KEYCLOAK_BROWSER_URL;
        if (browserKeycloakUrl) {
          keycloakConfig.url = browserKeycloakUrl;
        }

        console.log('Keycloak config:', keycloakConfig);

        // Initialize Keycloak here, once you have the configuration
        const keycloakClient = new Keycloak({
          url: keycloakConfig.url,
          realm: keycloakConfig.realm,
          clientId: keycloakConfig.clientId,
        });

        console.log('About to init Keycloak with options:', initOptions);
        await keycloakClient.init(initOptions);

        const redirectUri = window.location.origin + "/admin";
        console.log('Using redirect URI:', redirectUri);
        console.log('Window location origin:', window.location.origin);
        console.log('Window location href:', window.location.href);
        console.log('Keycloak client config:', {
          url: keycloakConfig.url,
          realm: keycloakConfig.realm,
          clientId: keycloakConfig.clientId
        });

        authProvider.current = keycloakAuthProvider(keycloakClient, {
          onPermissions: getPermissions,
          loginRedirectUri: redirectUri,
          logoutRedirectUri: redirectUri,
        });
        dataProvider.current = simpleRestProvider(
          apiUrl,
          httpClient(keycloakClient)
        );
        return keycloakClient;
      } catch (error) {
        console.error("Failed to initialize authentication:", error);
        setInitError(
          "Failed to initialize authentication. Please check your network connection and try again."
        );
        throw error;
      }
    };

    if (!initializingPromise.current) {
      initializingPromise.current = initKeyCloakClient();
    }

    initializingPromise.current
      .then((keycloakClient) => {
        setKeycloak(keycloakClient);
      })
      .catch((error) => {
        console.error("Authentication initialization failed:", error);
      });
  }, [keycloak]);

  if (initError)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          fontSize: "18px",
          color: "#d32f2f",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <p>Authentication Error</p>
        <p
          style={{
            fontSize: "14px",
            marginTop: "10px",
            color: "#666",
            maxWidth: "400px",
          }}
        >
          {initError}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#2E7D87",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );

  if (!keycloak)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          fontSize: "18px",
          color: "#666",
        }}
      >
        <p>Loading Drop4Crop Admin...</p>
        <p style={{ fontSize: "14px", marginTop: "10px", color: "#999" }}>
          Initializing authentication...
        </p>
      </div>
    );

  const theme = {
    ...defaultTheme,
    sidebar: {
      width: 150, // The default value is 240
    },
  };
  return (
    <Admin
      authProvider={authProvider.current}
      dataProvider={dataProvider.current}
      title="CHANGE Drop4Crop Admin"
      layout={Layout}
      theme={theme}
      dashboard={Dashboard}
      basename="/admin"
    >
      {(permissions) => (
        <>
          {permissions ? (
            <>
              {permissions === "admin" ? (
                <>
                  <Resource name="layers" {...layers} />
                  <Resource name="styles" {...styles} />
                  <Resource name="statistics" {...statistics} />
                  <Resource name="cache" {...cache} />
                </>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </Admin>
  );
};
export default App;
