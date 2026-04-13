import { MapContainer, TileLayer } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import 'leaflet/dist/leaflet.css';

const ProjectCardPreview = ({ project, fullWidth, onClick }: { project: any; fullWidth?: boolean; onClick?: () => void }) => {
    if (!project) return null;

    const lat = project.latitude || 20.0;
    const lon = project.longitude || 0.0;
    const zoom = project.zoom_level || 2;

    return (
        <div
            onClick={onClick}
            style={{
                ...(fullWidth ? {} : { maxWidth: 370 }),
                height: '100%',
                borderRadius: 14,
                overflow: 'hidden',
                border: '1px solid rgba(209, 167, 102, 0.35)',
                background: 'linear-gradient(160deg, rgba(40, 44, 52, 0.92) 0%, rgba(30, 33, 39, 0.96) 100%)',
                display: 'flex',
                flexDirection: 'column' as const,
                textDecoration: 'none',
                color: 'inherit',
                cursor: onClick ? 'pointer' : 'default',
                transition: onClick ? 'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease' : 'none',
            }}
            onMouseEnter={onClick ? (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 36px rgba(0, 0, 0, 0.4)';
                e.currentTarget.style.borderColor = 'rgba(209, 167, 102, 0.6)';
            } : undefined}
            onMouseLeave={onClick ? (e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
                e.currentTarget.style.borderColor = 'rgba(209, 167, 102, 0.35)';
            } : undefined}
        >
            <div
                style={{
                    height: 190,
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: '#282c34',
                    filter: 'brightness(1.5)',
                }}
            >
                <MapContainer
                    center={[lat, lon]}
                    zoom={zoom}
                    style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}
                    zoomControl={false}
                    attributionControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                    doubleClickZoom={false}
                    touchZoom={false}
                    keyboard={false}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />
                </MapContainer>
                {!project.enabled && (
                    <span
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1,
                            color: 'rgba(209, 167, 102, 0.25)',
                            fontSize: '2.2rem',
                        }}
                    >
                        <FontAwesomeIcon icon={faClock} />
                    </span>
                )}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1,
                        background: project.enabled
                            ? 'linear-gradient(180deg, transparent 40%, rgba(30, 33, 39, 0.7) 100%)'
                            : 'linear-gradient(180deg, rgba(30, 33, 39, 0.3) 0%, rgba(30, 33, 39, 0.75) 100%)',
                        pointerEvents: 'none',
                    }}
                />
            </div>
            <div style={{ padding: '20px 22px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3
                    style={{
                        fontFamily: "'Arial', 'Helvetica', sans-serif",
                        fontSize: '1.15rem',
                        fontWeight: 600,
                        color: project.enabled ? '#d1a766' : '#7a7a7a',
                        margin: '0 0 8px',
                        letterSpacing: '0.3px',
                    }}
                >
                    {project.title}
                </h3>
                <p
                    style={{
                        fontFamily: "'Arial', 'Helvetica', sans-serif",
                        fontSize: '0.88rem',
                        color: project.enabled ? '#b0b0b0' : '#666',
                        lineHeight: 1.55,
                        margin: '0 0 18px',
                        minHeight: '2.8em',
                        flex: 1,
                    }}
                >
                    {project.description || 'No description'}
                </p>
                <span
                    style={{
                        display: 'inline-block',
                        padding: '9px 22px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        borderRadius: 20,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.5px',
                        ...(project.enabled
                            ? {
                                  background: 'linear-gradient(135deg, #d1a766 0%, #c49a5c 100%)',
                                  color: '#1e2127',
                                  boxShadow: '0 4px 15px rgba(209, 167, 102, 0.25)',
                              }
                            : {
                                  background: 'rgba(74, 74, 74, 0.5)',
                                  color: '#666',
                              }),
                    }}
                >
                    {project.enabled ? 'Explore' : 'Coming Soon'}
                </span>
            </div>
        </div>
    );
};

export default ProjectCardPreview;
