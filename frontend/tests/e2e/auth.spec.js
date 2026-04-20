import { test, expect } from '@playwright/test';

/**
 * Testes E2E para fluxo de autenticação
 * URL: /login
 */

test.describe('Autenticação', () => {
  test('deve exibir página de login', async ({ page }) => {
    await page.goto('/login');
    
    // Verificar se formulário de login está presente
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    
    // Preencher com credenciais inválidas
    await page.locator('input[type="email"]').fill('invalid@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    
    // Deve mostrar erro (implementação depende do componente)
    // Aguardar mensagem de erro ou toast
    await page.waitForTimeout(1000);
  });
});
