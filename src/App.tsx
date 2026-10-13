import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { PagoModalProvider } from './context/PagoModalProvider'
import { SociosProvider } from './context/SociosContext'
import { AjustesPage } from './pages/AjustesPage'
import { DashboardPage } from './pages/DashboardPage'
import { DetalleSocioPage } from './pages/DetalleSocioPage'
import { EditarSocioPage } from './pages/EditarSocioPage'
import { InactivosPage } from './pages/InactivosPage'
import { NuevoSocioPage } from './pages/NuevoSocioPage'
import { RecordatoriosPage } from './pages/RecordatoriosPage'
import { SociosPage } from './pages/SociosPage'
import { LoginPage } from './pages/LoginPage'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route
                element={
                  <SociosProvider>
                    <PagoModalProvider>
                      <AppLayout />
                    </PagoModalProvider>
                  </SociosProvider>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="socios" element={<SociosPage />} />
                <Route path="socios/nuevo" element={<NuevoSocioPage />} />
                <Route path="socios/:id" element={<DetalleSocioPage />} />
                <Route path="socios/:id/editar" element={<EditarSocioPage />} />
                <Route path="inactivos" element={<InactivosPage />} />
                <Route path="recordatorios" element={<RecordatoriosPage />} />
                <Route path="ajustes" element={<AjustesPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}
