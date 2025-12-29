
import { useState } from 'react'
import { Outlet, Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X } from 'lucide-react'

import { Toaster } from '@/components/ui/toaster'

export default function Layout() {
  const { user, loading, signOut } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
      `}>
        <div className="p-6 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Gabinete 360</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <Link 
            to="/" 
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/eleitores" 
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Users size={20} />
            <span>Eleitores</span>
          </Link>
          <Link 
            to="/demandas" 
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FileText size={20} />
            <span>Demandas</span>
          </Link>
          <Link 
            to="/documentos" 
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div className="flex h-5 w-5 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wand-2"><path d="m19 2 2 2-2 2-2-2 2-2Z"/><path d="m5 7 2 2-2 2-2-2 2-2Z"/><path d="m15 11 2 2-2 2-2-2 2-2Z"/><path d="M9.7 13.3a3 3 0 0 0-4.3 4.2l3 3a3 3 0 0 0 4.2-4.3l-5.6-5.6Z"/></svg>
            </div>
            <span>IA Redator</span>
          </Link>
          <Link 
            to="/relatorios" 
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div className="flex h-5 w-5 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-bar-chart"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-4"/><path d="M8 18v-2"/><path d="M16 18v-6"/></svg>
            </div>
            <span>Relatórios</span>
          </Link>
          <Link 
            to="/equipe" 
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Users size={20} />
            <span>Equipe</span>
          </Link>
          <Link 
            to="/prestacao-contas" 
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div className="flex h-5 w-5 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
            <span>Prestação Contas</span>
          </Link>
          <Link 
            to="/financeiro" 
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div className="flex h-5 w-5 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <span>Financeiro</span>
          </Link>
          <Link 
            to="/integracoes" 
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div className="flex h-5 w-5 items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M8 11h8"/><path d="M8 15h8"/><path d="M11 7v8"/></svg>
            </div>
            <span>Integrações</span>
          </Link>
          <Link 
            to="/configuracoes" 
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Settings size={20} />
            <span>Configurações</span>
          </Link>
        </nav>
        <div className="p-4 border-t absolute bottom-0 w-64 bg-white">
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={signOut}>
            <LogOut size={20} className="mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between z-30">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="mr-2">
              <Menu size={24} />
            </Button>
            <span className="font-bold text-lg text-gray-800">Gabinete 360</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  )
}
