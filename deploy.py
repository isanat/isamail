#!/usr/bin/env python3
import paramiko
import sys
import time

# VPS Connection Details
HOST = "207.180.209.114"
USER = "root"
PASSWORD = "@!Isa46936698"
APP_DIR = "/var/www/isamail"

def run_command(ssh, command, show_output=True, timeout=300):
    """Run a command on the remote server"""
    print(f"  → Executando: {command}")
    stdin, stdout, stderr = ssh.exec_command(command, timeout=timeout)
    
    # Wait for command to complete
    exit_code = stdout.channel.recv_exit_status()
    output = stdout.read().decode()
    error = stderr.read().decode()
    
    if show_output and output:
        print(output)
    if error and "warning" not in error.lower() and "npm warn" not in error.lower():
        print(f"  ⚠️  {error}")
    
    return exit_code, output, error

def main():
    print(f"\n{'='*60}")
    print(f"🚀 DEPLOY ISAMAIL - Painel Administrativo")
    print(f"{'='*60}\n")
    
    print(f"🔌 Conectando ao VPS {HOST}...")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30, allow_agent=False, look_for_keys=False)
        print("✅ Conectado com sucesso!\n")
        
        # Check where bun or npm is
        print("🔍 Verificando ambiente...")
        _, npm_path, _ = run_command(ssh, "which npm", show_output=False)
        npm_path = npm_path.strip() or "/usr/bin/npm"
        print(f"   NPM encontrado em: {npm_path}")
        
        # Source bashrc to get bun in path
        source_cmd = "source ~/.bashrc 2>/dev/null || true; "
        
        # Check if directory exists
        print("\n📁 Verificando diretório da aplicação...")
        run_command(ssh, f"ls -la {APP_DIR} | head -20")
        
        # Navigate to app directory and pull changes
        print("\n📥 Puxando atualizações do GitHub...")
        run_command(ssh, f"cd {APP_DIR} && git pull origin main")
        
        # Install dependencies using npm
        print("\n📦 Instalando dependências...")
        run_command(ssh, f"cd {APP_DIR} && {npm_path} install", timeout=300)
        
        # Update database schema
        print("\n🗄️ Atualizando schema do banco de dados...")
        run_command(ssh, f"cd {APP_DIR} && {npm_path} run db:push", timeout=120)
        
        # Build the application
        print("\n🔨 Compilando aplicação...")
        run_command(ssh, f"cd {APP_DIR} && {npm_path} run build", timeout=300)
        
        # Restart PM2
        print("\n🔄 Reiniciando PM2...")
        run_command(ssh, "pm2 restart isamail")
        
        # Save PM2 configuration
        run_command(ssh, "pm2 save")
        
        # Wait a bit for server to start
        time.sleep(3)
        
        # Show PM2 status
        print("\n📊 Status do PM2:")
        run_command(ssh, "pm2 status")
        
        # Check logs
        print("\n📋 Últimas linhas do log:")
        run_command(ssh, "pm2 logs isamail --lines 10 --nostream")
        
        print("\n" + "="*60)
        print("✅ DEPLOY CONCLUÍDO COM SUCESSO!")
        print("="*60)
        print(f"\n🌐 Site: https://isamail.space")
        print(f"🎛️  Admin: https://isamail.space/admin")
        print(f"🔐 Inicializar: https://isamail.space/api/admin/seed")
        print(f"\n📝 Credenciais padrão após inicialização:")
        print(f"   Email: admin@isamail.space")
        print(f"   Senha: IsaMail@Admin2026")
        print("="*60 + "\n")
        
    except paramiko.AuthenticationException:
        print("❌ Erro de autenticação. Verifique a senha.")
        sys.exit(1)
    except paramiko.SSHException as e:
        print(f"❌ Erro SSH: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        ssh.close()
        print("🔌 Conexão encerrada.")

if __name__ == "__main__":
    main()
