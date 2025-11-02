#!/usr/bin/env python3
import subprocess
from pathlib import Path

def generate_icons():
    """Gerar ícones PWA usando ImageMagick"""
    print("🎨 Gerando ícones PWA...")
    
    public_dir = Path("/workspace/public")
    public_dir.mkdir(exist_ok=True)
    
    # Tamanhos necessários
    sizes = [64, 192, 512]
    
    for size in sizes:
        output_path = public_dir / f"pwa-{size}x{size}.png"
        print(f"📱 Criando ícone {size}x{size}...")
        
        try:
            # Criar ícone colorido com letra P
            subprocess.run([
                'convert',
                '-size', f'{size}x{size}',
                'xc:none',
                '-fill', '#F9B400',  # Cor amarela do Padoka
                '-draw', f'circle {size//2},{size//2} {size//2},{size//20}',
                '-fill', '#6B522A',  # Cor marrom do texto
                '-pointsize', str(size//3),
                '-gravity', 'center',
                '-font', 'Arial-Bold',
                '-annotate', '+0+0', 'P',
                str(output_path)
            ], check=True, capture_output=True)
            print(f"  ✅ Criado: {output_path}")
        except subprocess.CalledProcessError as e:
            print(f"  ❌ Erro ao criar {size}x{size}: {e}")
    
    # Criar ícone maskable (cópia do 512x512)
    try:
        subprocess.run([
            'cp', 
            str(public_dir / "pwa-512x512.png"), 
            str(public_dir / "maskable-icon-512x512.png")
        ], check=True)
        print("✅ Criado ícone maskable")
    except subprocess.CalledProcessError:
        print("❌ Falhou ao criar ícone maskable")
    
    # Criar favicon
    try:
        subprocess.run([
            'convert', 
            str(public_dir / "pwa-64x64.png"), 
            '-resize', '32x32', 
            str(public_dir / "favicon.ico")
        ], check=True, capture_output=True)
        print("✅ Criado favicon.ico")
    except subprocess.CalledProcessError:
        print("❌ Falhou ao criar favicon")
    
    print("🎉 Ícones PWA gerados com sucesso!")

if __name__ == "__main__":
    generate_icons()