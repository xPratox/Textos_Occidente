# backend/create_initial_admin.py
import sys
import os

# Agregar el directorio del proyecto al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.modules.users.user_service import UserService
from app.modules.users.user_schema import UserCreate, UserRole
from app.core.exceptions import DuplicateEntryException

def create_first_admin():
    db = None
    try:
        print("Iniciando conexión a la base de datos...")
        db = SessionLocal()
        user_service = UserService(db)

        # Datos del usuario administrador inicial
        admin_email = "admin@gmail.com"
        admin_password = "admin123"  # Contraseña segura pero no muy larga
        cedula = "12345678"

        print(f"Verificando si el usuario '{admin_email}' ya existe...")
        
        # Verificamos si el administrador ya existe
        try:
            existing_admin = user_service.get_user_by_email(admin_email)
            if existing_admin:
                print(f"✅ El usuario administrador '{admin_email}' ya existe. Saltando creación.")
                return
        except Exception as e:
            print(f"⚠️  No se pudo verificar usuario existente: {e}")
            # Continuamos con la creación

        print("Creando usuario administrador...")
        
        # Creamos el objeto UserCreate
        admin_user_data = UserCreate(
            email=admin_email,
            cedula=cedula,
            password=admin_password,
            full_name="Super Administrador",
            role=UserRole.ADMIN
        )

        # Intentamos crear el usuario
        try:
            user_service.create_user(admin_user_data)
            print(f"✅ Usuario administrador '{admin_email}' creado exitosamente!")
            print(f"📧 Email: {admin_email}")
            print(f"🔑 Contraseña: {admin_password}")
            print("⚠️  ¡IMPORTANTE: Cambia esta contraseña en producción!")
        except Exception as create_error:
            print(f"❌ Error al crear el usuario: {create_error}")
            raise create_error

    except DuplicateEntryException as e:
        print(f"❌ Error de duplicado: {e.detail}")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        print(f"Tipo de error: {type(e).__name__}")
        import traceback
        print("Traceback completo:")
        traceback.print_exc()
    finally:
        if db:
            print("Cerrando conexión a la base de datos...")
            db.close()

if __name__ == "__main__":
    print("🚀 Iniciando proceso de creación de administrador...")
    create_first_admin()
    print("✅ Proceso de creación de administrador finalizado.")