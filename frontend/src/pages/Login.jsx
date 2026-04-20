import { useState } from "react";
import { LogIn, Building2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { setTokens } from "../utils/auth";
import { 
  TextInput, 
  PasswordInput, 
  Checkbox, 
  Paper, 
  Title, 
  Text, 
  Container, 
  Button, 
  Box, 
  Center, 
  Alert,
  Group
} from "@mantine/core";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("[LOGIN] Enviando request para:", email);
      const response = await authAPI.login(email, senha);
      console.log("[LOGIN] Response:", response.data);

      const {
        accessToken,
        refreshToken,
        nome,
        email: userEmail,
        cargo,
      } = response.data;

      if (!accessToken) {
        console.error("[LOGIN] No accessToken in response:", response.data);
        setError("Erro interno: token não recebido");
        return;
      }

      setTokens(accessToken, refreshToken);
      localStorage.setItem(
        "user",
        JSON.stringify({ nome, email: userEmail, cargo }),
      );

      console.log("[LOGIN] Tokens saved, navigating to dashboard");
      navigate("/dashboard");
    } catch (err) {
      console.error("[LOGIN] Error:", err);
      console.error("[LOGIN] Response data:", err.response?.data);
      const errorMessage =
        err.response?.data?.message ||
        "Erro ao fazer login. Verifique suas credenciais.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      style={{ 
        minHeight: '100vh', 
        backgroundColor: 'var(--mantine-color-gray-0)', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center' 
      }}
      className="dark:bg-slate-950 font-sans"
    >
      <Container size="xs" w="100%" px="md">
        <Center mb="xl">
          <Box 
            style={{ 
              width: 64, 
              height: 64, 
              backgroundColor: 'var(--mantine-color-blue-6)', 
              borderRadius: 16, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              boxShadow: 'var(--mantine-shadow-md)' 
            }}
          >
            <Building2 color="white" size={32} />
          </Box>
        </Center>
        
        <Title ta="center" fw={900} order={2} className="dark:text-white">
          Hub Contábil
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5} mb={30}>
          Acesse sua central de gestão empresarial
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="lg" pos="relative" style={{ overflow: 'hidden' }} className="dark:bg-slate-900 dark:border-slate-800">
          <Box 
            pos="absolute" 
            top={0} 
            right={0} 
            w={128} 
            h={128} 
            bg="blue.0" 
            style={{ borderBottomLeftRadius: '100%', zIndex: 0, opacity: 0.5 }} 
            className="dark:bg-blue-900/20" 
          />
          
          <Box pos="relative" style={{ zIndex: 1 }}>
            {error && (
              <Alert icon={<AlertCircle size={16} />} title="Erro no login" color="red" variant="light" mb="lg" radius="md">
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <TextInput
                label="Endereço de E-mail"
                placeholder="contador@escritorio.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="md"
                radius="md"
                mb="md"
                styles={{ label: { marginBottom: 6, fontWeight: 600 } }}
              />

              <PasswordInput
                label="Senha"
                placeholder="Digite sua senha"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                size="md"
                radius="md"
                mb="md"
                styles={{ label: { marginBottom: 6, fontWeight: 600 } }}
              />

              <Group justify="space-between" mb="xl">
                <Checkbox label="Lembrar de mim" size="sm" />
              </Group>

              <Button 
                fullWidth 
                size="md" 
                radius="md" 
                type="submit" 
                loading={loading}
                leftSection={!loading && <LogIn size={18} />}
                styles={{
                  root: { transition: 'all 0.2s ease', '&:hover': { boxShadow: 'var(--mantine-shadow-md)' } }
                }}
              >
                Entrar no Sistema
              </Button>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
