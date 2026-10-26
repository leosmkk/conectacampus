import { useEffect, useState } from 'react';
import { buscarResumo } from '../../services/api.js';

export default function SummaryPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  async function load() {
    setError('');
    try { setData(await buscarResumo()); } catch (err) { setError(err.message); }
  }
  useEffect(() => { void load(); }, []);
  return <section>
    <div className="page-heading"><h1>Resumo do campus</h1><button onClick={load}>Atualizar</button></div>
    {error && <p role="alert">{error}</p>}
    {!data && !error && <p role="status">Carregando...</p>}
    {data && <>
      <div className="summary-grid">
        {[
          ['Eventos', data.indicadores.eventCount], ['Vagas disponíveis', data.indicadores.availableSeats],
          ['Ocupação', `${data.indicadores.occupancyPercent}%`], ['Certificados', data.indicadores.certificateCount],
          ['Horas certificadas', data.indicadores.totalHours]
        ].map(([label, value]) => <article className="panel" key={label}><span>{label}</span><strong className="metric">{value}</strong></article>)}
      </div>
      <h2>Próximos eventos</h2>
      <div className="summary-grid">{data.eventos.map((event) => <article className="panel" key={event._id}>
        <h3>{event.title}</h3><p>{event.dateLabel}, {event.time}</p><p>{event.place}</p>
      </article>)}</div>
    </>}
  </section>;
}
