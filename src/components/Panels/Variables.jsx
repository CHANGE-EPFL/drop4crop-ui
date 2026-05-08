import React, { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ReactMarkdown from 'react-markdown';
import PanelTitleWithTooltip, { MarkdownTooltip } from './Title';

const brToMarkdown = (text) => (text || '').replace(/<br\s*\/?>/gi, '  \n');

const renderVariableLabel = (variable) => {
    const hasName = variable.name && variable.name.trim();
    const hasAbbr = variable.abbreviation && variable.abbreviation.trim();

    if (hasName && hasAbbr) {
        if (variable.subscript) {
            return <span>{variable.name} ({variable.abbreviation}<sub>{variable.subscript}</sub>)</span>;
        }
        return `${variable.name} (${variable.abbreviation})`;
    }
    if (hasName) return variable.name;
    if (hasAbbr) {
        if (variable.subscript) {
            return <span>{variable.abbreviation}<sub>{variable.subscript}</sub></span>;
        }
        return variable.abbreviation;
    }
    return variable.slug || variable.id;
};

const GroupHelpIcon = ({ helpText }) => {
    if (!helpText) return null;
    return (
        <Tooltip
            title={<MarkdownTooltip>{helpText}</MarkdownTooltip>}
            placement="right"
            disableFocusListener disableTouchListener enterDelay={10}
            arrow
        >
            <HelpOutlineIcon sx={{ fontSize: '0.9rem', color: '#009da9', marginLeft: '5px', cursor: 'help' }} />
        </Tooltip>
    );
};

const VariableChips = ({ vars, selectedVariable, handleChipClick, stacked }) => (
    <div className="chips-list" style={stacked ? { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' } : undefined}>
        {vars.map(variable => (
            <Chip
                key={variable.id}
                label={renderVariableLabel(variable)}
                clickable
                className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                disabled={!variable.enabled}
                onClick={() => handleChipClick(variable)}
            />
        ))}
    </div>
);

const RequiredCropNote = ({ slug, crops }) => {
    if (!slug) return null;
    const cropName = crops?.find(c => c.id === slug)?.name || slug;
    return (
        <div style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic', marginTop: '0.2rem' }}>
            (only available with the <strong style={{ color: '#aaa' }}>{cropName}</strong> crop type)
        </div>
    );
};

const VariablePanel = ({
    variables,
    selectedVariable,
    setSelectedVariable,
    setActivePanel,
    selectedCropVariable,
    setSelectedCropVariable,
    setLayerName,
    tabConfig,
    crops,
    setSelectedCrop,
}) => {
    const handleClose = () => {
        setActivePanel(null);
    };

    const handleChipClick = (variable) => {
        if (selectedVariable && selectedVariable.id === variable.id) {
            setSelectedVariable(undefined);
        } else {
            if (selectedCropVariable) {
                setLayerName(null);
                setSelectedCropVariable(undefined);
            }
            setSelectedVariable(variable);
            if (variable.required_crop_slug && crops) {
                const requiredCrop = crops.find(c => c.id === variable.required_crop_slug);
                if (requiredCrop) setSelectedCrop(requiredCrop);
            }
            setActivePanel(null);
        }
    };

    const { tieredGroups, flatGroups } = useMemo(() => {
        const tiered = {};
        const flat = {};

        variables.forEach(v => {
            if (v.tier1_group) {
                if (!tiered[v.tier1_group]) {
                    tiered[v.tier1_group] = {
                        helpText: v.tier1_help_text || null,
                        sortOrder: v.tier1_sort_order ?? 0,
                        requiredCropSlug: v.required_crop_slug || null,
                        displayStacked: v.display_stacked || false,
                        tier2s: {},
                        directVars: [],
                    };
                }
                if (!tiered[v.tier1_group].helpText && v.tier1_help_text) {
                    tiered[v.tier1_group].helpText = v.tier1_help_text;
                }

                if (v.group_name) {
                    if (!tiered[v.tier1_group].tier2s[v.group_name]) {
                        tiered[v.tier1_group].tier2s[v.group_name] = {
                            helpText: v.group_help_text || null,
                            sortOrder: v.group_sort_order ?? 0,
                            requiredCropSlug: v.required_crop_slug || null,
                            displayStacked: v.display_stacked || false,
                            vars: [],
                        };
                    }
                    if (!tiered[v.tier1_group].tier2s[v.group_name].helpText && v.group_help_text) {
                        tiered[v.tier1_group].tier2s[v.group_name].helpText = v.group_help_text;
                    }
                    tiered[v.tier1_group].tier2s[v.group_name].vars.push(v);
                } else {
                    tiered[v.tier1_group].directVars.push(v);
                }
            } else {
                const group = v.group_name || 'Other';
                if (!flat[group]) flat[group] = {
                    helpText: v.group_help_text || null,
                    requiredCropSlug: v.required_crop_slug || null,
                    displayStacked: v.display_stacked || false,
                    vars: [],
                };
                if (!flat[group].helpText && v.group_help_text) flat[group].helpText = v.group_help_text;
                flat[group].vars.push(v);
            }
        });

        const sortVars = (vars) => vars.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        Object.values(tiered).forEach(t1 => {
            sortVars(t1.directVars);
            Object.values(t1.tier2s).forEach(t2 => sortVars(t2.vars));
        });
        Object.values(flat).forEach(g => sortVars(g.vars));

        const sortedTiered = Object.entries(tiered)
            .sort(([, a], [, b]) => a.sortOrder - b.sortOrder);

        return { tieredGroups: sortedTiered, flatGroups: Object.entries(flat) };
    }, [variables]);

    return (
        <div className="popup">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PanelTitleWithTooltip title={tabConfig?.label || "Variable"} tooltip={tabConfig?.help_text
                        ? <MarkdownTooltip>{tabConfig.help_text}</MarkdownTooltip>
                        : null} />
                </div>
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
                        onClick={handleClose}
                    />
                </Tooltip>
            </div>

            <>
                {/* Tiered groups: tier1 sections containing tier2 sub-groups */}
                {tieredGroups.map(([tier1Name, tier1Data], idx) => (
                    <div key={tier1Name} style={idx > 0 || flatGroups.length > 0 ? { borderTop: '1px solid #555', marginTop: '0.6rem', paddingTop: '0.4rem' } : undefined}>
                        <div style={{ marginTop: '0.4rem', marginBottom: '0.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                <h4 style={{ margin: 0, color: '#009da9', fontSize: '0.95rem', fontWeight: 500 }}>
                                    <ReactMarkdown components={{ p: ({ children }) => <>{children}</> }}>{brToMarkdown(tier1Name)}</ReactMarkdown>
                                </h4>
                                <GroupHelpIcon helpText={tier1Data.helpText} />
                            </div>
                            {tier1Data.requiredCropSlug && <RequiredCropNote slug={tier1Data.requiredCropSlug} crops={crops} />}
                        </div>

                        {/* Variables directly under tier1 (no tier2 sub-group) */}
                        {tier1Data.directVars.length > 0 && (
                            <VariableChips vars={tier1Data.directVars} selectedVariable={selectedVariable} handleChipClick={handleChipClick} stacked={tier1Data.displayStacked} />
                        )}

                        {/* Tier2 sub-groups */}
                        {Object.entries(tier1Data.tier2s)
                            .sort(([, a], [, b]) => a.sortOrder - b.sortOrder)
                            .map(([t2Name, t2Data]) => (
                                <div className="chips-group" key={t2Name}>
                                    <div style={{ marginTop: '0.6rem', marginBottom: '0.4rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <h5 style={{ margin: 0 }}>
                                                <ReactMarkdown components={{ p: ({ children }) => <>{children}</> }}>{brToMarkdown(t2Name)}</ReactMarkdown>
                                            </h5>
                                            <GroupHelpIcon helpText={t2Data.helpText} />
                                        </div>
                                        {t2Data.requiredCropSlug && !tier1Data.requiredCropSlug && (
                                            <RequiredCropNote slug={t2Data.requiredCropSlug} crops={crops} />
                                        )}
                                    </div>
                                    <VariableChips vars={t2Data.vars} selectedVariable={selectedVariable} handleChipClick={handleChipClick} stacked={t2Data.displayStacked} />
                                </div>
                            ))
                        }
                    </div>
                ))}

                {/* Flat groups: current behaviour for variables without tier1 */}
                {flatGroups.map(([groupName, groupData]) => (
                    <div className="chips-group" key={groupName}>
                        <div style={{ marginTop: '0.6rem', marginBottom: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                <h5 style={{ margin: 0 }}>{groupName}</h5>
                                <GroupHelpIcon helpText={groupData.helpText} />
                            </div>
                            {groupData.requiredCropSlug && <RequiredCropNote slug={groupData.requiredCropSlug} crops={crops} />}
                        </div>
                        <VariableChips vars={groupData.vars} selectedVariable={selectedVariable} handleChipClick={handleChipClick} stacked={groupData.displayStacked} />
                    </div>
                ))}
            </>

        </div>
    );
};

export default VariablePanel;
