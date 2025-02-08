import { ConnectWallet } from './ConnectWallet'

export function Header() {
  return (
    <header className="w-full bg-opacity-90 bg-gray-900 border-b border-indigo-500/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
            Nothing Agent
          </h1>
          <nav className="hidden sm:flex items-center gap-6">
            <a
              href="#"
              className="text-gray-300 hover:text-indigo-400 transition-colors"
            >
              Home
            </a>
          </nav>
        </div>
        <ConnectWallet />
      </div>
    </header>
  )
}
