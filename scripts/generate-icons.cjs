// Script para gerar ícones PNG a partir do SVG
// Este script cria ícones básicos para o PWA

const fs = require('fs');
const path = require('path');

// Função para criar um ícone PNG simples (placeholder)
function createIconPNG(size) {
  // Para este exemplo, vamos criar um arquivo SVG que será usado como ícone
  const svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="scissorsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#EAB308;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#F59E0B;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1F2937;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#111827;stop-opacity:1" />
      </linearGradient>
    </defs>
    
    <!-- Background circle -->
    <circle cx="256" cy="256" r="240" fill="url(#backgroundGradient)" stroke="#374151" stroke-width="8"/>
    
    <!-- Scissors handle 1 -->
    <path d="M 120 200 Q 140 180 160 200 L 180 220 Q 160 240 140 220 Z" fill="url(#scissorsGradient)" stroke="#D97706" stroke-width="2"/>
    
    <!-- Scissors handle 2 -->
    <path d="M 120 312 Q 140 332 160 312 L 180 292 Q 160 272 140 292 Z" fill="url(#scissorsGradient)" stroke="#D97706" stroke-width="2"/>
    
    <!-- Scissors blade 1 -->
    <path d="M 180 220 L 320 120 Q 340 140 320 160 L 200 240 Z" fill="#F3F4F6" stroke="#9CA3AF" stroke-width="2"/>
    
    <!-- Scissors blade 2 -->
    <path d="M 180 292 L 320 392 Q 340 372 320 352 L 200 272 Z" fill="#F3F4F6" stroke="#9CA3AF" stroke-width="2"/>
    
    <!-- Scissors pivot -->
    <circle cx="200" cy="256" r="12" fill="#6B7280" stroke="#374151" stroke-width="2"/>
    
    <!-- Handle holes -->
    <circle cx="140" cy="210" r="8" fill="#1F2937"/>
    <circle cx="140" cy="302" r="8" fill="#1F2937"/>
    
    <!-- Decorative elements -->
    <circle cx="256" cy="100" r="4" fill="#EAB308" opacity="0.8"/>
    <circle cx="356" cy="156" r="3" fill="#EAB308" opacity="0.6"/>
    <circle cx="156" cy="356" r="3" fill="#EAB308" opacity="0.6"/>
    <circle cx="256" cy="412" r="4" fill="#EAB308" opacity="0.8"/>
  </svg>`;

  return svgContent;
}

// Tamanhos de ícones necessários
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Criar diretório de ícones se não existir
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Gerar ícones SVG para cada tamanho
iconSizes.forEach(size => {
  const svgContent = createIconPNG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Ícone ${filename} criado`);
});

// Criar ícones de atalho
const shortcutBookSvg = `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" rx="16" fill="#EAB308"/>
  <path d="M 24 30 Q 30 24 36 30 L 60 30 Q 66 24 72 30 L 72 66 Q 66 72 60 66 L 36 66 Q 30 72 24 66 Z" fill="#1F2937"/>
  <path d="M 30 36 L 66 36 L 66 60 L 30 60 Z" fill="#EAB308"/>
  <text x="48" y="52" text-anchor="middle" fill="#1F2937" font-family="Arial" font-size="12" font-weight="bold">📅</text>
</svg>`;

const shortcutBookingsSvg = `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" rx="16" fill="#EAB308"/>
  <path d="M 24 30 Q 30 24 36 30 L 60 30 Q 66 24 72 30 L 72 66 Q 66 72 60 66 L 36 66 Q 30 72 24 66 Z" fill="#1F2937"/>
  <path d="M 30 36 L 66 36 L 66 60 L 30 60 Z" fill="#EAB308"/>
  <text x="48" y="52" text-anchor="middle" fill="#1F2937" font-family="Arial" font-size="12" font-weight="bold">📋</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'shortcut-book.svg'), shortcutBookSvg);
fs.writeFileSync(path.join(iconsDir, 'shortcut-bookings.svg'), shortcutBookingsSvg);

console.log('✅ Ícones de atalho criados');
console.log('🎉 Todos os ícones foram gerados com sucesso!');
console.log('📝 Nota: Para produção, converta os arquivos SVG para PNG usando ferramentas como ImageMagick ou online converters.');
