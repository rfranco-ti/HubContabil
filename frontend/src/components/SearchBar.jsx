import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  TextInput,
  ScrollArea,
  Stack,
  Text,
  Group,
  UnstyledButton,
  Box,
  Kbd,
} from "@mantine/core";
import { Search, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { menuGroups } from "../data/menuConfig";

export function SearchBar({ opened, onClose }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const allItems = useMemo(() => {
    const items = [];
    menuGroups.forEach((group) => {
      group.items.forEach((item) => {
        items.push({ ...item, group: group.label });
        if (item.submenu) {
          item.submenu.forEach((sub) => {
            items.push({ ...sub, group: `${group.label} > ${item.text}` });
          });
        }
      });
    });
    return items;
  }, []);

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    const normalizedQuery = query.toLowerCase().trim();
    return allItems.filter(
      (item) =>
        item.text.toLowerCase().includes(normalizedQuery) ||
        item.group.toLowerCase().includes(normalizedQuery)
    );
  }, [query, allItems]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
    setQuery("");
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size="lg"
      padding={0}
      radius="lg"
    >
      <Box p="md">
        <TextInput
          placeholder="Pesquisar ferramentas, robôs ou clientes..."
          leftSection={<Search size={18} />}
          rightSection={<Kbd size="xs">ESC</Kbd>}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="md"
          autoFocus
          styles={{
            input: {
              border: "none",
              backgroundColor: "var(--mantine-color-gray-1)",
            },
          }}
        />
      </Box>

      <ScrollArea.Autosize mah={400} type="auto">
        <Box px="md" pb="md">
          {query.trim() === "" ? (
            <Box py="xl" ta="center">
              <Text c="dimmed" size="sm">
                Digite algo para começar a pesquisar...
              </Text>
            </Box>
          ) : filteredResults.length === 0 ? (
            <Box py="xl" ta="center">
              <Text c="dimmed" size="sm">
                Nenhum resultado encontrado para "{query}"
              </Text>
            </Box>
          ) : (
            <Stack gap={4}>
              {filteredResults.map((result, index) => (
                <UnstyledButton
                  key={`${result.path}-${index}`}
                  onClick={() => handleSelect(result.path)}
                  p="sm"
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                    backgroundColor: "hover: var(--mantine-color-gray-1)",
                  }}
                  className="search-result-item"
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm">
                      <result.icon size={18} color="var(--mantine-color-blue-5)" />
                      <Box>
                        <Text size="sm" fw={600}>
                          {result.text}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {result.group}
                        </Text>
                      </Box>
                    </Group>
                    <ChevronRight size={14} color="var(--mantine-color-gray-4)" />
                  </Group>
                </UnstyledButton>
              ))}
            </Stack>
          )}
        </Box>
      </ScrollArea.Autosize>
    </Modal>
  );
}
