#!/usr/bin/env node

/**
 * Padoka PWA - SEO & Meta Tags Optimizer
 * Gera meta tags otimizadas para produção
 */

const fs = require('fs');
const path = require('path');

const seoConfig = {
  title: "Padoka - Delivery de Pães Artesanais",
  description: "Assinaturas de padarias artesanais com delivery diário. Pães frescos, croissants e doces direto da padaria para sua mesa. Cadastre-se e receba seus pães favoritos todos os dias.",
  keywords: [
    "delivery de pães",
    "padaria artesanal", 
    "assinatura pães",
    "pães frescos",
    "delivery diário",
    "padaria online",
    "croissants",
    "doces artesanais",
    "pão francês",
    "entrega diária"
  ].join(", "),
  author: "Padoka",
  url: "https://padoka.vercel.app",
  image: "/pwa-512x512.png",
  locale: "pt_BR",
  siteName: "Padoka",
  twitterHandle: "@padoka",
  facebookAppId: "",
  themeColor: "#F9B400",
  backgroundColor: "#FFF9EF"
};

const robotsContent = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/internal/

# Sitemap
Sitemap: ${seoConfig.url}/sitemap.xml

# Crawl delay
Crawl-delay: 1`;

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${seoConfig.url}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${seoConfig.url}/dashboard</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${seoConfig.url}/location</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

// Gerar meta tags para inserir no index.html
const generateMetaTags = () => {
  return `
    <!-- SEO Meta Tags -->
    <meta name="description" content="${seoConfig.description}" />
    <meta name="keywords" content="${seoConfig.keywords}" />
    <meta name="author" content="${seoConfig.author}" />
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index, follow" />
    <link rel="canonical" href="${seoConfig.url}" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${seoConfig.title}" />
    <meta property="og:description" content="${seoConfig.description}" />
    <meta property="og:image" content="${seoConfig.url}${seoConfig.image}" />
    <meta property="og:url" content="${seoConfig.url}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="${seoConfig.locale}" />
    <meta property="og:site_name" content="${seoConfig.siteName}" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="${seoConfig.twitterHandle}" />
    <meta name="twitter:title" content="${seoConfig.title}" />
    <meta name="twitter:description" content="${seoConfig.description}" />
    <meta name="twitter:image" content="${seoConfig.url}${seoConfig.image}" />
    
    <!-- Additional Meta Tags -->
    <meta name="application-name" content="${seoConfig.siteName}" />
    <meta name="msapplication-TileColor" content="${seoConfig.themeColor}" />
    <meta name="msapplication-config" content="/browserconfig.xml" />
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "${seoConfig.siteName}",
      "description": "${seoConfig.description}",
      "url": "${seoConfig.url}",
      "logo": "${seoConfig.url}${seoConfig.image}",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+55-11-99999-9999",
        "contactType": "customer service"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "São Paulo",
        "addressRegion": "SP",
        "addressCountry": "BR"
      },
      "openingHours": "Mo-Su 06:00-22:00",
      "servesCuisine": "Padaria Artesanal",
      "paymentAccepted": "Credit Card, Debit Card, PIX",
      "priceRange": "$$"
    }
    </script>`;
};

// Criar arquivos de SEO
const createSEOFiles = () => {
  const publicDir = path.join(__dirname, 'public');
  
  // Criar robots.txt
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent);
  console.log('✅ robots.txt criado');
  
  // Criar sitemap.xml
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
  console.log('✅ sitemap.xml criado');
  
  // Criar browserconfig.xml para Windows tiles
  const browserconfigContent = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/pwa-192x192.png"/>
            <TileColor>${seoConfig.themeColor}</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;
  
  fs.writeFileSync(path.join(publicDir, 'browserconfig.xml'), browserconfigContent);
  console.log('✅ browserconfig.xml criado');
  
  // Gerar meta tags para copiar para index.html
  const metaTags = generateMetaTags();
  fs.writeFileSync(path.join(__dirname, 'meta-tags.html'), metaTags);
  console.log('✅ meta-tags.html gerado');
  
  console.log('\n📋 Para completar a otimização SEO:');
  console.log('1. Copie o conteúdo de meta-tags.html para index.html');
  console.log('2. Configure Google Search Console');
  console.log('3. Configure Google Analytics');
  console.log('4. Submeta sitemap.xml ao Google');
};

// Verificar estrutura de arquivos para SEO
const checkSEOStructure = () => {
  const checks = [
    { file: 'public/robots.txt', name: 'robots.txt' },
    { file: 'public/sitemap.xml', name: 'sitemap.xml' },
    { file: 'public/pwa-192x192.png', name: 'PWA icon 192x192' },
    { file: 'public/pwa-512x512.png', name: 'PWA icon 512x512' },
    { file: 'public/manifest.webmanifest', name: 'PWA manifest' }
  ];
  
  console.log('🔍 Verificando estrutura SEO...\n');
  
  checks.forEach(check => {
    const exists = fs.existsSync(check.file);
    console.log(`${exists ? '✅' : '❌'} ${check.name}`);
  });
  
  console.log('\n📊 SEO Score estimado:');
  const score = checks.filter(check => fs.existsSync(check.file)).length;
  console.log(`${score}/${checks.length} (${Math.round(score/checks.length*100)}%)`);
};

// Executar baseado em argumentos
const command = process.argv[2];

switch(command) {
  case 'generate':
    createSEOFiles();
    break;
  case 'check':
    checkSEOStructure();
    break;
  case 'meta':
    console.log(generateMetaTags());
    break;
  default:
    console.log('Padoka PWA - SEO Optimizer');
    console.log('');
    console.log('Comandos disponíveis:');
    console.log('  generate  - Gerar arquivos SEO (robots.txt, sitemap.xml)');
    console.log('  check     - Verificar estrutura SEO');
    console.log('  meta      - Gerar meta tags para HTML');
    console.log('');
    console.log('Exemplo: node seo-optimizer.js generate');
}

module.exports = { seoConfig, generateMetaTags };