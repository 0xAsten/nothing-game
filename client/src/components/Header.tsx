import { ConnectWallet } from './ConnectWallet'

export function Header() {
  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold">Nothing Agent</h1>
          <nav className="hidden sm:flex items-center gap-6">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Home
            </a>
          </nav>
        </div>
        <ConnectWallet />
      </div>
    </header>
  )
}
