// app/components/ImageUploadComponent.jsx
import React, { useState } from 'react';

const ImageUploadComponent = ({ productId, onImageUploaded }) => {
    const API_URL = import.meta.env.VITE_API_URL; // Nueva constante para la URL de la API
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    // Maneja la selección de un archivo por parte del usuario
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validar tipo de archivo básico antes de subir
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                setError("Tipo de archivo no soportado. Solo JPG, PNG, GIF.");
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
            setError(null); // Limpia errores previos
        }
    };

    // Envía el archivo al backend
    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Por favor, selecciona un archivo de imagen.");
            return;
        }

        if (!productId) {
            setError("Error: El ID del producto es necesario para subir la imagen.");
            return;
        }

        setUploading(true);
        setError(null);

        // FormData es necesario para enviar archivos
        const formData = new FormData();
        formData.append('file', selectedFile); // 'file' debe coincidir con el parámetro en tu router de FastAPI

        try {
            const response = await fetch(`${API_URL}/products/${productId}/upload-image`, {
                method: 'POST',
                body: formData, // FormData automáticamente establece el Content-Type: multipart/form-data
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
            }

            const updatedProduct = await response.json();
            alert("✅ ¡Imagen subida y asociada exitosamente!");
            console.log("Producto actualizado con imagen:", updatedProduct);

            // Llama a la función de callback pasada por el componente padre
            // para que pueda actualizar su estado con la nueva URL de la imagen
            if (onImageUploaded) {
                onImageUploaded(updatedProduct.image_url);
            }
            setSelectedFile(null); // Limpiar el input de archivo después de la subida
        } catch (err) {
            setError(`❌ Error al subir la imagen: ${err.message}`);
            console.error("Error al subir la imagen:", err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ border: '1px solid #e0e0e0', padding: '20px', borderRadius: '8px', marginTop: '20px', backgroundColor: '#f9f9f9' }}>
            <h4 style={{ marginBottom: '15px', color: '#333' }}>📸 Gestionar Imagen del Producto</h4>
            <input
                type="file"
                accept="image/jpeg, image/png, image/gif"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ marginBottom: '15px', display: 'block', width: '100%' }}
            />
            <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    opacity: (!selectedFile || uploading) ? 0.6 : 1,
                    transition: 'opacity 0.3s ease'
                }}
            >
                {uploading ? "Subiendo..." : "Subir/Actualizar Imagen"}
            </button>
            {error && <p style={{ color: '#dc3545', marginTop: '10px', fontSize: '0.9em' }}>{error}</p>}
        </div>
    );
};

export default ImageUploadComponent;