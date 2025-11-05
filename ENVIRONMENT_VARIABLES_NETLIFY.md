# Environment Variables para Netlify - Padoka Bakery

## Configuração das Environment Variables no Netlify

Vá em **Netlify → Site Settings → Environment Variables** e adicione estas 3 variáveis:

### 1. VITE_SUPABASE_URL
```
https://ywpazjaaqavjcdonlnzs.supabase.co
```

### 2. VITE_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs
```

### 3. NODE_VERSION
```
18
```

## Build Settings (Site Settings → Build & deploy)

### Configurações corretas:
- **Base directory**: (deixe VAZIO - não coloque nada)
- **Build command**: `npm run build`
- **Publish directory**: `dist`

## Depois de configurar:

1. Vá em **Deploys** no Netlify
2. Clique em **Trigger deploy**
3. Escolha **Deploy site**
4. Aguarde o build e me envie o **Deploy log** completo

## Observações importantes:

- ✅ Use exatamente os nomes das variáveis com `VITE_` no início
- ✅ Certifique-se que não há espaços antes/depois dos valores
- ✅ A configuração de build deve apontar para a pasta `dist` (pasta de build do Vite)
- ✅ Base directory deve estar vazio para projetos na raiz do repositório

## Se ainda falhar:

Me envie o **Deploy log completo** para eu analisar o erro específico!