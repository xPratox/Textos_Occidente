# Sistema Textos Occidente - backend/app/main.py

from fastapi import FastAPI
from app.modules.users.user_router import router as users_router
from app.modules.auth.auth_router import router as auth_router
from app.modules.productos.product_router import router as products_router
from app.modules.categorias.categoria_router import router as categories_router
from app.modules.proveedores.proveedor_router import router as proveedor_router
from app.modules.pedidos.pedido_router import router as pedido_router
from app.modules.ventas.ventas_router import router as sales_router
from app.modules.productos import product_model
from app.modules.categorias import categoria_model
from app.modules.proveedores import proveedor_model
from app.modules.pedidos import pedido_model
from app.modules.ventas import ventas_model
from app.database import create_db_tables
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.database import Base, engine
import traceback
from app.database import SessionLocal
from app.modules.users.user_service import UserService
from app.modules.users.user_schema import UserCreate, UserRole


create_db_tables()
app = FastAPI(
    title="Sistema de Gestión de Ventas API",
    description="Backend para un sistema de gestión de ventas con FastAPI y PostgreSQL",
    version="0.0.1",
    docs_url="/docs",
    redoc_url="/redoc"
)

static_dir = Path(__file__).parent / "static"

app.mount(
    "/static",
    StaticFiles(directory=static_dir),
    name="static"
)

# --- FIN CONFIGURACIÓN CRÍTICA ---


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los routers de los módulos
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(products_router)
app.include_router(categories_router)
app.include_router(pedido_router)
app.include_router(proveedor_router)
app.include_router(sales_router)

@app.get("/_admin/create-all-tables")
def create_tables():
    """
    Endpoint temporal y secreto para crear las tablas en la BD.
    """
    try:
        # Esta línea le dice a SQLAlchemy: 
        # "mira todos los modelos que definí y créalos como tablas en la BD"
        Base.metadata.create_all(bind=engine)
        return {"message": "¡Tablas creadas exitosamente!"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/_admin/create-first-admin")
def create_first_admin_endpoint():
    """
    Endpoint temporal para ejecutar el script create_first_admin.
    """
    print("🚀 Iniciando proceso de creación de administrador...")

    # Usamos 'with' para que la sesión (db) se cierre sola
    try:
        with SessionLocal() as db:
            user_service = UserService(db)
            admin_email = "admin@gmail.com"
            admin_password = "admin123"
            cedula = "12345678"

            print(f"Verificando si el usuario '{admin_email}' ya existe...")

            # 1. Verificar si existe
            try:
                existing_admin = user_service.get_user_by_email(admin_email)
                if existing_admin:
                    print(f"✅ El usuario administrador '{admin_email}' ya existe. Saltando creación.")
                    return {"message": f"El usuario administrador '{admin_email}' ya existe. No se hizo nada."}
            except Exception as e:
                # Si falla la búsqueda, lo reportamos
                print(f"⚠️  No se pudo verificar usuario: {e}")
                # Continuamos, puede que la tabla estuviera vacía y diera un error esperado

            # 2. Si no existe, crearlo
            print("Creando usuario administrador...")
            admin_user_data = UserCreate(
                email=admin_email,
                cedula=cedula,
                password=admin_password,
                full_name="Super Administrador",
                role=UserRole.ADMIN
            )

            user_service.create_user(admin_user_data)

            print(f"✅ Usuario administrador '{admin_email}' creado exitosamente!")
            return {
                "message": "¡Usuario administrador creado exitosamente!",
                "email": admin_email,
                "password": admin_password
            }

    except Exception as e:
        # Captura cualquier otro error
        print(f"❌ Error inesperado: {e}")
        return {
            "error": f"Error inesperado al crear admin: {str(e)}",
            "traceback": traceback.format_exc() # Esto nos da el error completo
        }

@app.get("/")
def read_root():
    return {"message": "Welcome to the Sales Management API. Access /docs for API documentation."}