import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('interface completa de eventos, certificados e resumo', async ({ page }) => {
  await mkdir('docs/evidence', { recursive: true });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByText('Horas certificadas', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'docs/evidence/frontend-local.png', fullPage: true });
  await page.getByRole('button', { name: 'Agenda', exact: true }).click();
  await page.getByRole('button', { name: '+ Novo evento', exact: true }).click();
  const eventForm = page.getByRole('dialog');
  for (const [label, value] of [['Título do evento', 'Teste navegador'], ['Organização', 'Grupo PJBL'], ['Data', '26 de outubro'], ['Horário', '19:00'], ['Local', 'Campus'], ['Vagas totais', '10']]) await eventForm.getByLabel(label, { exact: true }).fill(value);
  await eventForm.getByRole('button', { name: 'Cadastrar evento', exact: true }).click();
  let card = page.locator('article').filter({ hasText: 'Teste navegador' });
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Título do evento', { exact: true }).fill('Teste atualizado');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  card = page.locator('article').filter({ hasText: 'Teste atualizado' });
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Excluir', exact: true }).click();
  await card.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await expect(card).toHaveCount(0);
  await page.getByRole('button', { name: 'Certificados', exact: true }).click();
  await page.getByRole('button', { name: 'Novo certificado', exact: true }).click();
  const form = page.getByRole('dialog');
  for (const [label, value] of [['Evento', 'Certificado navegador'], ['Participante', 'Participante de teste'], ['Carga horária', '8'], ['Conclusão', '2026-10-26']]) await form.getByLabel(label, { exact: true }).fill(value);
  await form.getByRole('button', { name: 'Salvar', exact: true }).click();
  card = page.locator('article').filter({ hasText: 'Certificado navegador' });
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Carga horária', { exact: true }).fill('12');
  await page.getByRole('dialog').getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(card.getByText('12 horas, 2026-10-26', { exact: true })).toBeVisible();
  const download = page.waitForEvent('download');
  await card.getByRole('button', { name: 'Baixar certificado', exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/^certificado-.*\.txt$/);
  await expect(card.getByText('Emitido', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'docs/evidence/certificados-local.png', fullPage: true });
  await card.getByRole('button', { name: 'Excluir', exact: true }).click();
  await card.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await expect(card).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('Swagger BFF e microserviços acessíveis pelo BFF', async ({ page }) => {
  for (const [name, path, title] of [
    ['bff', '/api/docs/', 'ConectaCampus BFF'],
    ['eventos', '/api/docs/?url=/api/specs/eventos', 'ConectaCampus Eventos MongoDB'],
    ['certificados', '/api/docs/?url=/api/specs/certificados', 'ConectaCampus Certificados Azure SQL']
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: new RegExp(title) })).toBeVisible();
    await page.screenshot({ path: `docs/evidence/swagger-${name}-local.png`, fullPage: true });
  }
});

test('resumo funciona no celular sem rolagem horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByText('Horas certificadas', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'docs/evidence/mobile-local.png', fullPage: true });
});
