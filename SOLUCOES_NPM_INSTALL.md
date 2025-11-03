# 🚨 ERRO NPM INSTALL - PROBLEMAS IDENTIFICADOS

## ❌ Problemas Encontrados:

### 1. **Versão do Node.js Incompatível:**
- **Atual**: v18.19.0 
- **Necessário**: v20+ (para @google/genai e vite)

### 2. **Permissões - Tentando instalar globalmente:**
- **Erro**: `mkdir '/usr/local/lib/node_modules/padoka-delivery-pwa'`
- **Causa**: Tentando instalar como global quando deveria ser local

## ⚡ SOLUÇÕES:

### 🥇 **SOLUÇÃO 1: Instalar Localmente**
```bash
# Ir ao diretório do projeto
cd padoka-delivery

# Instalar sem --global
npm install

# Ou forçar instalação local
npm install --no-save
```

### 🥈 **SOLUÇÃO 2: Verificar o comando usado**
```bash
# Se está usando install global, remova o -g
npm uninstall -g padoka-delivery-pwa
npm install
```

### 🥉 **SOLUÇÃO 3: Limpar cache e reinstalar**
```bash
# Limpar cache
npm cache clean --force

# Remover node_modules se existir
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

### 🎯 **SOLUÇÃO 4: Usar yarn (alternativa)**
```bash
# Instalar yarn
npm install -g yarn

# Instalar dependências com yarn
yarn install
```

### 🚨 **SOLUÇÃO 5: Atualizar package.json**
Se não puder atualizar Node.js, crie versão compatível: