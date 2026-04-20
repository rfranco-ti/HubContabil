import { test, expect } from '@playwright/test';

/**
 * Testes E2E para navegação principal
 * URLs: /dashboard, /clientes, /calendario
 */

test.describe('Navegação Principal', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para home (pode exigir login)
    await page.goto('/');
  });

  test('deve carregar dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verificar título da página
    const title = await page.title();
    expect(title).toContain('Dashboard');
    
    // Verificar se cards de estatísticas estão presentes
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('deve navegar para clientes', async ({ page }) => {
    await page.goto('/clientes');
    
    // Verificar título
    await expect(page.locator('text=Clientes')).toBeVisible();
    
    // Verificar botão de novo cliente
    await expect(page.locator('text=Novo Cliente, text=Adicionar')).toBeVisible({ timeout: 5000 });
  });

  test('deve navegar para calendário', async ({ page }) => {
    await page.goto('/calendario');
    
    // Verificar calendário
    await expect(page.locator('.fc')).toBeVisible({ timeout: 5000 });
  });
});
