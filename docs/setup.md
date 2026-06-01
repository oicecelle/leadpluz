# Guia de Configuração e Instalação — LEADPLUZ

O **LEADPLUZ** é um SaaS completo de prospecção e CRM WhatsApp desenvolvido com monorepo Turborepo, Next.js, Supabase, n8n, Lastlink e Uazapi.

---

## 1. Variáveis de Ambiente (.env)

Crie um arquivo `.env` na raiz de `apps/app` e `apps/web` (ou configure-as na Vercel/provedor de deploy):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vgqwvycmxmlofwepstcd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Tx8t-Bj5QShmfx-KrSaX4A_Qr-lj9oH
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Google Custom Search (Busca de Leads)
GOOGLE_API_KEY=sua_google_api_key
GOOGLE_CSE_ID=seu_google_cse_id

# Uazapi (Instância WhatsApp não oficial)
UAZAPI_BASE_URL=https://sua-uazapi.com
UAZAPI_TOKEN=seu_token_global

# Chatwoot & API Oficial (Meta)
CHATWOOT_BASE_URL=https://seu-chatwoot.com
CHATWOOT_API_ACCESS_TOKEN=seu_chatwoot_access_token

# Gateway de Pagamentos Lastlink
LASTLINK_API_KEY=sua_lastlink_key
LASTLINK_WEBHOOK_SECRET=seu_lastlink_webhook_secret

# E-mails Transacionais Resend
RESEND_API_KEY=sua_resend_api_key
RESEND_FROM_EMAIL=noreply@leadpluz.com

# n8n Automations
N8N_WEBHOOK_BASE_URL=https://seu-n8n.com
N8N_API_KEY=seu_token_n8n
```

---

## 2. Estrutura do Monorepo

- `apps/web/`: Landing page corporativa animada (com Framer Motion e CTAs de checkout/login).
- `apps/app/`: Painel completo do CRM, buscas e módulo administrativo.
- `packages/supabase/`: Client e tipos de dados auto-gerados da estrutura do banco.
- `packages/utils/`: Helpers de formatação e manipulação de strings.
- `packages/ui/`: Biblioteca local de componentes.

---

## 3. Instruções de Desenvolvimento Local

1. Instale as dependências a partir da raiz:
   ```bash
   npm install
   ```

2. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   - O app (CRM/Admin) estará rodando em: `http://localhost:3001`
   - A landing page estará rodando em: `http://localhost:3000`

3. Compile e verifique erros de build:
   ```bash
   npm run build
   ```

---

## 4. Banco de Dados Supabase (vgqwvycmxmlofwepstcd)

O banco de dados do Supabase já está configurado com a estrutura completa e migrada:
- **Tabelas Principais:** `profiles`, `leads_geral`, `user_leads`, `lead_usage_log`, `kanban_columns`, `dispatch_flows`, `dispatch_steps`, `dispatch_jobs`, `dispatch_lead_jobs`, `schedules`, `search_cache`, `coupons`, `support_tickets`, `api_cost_log`.
- **Triggers:** Onboarding automático de novos usuários criando seu perfil e 4 colunas Kanban padrão.
- **Segurança RLS:** Habilitado com políticas restritivas por `auth.uid()`, além de acesso administrativo total para usuários com `is_admin = true`.

---

## 5. Fluxos n8n

Configure as automações do n8n utilizando as rotas e webhooks integrados:
1. **Ativação Lastlink:** Ativa plano, atualiza limite de leads na tabela `profiles`.
2. **Cancelamento Lastlink:** Bloqueia acesso.
3. **Disparos WhatsApp:** Processa disparos consultando a fila `dispatch_lead_jobs` em lote.
4. **Reset Mensal de Leads:** Cron diário para renovar cota de leads.
