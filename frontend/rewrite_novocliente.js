const fs = require('fs');
let code = fs.readFileSync('src/pages/NovoCliente.jsx', 'utf8');

// Replace imports
code = code.replace(
  "import { Button, Input, Card, Badge } from '@/components/ui';",
  `import { 
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
} from "@mantine/core";`
);

// Replace EditableField
code = code.replace(
  /const EditableField = \(\{.*?\}\) => \{[\s\S]*?return \([\s\S]*?\);\n  \};/,
  `const EditableField = ({ label, value, onChange, type = 'text', fieldKey, placeholder, maxLength, options }) => {
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
  };`
);

// Replace CNPJ Input
code = code.replace(
  /<label className="block text-sm font-bold text-slate-700 mb-1">CNPJ \*<\/label>[\s\S]*?<div className="relative">[\s\S]*?<input[\s\S]*?\/>[\s\S]*?\{lastApiUsed && formData\.cnpj\.replace\(\/\\D\/g, ''\)\.length === 14 && \([\s\S]*?\)\]\}[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/, // This regex is too brittle.
  ''
);

// We will do a full AST or regex replace but full rewrite is better.
