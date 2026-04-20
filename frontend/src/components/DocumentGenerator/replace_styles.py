import re

# Read the file
with open('DocumentGenerator.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace inline styles with CSS classes
replacements = {
    'style={containerStyle}': 'className="dg-container"',
    'style={toolbarStyle}': 'className="dg-toolbar"',
    'style={toolbarLeftStyle}': 'className="dg-toolbar__left"',
    'style={toolbarButtonStyle}': 'className="dg-toolbar__button"',
    'style={toolbarTitleStyle}': 'className="dg-toolbar__title"',
    'style={toolbarRightStyle}': 'className="dg-toolbar__right"',
    'style={toolbarIconButtonStyle}': 'className="dg-toolbar__icon-button"',
    'style={contentStyle}': 'className="dg-content"',
    'style={selectorContainerStyle}': 'className="dg-selector"',
    'style={selectorTitleStyle}': 'className="dg-selector__title"',
    'style={gridStyle}': 'className="dg-grid"',
    'style={cardStyle}': 'className="dg-card"',
    'style={cardIconStyle}': 'className="dg-card__icon"',
    'style={cardTextStyle}': 'className="dg-card__text"',
    'style={editorLayoutStyle}': 'className="dg-editor-layout"',
    'style={formSectionStyle}': 'className="dg-form-section"',
    'style={previewSectionStyle}': 'className="dg-preview-section"',
    'style={sectionHeaderStyle}': 'className="dg-section-header"',
    'style={sectionHeaderLeftStyle}': 'className="dg-section-header__left"',
    'style={sectionCountStyle}': 'className="dg-section-count"',
    'style={formContentStyle}': 'className="dg-form-content"',
    'style={clientSelectorStyle}': 'className="dg-client-selector"',
    'style={clientSelectorLabelStyle}': 'className="dg-client-selector__label"',
    'style={selectStyle}': 'className="dg-select"',
    'style={actionButtonsStyle}': 'className="dg-action-buttons"',
    'style={primaryButtonStyle}': 'className="dg-primary-button"',
    'style={formScrollStyle}': 'className="dg-form-scroll"',
    'style={previewContentStyle}': 'className="dg-preview-content"',
    'style={historyPanelStyle}': 'className="dg-history-panel"',
    'style={historyHeaderStyle}': 'className="dg-history-header"',
    'style={historyTitleStyle}': 'className="dg-history-title"',
    'style={historyListStyle}': 'className="dg-history-list"',
    'style={historyEmptyStyle}': 'className="dg-history-empty"',
    'style={historyItemStyle}': 'className="dg-history-item"',
    'style={historyItemInfoStyle}': 'className="dg-history-item__info"',
    'style={historyItemTypeStyle}': 'className="dg-history-item__type"',
    'style={historyItemDateStyle}': 'className="dg-history-item__date"',
    'style={historyItemClientStyle}': 'className="dg-history-item__client"',
    'style={historyViewButtonStyle}': 'className="dg-history-view-button"',
    'style={iconButtonStyle}': 'className="dg-toolbar__icon-button"',
}

# Apply replacements
for old, new in replacements.items():
    content = content.replace(old, new)

# Remove inline style for dynamic classes
content = re.sub(
    r'style=\{\.\.\.\s*toolbarIconButtonStyle,\s*backgroundColor:\s*showHistory\s*\?\s*\'#e0e7ff\'\s*:\s*\'transparent\',\s*color:\s*showHistory\s*\?\s*\'#4338ca\'\s*:\s*\'#666\'\s*\}',
    'className={`dg-toolbar__icon-button ${showHistory ? \'dg-toolbar__icon-button--active\' : \'\'}`}',
    content
)

content = re.sub(
    r'style=\{\.\.\.\s*primaryButtonStyle,\s*backgroundColor:\s*isSaving\s*\?\s*\'#9ca3af\'\s*:\s*\'#059669\',\s*cursor:\s*isSaving\s*\?\s*\'not-allowed\'\s*:\s*\'pointer\'\s*\}',
    'className={`dg-primary-button dg-primary-button--success ${isSaving ? \'dg-primary-button--disabled\' : \'\'}`}\n                    disabled={isSaving}',
    content
)

# Write the file
with open('DocumentGenerator.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS classes replaced successfully!")
