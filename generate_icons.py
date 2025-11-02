#!/usr/bin/env python3
import os
import subprocess
from pathlib import Path

# Tamanhos de ícones necessários para PWA
icon_sizes = [
    (64, 64),
    (192, 192),
    (512, 512)
]

# Criar diretório público se não existir
public_dir = Path("/workspace/public")
public_dir.mkdir(exist_ok=True)

# Ícone SVG base
svg_icon = public_dir / "icon.svg"

def create_png_with_inkscape(svg_path, output_path, width, height):
    """Criar PNG usando Inkscape se disponível"""
    try:
        subprocess.run([
            'inkscape',
            str(svg_path),
            '--export-type=png',
            f'--export-filename={output_path}',
            f'--export-width={width}',
            f'--export-height={height}'
        ], check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def create_png_with_convert(svg_path, output_path, width, height):
    """Criar PNG usando ImageMagick convert"""
    try:
        subprocess.run([
            'convert',
            '-background', 'none',
            '-size', f'{width}x{height}',
            str(svg_path),
            str(output_path)
        ], check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def create_fallback_icon(output_path, width, height, color="#F9B400"):
    """Criar ícone simples usando ImageMagick quando SVG não funciona"""
    try:
        # Criar círculo colorido com letra P
        subprocess.run([
            'convert',
            '-size', f'{width}x{height}',
            'xc:none',
            '-fill', color,
            '-draw', f'circle {width//2},{height//2} {width//2},{width//20}',
            '-fill', '#6B522A',
            '-pointsize', str(width//3),
            '-gravity', 'center',
            '-annotate', '+0+0', 'P',
            str(output_path)
        ], check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def generate_icons():
    """Gerar todos os ícones PWA"""
    print("🎨 Gerando ícones PWA...")
    
    for width, height in icon_sizes:
        output_path = public_dir / f"pwa-{width}x{height}.png"
        
        print(f"📱 Criando ícone {width}x{height}...")
        
        # Tentar diferentes métodos
        success = False
        
        if svg_icon.exists():
            # Método 1: Inkscape
            if create_png_with_inkscape(svg_icon, output_path, width, height):
                print(f"  ✅ Criado com Inkscape: {output_path}")
                success = True
            # Método 2: ImageMagick convert
            elif create_png_with_convert(svg_icon, output_path, width, height):
                print(f"  ✅ Criado com ImageMagick: {output_path}")
                success = True
        
        # Método 3: Fallback - ícone simples
        if not success:
            if create_fallback_icon(output_path, width, height):
                print(f"  ✅ Criado ícone fallback: {output_path}")
                success = True
        
        if not success:
            print(f"  ❌ Falhou ao criar ícone {width}x{height}")
    
    # Criar ícone maskable (mesmo que o 512x512)
    maskable_path = public_dir / "maskable-icon-512x512.png"
    original_512 = public_dir / "pwa-512x512.png"
    
    if original_512.exists():
        try:
            subprocess.run(['cp', str(original_512), str(maskable_path)], check=True)
            print(f"✅ Criado ícone maskable: {maskable_path}")
        except subprocess.CalledProcessError:
            print("❌ Falhou ao criar ícone maskable")
    
    # Criar favicon
    favicon_path = public_dir / "favicon.ico"
    icon_32 = public_dir / "pwa-64x64.png"  # Usar 64x64 para favicon
    
    if icon_32.exists():
        try:
            subprocess.run([
                'convert', str(icon_32), '-resize', '32x32', str(favicon_path)
            ], check=True, capture_output=True)
            print(f"✅ Criado favicon: {favicon_path}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Falhou ao criar favicon")
    
    print("🎉 Geração de ícones concluída!")

if __name__ == "__main__":
    generate_icons()