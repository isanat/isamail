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
    print(f"  → {command}")
    stdin, stdout, stderr = ssh.exec_command(command, timeout=timeout)
    
    exit_code = stdout.channel.recv_exit_status()
    output = stdout.read().decode()
    error = stderr.read().decode()
    
    if show_output and output:
        print(output)
    if error and "warning" not in error.lower() and "npm warn" not in error.lower():
        print(f"  ⚠️  {error}")
    
    return exit_code, output, error

def main():
    print(f"\n{'='*50}")
    print(f"🚀 DEPLOY RÁPIDO - IsaMail")
    print(f"{'='*50}\n")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30, allow_agent=False, look_for_keys=False)
        print("✅ Conectado!\n")
        
        # Quick deploy
        print("📥 Pull + Build + Restart...")
        run_command(ssh, f"cd {APP_DIR} && git pull origin main")
        run_command(ssh, f"cd {APP_DIR} && /usr/bin/npm run build", timeout=300)
        run_command(ssh, "pm2 restart isamail && pm2 save")
        
        time.sleep(2)
        
        print("\n📊 Status:")
        run_command(ssh, "pm2 status")
        
        print("\n" + "="*50)
        print("✅ DEPLOY CONCLUÍDO!")
        print("="*50)
        print(f"\n🔐 Inicializar: https://isamail.space/api/admin/seed")
        print(f"🎛️  Admin: https://isamail.space/admin")
        print(f"   Email: admin@isamail.space")
        print(f"   Senha: IsaMail@Admin2026")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        sys.exit(1)
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
