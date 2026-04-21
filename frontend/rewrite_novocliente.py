import re

with open('src/pages/NovoCliente.jsx', 'r') as f:
    content = f.read()

# Replace imports
content = content.replace(
    "import { Button, Input, Card, Badge } from '@/components/ui';",
    """import { 
  Button, 
  Card, 
  TextInput, 
  Select, 
  Textarea, 
  Group, 
  ActionIcon, 
  Text, 
  Title, 
  Box, 
  ThemeIcon,
  SimpleGrid,
  Loader,
  Badge,
  Center
} from "@mantine/core";"""
)

# Replace EditableField
editable_field_regex = re.compile(r"const EditableField = \(\{.*?\}\) => \{[\s\S]*?return \([\s\S]*?\);\n  \};")
new_editable_field = """const EditableField = ({ label, value, onChange, type = 'text', fieldKey, placeholder, maxLength, options }) => {
    const isEditable = editableFields[fieldKey];
    const isEmpty = !value || value === '';

    const labelContent = (
      <Group gap="xs" mb={4}>
        <Text span size="sm" fw={700} c="slate.7">{label}</Text>
        {isEmpty && (
          <ActionIcon 
            variant="subtle" 
            size="xs" 
            color="blue"
            onClick={() => toggleEditable(fieldKey)}
            title={isEditable ? 'Preencher campo' : 'Editar campo'}
          >
            <Edit2 size={12} />
          </ActionIcon>
        )}
      </Group>
    );

    if (options) {
      return (
        <Select
          label={labelContent}
          data={options}
          value={value}
          onChange={(val) => onChange(val || '')}
          disabled={!isEditable && isEmpty}
          placeholder={isEditable ? placeholder : ''}
          size="md"
          radius="md"
        />
      );
    }

    if (type === 'textarea') {
      return (
        <Textarea
          label={labelContent}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!isEditable && isEmpty}
          placeholder={isEditable ? placeholder : ''}
          size="md"
          radius="md"
          minRows={3}
        />
      );
    }

    return (
      <TextInput
        type={type === 'date' ? 'date' : 'text'}
        label={labelContent}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        disabled={!isEditable && isEmpty}
        placeholder={isEditable ? placeholder : ''}
        size="md"
        radius="md"
      />
    );
  };"""
content = editable_field_regex.sub(new_editable_field, content)

# Replace standard inputs with TextInput
content = re.sub(
    r'<label className="block text-sm font-bold text-slate-700 mb-1">(.*?)</label>\s*<input\s+type="(.*?)"\s+value=\{(.*?)\}\s+onChange=\{(.*?)\}\s+placeholder="(.*?)"\s+className=".*?"\s*/>',
    r'<TextInput label="\1" type="\2" value={\3} onChange={\4} placeholder="\5" size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />',
    content
)

# Same for inputs with maxLength
content = re.sub(
    r'<label className="block text-sm font-bold text-slate-700 mb-1">(.*?)</label>\s*<input\s+type="(.*?)"\s+value=\{(.*?)\}\s+onChange=\{(.*?)\}\s+placeholder="(.*?)"\s+maxLength=\{(.*?)\}\s+className=".*?"\s*/>',
    r'<TextInput label="\1" type="\2" value={\3} onChange={\4} placeholder="\5" maxLength={\6} size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />',
    content
)

# Select elements replacement
content = re.sub(
    r'<label className="block text-sm font-bold text-slate-700 mb-1">(.*?)</label>\s*<select\s+value=\{(.*?)\}\s+onChange=\{(.*?)\}\s+className=".*?"\s*>\s*(.*?)\s*</select>',
    r'<Select label="\1" value={\2} onChange={(val) => {\3} /* Note: adapt onChange for Select */} data={[\4]} size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />',
    content,
    flags=re.DOTALL
)

with open('src/pages/NovoCliente_updated.jsx', 'w') as f:
    f.write(content)
