# backend/fix_bcrypt_config.py
"""
Script para verificar y corregir la configuración de bcrypt
"""
import sys
import os

# Agregar el directorio del proyecto al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_bcrypt_config():
    print("🔍 Verificando configuración de bcrypt...")
    
    try:
        # Importar las dependencias
        from passlib.context import CryptContext
        import bcrypt
        
        print(f"✅ bcrypt versión: {bcrypt.__version__}")
        
        # Crear contexto con configuración específica
        pwd_context = CryptContext(
            schemes=["bcrypt"],
            deprecated="auto",
            bcrypt__rounds=12,  # Número de rondas específico
            bcrypt__min_rounds=10,
            bcrypt__max_rounds=15
        )
        
        # Probar con contraseñas de diferentes longitudes
        test_passwords = [
            "admin123",
            "admin",
            "test",
            "123456",
            "password"
        ]
        
        for password in test_passwords:
            try:
                print(f"🧪 Probando contraseña: '{password}' (longitud: {len(password)})")
                hashed = pwd_context.hash(password)
                print(f"✅ Hash creado exitosamente: {hashed[:20]}...")
                
                # Verificar que el hash funciona
                is_valid = pwd_context.verify(password, hashed)
                print(f"✅ Verificación: {'✓' if is_valid else '✗'}")
                
            except Exception as e:
                print(f"❌ Error con contraseña '{password}': {e}")
        
        print("✅ Configuración de bcrypt verificada correctamente")
        return True
        
    except ImportError as e:
        print(f"❌ Error de importación: {e}")
        print("💡 Solución: pip install bcrypt>=4.0.0")
        return False
        
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def create_admin_with_fixed_bcrypt():
    """Crear administrador con configuración de bcrypt corregida"""
    try:
        from app.database import SessionLocal
        from app.modules.users import user_model as models
        from app.modules.users.user_schema import UserRole
        from passlib.context import CryptContext
        
        # Configuración específica de bcrypt
        pwd_context = CryptContext(
            schemes=["bcrypt"],
            deprecated="auto",
            bcrypt__rounds=12
        )
        
        print("🚀 Creando administrador con bcrypt corregido...")
        
        db = SessionLocal()
        
        # Datos del administrador
        admin_email = "admin@gmail.com"
        admin_password = "admin123"
        cedula = "12345678"
        
        # Verificar si ya existe
        existing = db.query(models.User).filter(models.User.email == admin_email).first()
        if existing:
            print(f"✅ Usuario '{admin_email}' ya existe")
            return
        
        # Crear hash
        hashed_password = pwd_context.hash(admin_password)
        
        # Crear usuario
        admin_user = models.User(
            email=admin_email,
            cedula=cedula,
            hashed_password=hashed_password,
            full_name="Super Administrador",
            role=UserRole.ADMIN.value
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"✅ Administrador creado exitosamente!")
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Contraseña: {admin_password}")
        
        db.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🔧 Verificando y corrigiendo configuración de bcrypt...")
    
    if test_bcrypt_config():
        print("\n🚀 Creando administrador...")
        create_admin_with_fixed_bcrypt()
    else:
        print("\n❌ No se puede continuar sin configuración correcta de bcrypt")
    
    print("✅ Proceso finalizado.")
