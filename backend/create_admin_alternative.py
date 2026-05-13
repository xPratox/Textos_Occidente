# backend/create_admin_alternative.py
import sys
import os

# Agregar el directorio del proyecto al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.modules.users import user_model as models
from app.modules.users.user_schema import UserRole
from app.modules.auth.security import get_password_hash

def create_first_admin_alternative():
    db = None
    try:
        print("🚀 Iniciando proceso de creación de administrador (método alternativo)...")
        print("Iniciando conexión a la base de datos...")
        
        db = SessionLocal()
        
        # Datos del usuario administrador inicial
        admin_email = "admin@gmail.com"
        admin_password = "admin123"
        cedula = "12345678"
        full_name = "Super Administrador"
        
        print(f"Verificando si el usuario '{admin_email}' ya existe...")
        
        # Verificamos si el administrador ya existe
        existing_admin = db.query(models.User).filter(models.User.email == admin_email).first()
        if existing_admin:
            print(f"✅ El usuario administrador '{admin_email}' ya existe. Saltando creación.")
            return
        
        print("Creando hash de contraseña...")
        
        # Hash de la contraseña usando la función de seguridad
        try:
            hashed_password = get_password_hash(admin_password)
            print("✅ Hash de contraseña creado exitosamente")
        except Exception as hash_error:
            print(f"❌ Error al crear hash de contraseña: {hash_error}")
            # Intentar con una contraseña más corta
            admin_password = "admin"
            print(f"🔄 Intentando con contraseña más corta: {admin_password}")
            hashed_password = get_password_hash(admin_password)
            print("✅ Hash de contraseña creado con contraseña alternativa")
        
        print("Creando usuario administrador en la base de datos...")
        
        # Crear el usuario directamente en la base de datos
        admin_user = models.User(
            email=admin_email,
            cedula=cedula,
            hashed_password=hashed_password,
            full_name=full_name,
            role=UserRole.ADMIN.value
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"✅ Usuario administrador '{admin_email}' creado exitosamente!")
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Contraseña: {admin_password}")
        print(f"🆔 ID: {admin_user.id}")
        print("⚠️  ¡IMPORTANTE: Cambia esta contraseña en producción!")
        
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        print(f"Tipo de error: {type(e).__name__}")
        import traceback
        print("Traceback completo:")
        traceback.print_exc()
        
        # Rollback en caso de error
        if db:
            db.rollback()
    finally:
        if db:
            print("Cerrando conexión a la base de datos...")
            db.close()

if __name__ == "__main__":
    create_first_admin_alternative()
    print("✅ Proceso de creación de administrador finalizado.")
