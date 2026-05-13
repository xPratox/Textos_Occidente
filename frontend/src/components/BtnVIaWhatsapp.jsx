import { Link } from "react-router-dom";

const BtnViaWhatsapp = ({whatsappLink }) => {
    return (
        <div className="w-full text-center">
            <a href={whatsappLink} target="_blank"  rel="noopener noreferrer" className="block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                Ver Producto
            </a>
        </div>
    )
}

export default BtnViaWhatsapp;