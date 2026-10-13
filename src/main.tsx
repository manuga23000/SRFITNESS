import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { firebaseConfigurado } from './lib/firebaseConfig'
import { SinConfiguracion } from './pages/SinConfiguracion'

// La app (y Firebase) se cargan solo si hay configuración; si no, se muestra cómo completarla.
// oxlint-disable-next-line react/only-export-components
const App = lazy(() => import('./App'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {firebaseConfigurado ? (
      <Suspense fallback={null}>
        <App />
      </Suspense>
    ) : (
      <SinConfiguracion />
    )}
  </StrictMode>,
)
