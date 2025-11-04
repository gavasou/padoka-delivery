import { build } from 'vite';

async function buildProject() {
  try {
    console.log('🔨 Iniciando build do projeto...');
    const result = await build();
    console.log('✅ Build concluído com sucesso!');
    console.log(`📦 Arquivos gerados em: ${result.output?.map(file => file.name).join(', ')}`);
  } catch (error) {
    console.error('❌ Erro durante o build:', error);
    process.exit(1);
  }
}

buildProject();