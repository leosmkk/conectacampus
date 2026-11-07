import { lazy, Suspense, useState } from 'react';
import Header from './components/Header.jsx';
const AgendaPage = lazy(() => import('./features/eventos/AgendaPage.jsx'));
const CertificatesPage = lazy(() => import('./features/certificados/CertificatesPage.jsx'));
const SummaryPage = lazy(() => import('./features/resumo/SummaryPage.jsx'));

export default function App() {
  const [screen, setScreen] = useState('resumo');

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header screen={screen} onNavigate={setScreen} />

      <main
        style={{
          maxWidth: 1140,
          margin: '0 auto',
          padding: '34px 28px 72px'
        }}
      >
        <Suspense fallback={<p role="status">Carregando...</p>}>
          {screen === 'resumo' && <SummaryPage />}
          {screen === 'agenda' && <AgendaPage />}
          {screen === 'certificados' && <CertificatesPage />}
        </Suspense>
      </main>
    </div>
  );
}
