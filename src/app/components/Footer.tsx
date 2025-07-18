export default function Footer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4 text-sm text-gray-500">
        <div className="flex space-x-6">
          <span>© {new Date().getFullYear()} GateKeeper</span>
          <button className="hover:text-gray-700 transition-colors duration-200">
            Política de Privacidad
          </button>
          <button className="hover:text-gray-700 transition-colors duration-200">
            Términos de Servicio
          </button>
        </div>
        <div className="flex space-x-6">
          <button className="hover:text-gray-700 transition-colors duration-200">
            Soporte
          </button>
          <span>Versión 0.2.0</span>
          <a
            href="https://github.com/gustavorh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-gray-900 transition-all duration-200 group"
          >
            <span className="text-gray-600 group-hover:text-gray-800">by</span>
            <span
              className="group-hover:scale-110 transition-transform duration-200"
              style={{ color: "#fe938c" }}
            >
              ⚡
            </span>
            <span className="font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent group-hover:from-pink-400 group-hover:to-pink-600">
              gustavorh
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
