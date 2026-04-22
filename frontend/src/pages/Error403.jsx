import React from 'react';
import { Container, Title, Text, Button, Group } from '@mantine/core';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Error403 = () => {
  const navigate = useNavigate();

  return (
    <Container style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
      <Group justify="center" mb="xl">
        <ShieldAlert size={80} color="var(--mantine-color-red-6)" />
      </Group>
      <Title order={1} size="h1" fw={900}>403 - Acesso Negado</Title>
      <Text c="dimmed" size="lg" maw={500} mx="auto" mt="md">
        Desculpe, você não tem as permissões necessárias para acessar esta página. 
        Se você acredita que isso é um erro, entre em contato com o administrador do sistema.
      </Text>
      <Group justify="center" mt="xl">
        <Button variant="light" size="md" onClick={() => navigate('/dashboard')}>
          Voltar ao Início
        </Button>
      </Group>
    </Container>
  );
};

export default Error403;
