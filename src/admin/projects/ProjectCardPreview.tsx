import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useGetOne } from 'react-admin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import 'leaflet/dist/leaflet.css';

const FitExtent = ({ extent }: { extent: any }) => {
    const map = useMap();
    useEffect(() => {
        if (extent && Array.isArray(extent) && extent.length === 2) {
            map.fitBounds(extent, { animate: false });
        }
    }, [extent, map]);
    return null;
};

const ProjectCardPreview = ({ project, fullWidth, onClick }: { project: any; fullWidth?: boolean; onClick?: () => void }) => {
    if (!project) return null;

    const { data: layer } = useGetOne(
        'layers',
        { id: project.card_layer_id },
        { enabled: Boolean(project.card_layer_id) },
    );

    const overlayUrl = layer?.layer_name
        ? `/api/layers/xyz/{z}/{x}/{y}?layer=${encodeURIComponent(layer.layer_name)}${
              project.card_style_id ? `&style_id=${project.card_style_id}` : ''
          }`
        : null;

    return (
        <div
            onClick={onClick}
            style={{
                ...(fullWidth ? {} : { maxWidth: 370 }),
                position: 'relative',
                aspectRatio: '16 / 10',
                overflow: 'hidden',
                border: 0,
                boxShadow: 'inset 0 0 0 1px rgba(172, 216, 216, 0.18)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                cursor: onClick ? 'pointer' : 'default',
                transition: onClick
                    ? 'transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.4s ease'
                    : 'none',
            }}
            onMouseEnter={onClick ? (e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow =
                    'inset 0 0 0 1px rgba(172, 216, 216, 0.55), 0 18px 44px rgba(0, 0, 0, 0.55)';
            } : undefined}
            onMouseLeave={onClick ? (e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(172, 216, 216, 0.18)';
            } : undefined}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#131516',
                    filter: project.enabled ? 'brightness(1.15)' : 'brightness(0.5) saturate(0.7)',
                }}
            >
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, background: '#131516' }}
                    zoomControl={false}
                    attributionControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                    doubleClickZoom={false}
                    touchZoom={false}
                    keyboard={false}
                >
                    <FitExtent extent={project.extent} />
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />
                    {overlayUrl && (
                        <TileLayer
                            key={`${layer?.layer_name}-${project.card_style_id ?? 'default'}`}
                            url={overlayUrl}
                            opacity={0.85}
                            noWrap
                        />
                    )}
                </MapContainer>
            </div>
            {!project.enabled && (
                <span
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1,
                        color: 'rgba(172, 216, 216, 0.35)',
                        fontSize: '2.4rem',
                    }}
                >
                    <FontAwesomeIcon icon={faClock} />
                </span>
            )}
            <h3
                style={{
                    position: 'absolute',
                    top: 18,
                    left: 20,
                    right: 'auto',
                    width: '65%',
                    margin: 0,
                    zIndex: 2,
                    fontFamily: "'Arial', 'Helvetica', sans-serif",
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: project.enabled ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                    letterSpacing: '0.4px',
                    lineHeight: 1.15,
                    textTransform: 'uppercase' as const,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.75)',
                }}
            >
                {project.title}
            </h3>
            {project.description && (
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 2,
                        background: '#131516',
                        padding: '16px 18px',
                        boxSizing: 'border-box' as const,
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontFamily: "'Arial', 'Helvetica', sans-serif",
                            fontSize: '0.6rem',
                            color: project.enabled ? '#ffffff' : 'rgba(255, 255, 255, 0.55)',
                            lineHeight: 1.55,
                        }}
                    >
                        {project.description}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProjectCardPreview;
