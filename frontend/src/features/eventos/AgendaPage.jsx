import { useEffect, useMemo, useState } from 'react';
import { buscarEventos } from '../../services/api.js';
import { Loading, ErrorMessage } from '../../components/Feedback.jsx';

export default function AgendaPage() {
  const [eventos, setEventos] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const data = await buscarEventos();
        setEventos(data);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar os eventos pela Azure Function.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    const statusMap = {
      'Inscrito': 'inscrito',
      'Vagas abertas': 'vagas',
      'Lotados': 'lotado'
    };

    return eventos.filter((evento) => {
      const matchesStatus =
        filter === 'Todos' || evento.status === statusMap[filter];

      const matchesSearch =
        evento.title?.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [eventos, filter, search]);

  return (
    <div>
      <div style={eyebrowStyle}>Agenda</div>

      <h1 style={titleStyle}>Eventos do campus</h1>

      <p style={{ color: '#6B6880', margin: '-10px 0 22px' }}>
        Dados carregados pelo endpoint GET da Azure Function conectado ao MongoDB Atlas.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
        {['Todos', 'Inscrito', 'Vagas abertas', 'Lotados'].map((label) => (
          <button
            key={label}
            onClick={() => setFilter(label)}
            style={{
              height: 40,
              padding: '0 17px',
              borderRadius: 12,
              border: `1px solid ${filter === label ? '#0F8A6B' : '#E2E0EE'}`,
              background: filter === label ? '#0F8A6B' : '#fff',
              color: filter === label ? '#fff' : '#4A4857',
              fontWeight: 600
            }}
          >
            {label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar evento"
          style={{
            height: 40,
            width: 240,
            border: '1px solid #E2E0EE',
            borderRadius: 12,
            padding: '0 14px',
            background: '#fff',
            outline: 'none'
          }}
        />
      </div>

      {loading && <Loading>Carregando eventos...</Loading>}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
          {filtered.map((evento) => (
            <article
              key={evento._id ?? evento.id}
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 6px 20px rgba(27,26,35,.05)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 14
                }}
              >
                <div
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 700,
                    fontSize: 18,
                    lineHeight: 1.3
                  }}
                >
                  {evento.title}
                </div>

                <StatusBadge status={evento.status} />
              </div>

              <div style={{ fontSize: 13.5, color: '#6B6880', margin: '14px 0' }}>
                {evento.org}
              </div>

              <div
                style={{
                  paddingTop: 14,
                  borderTop: '1px solid #F0EEF8',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 18,
                  fontSize: 13,
                  color: '#4A4857'
                }}
              >
                <span>{evento.dateLabel}</span>
                <span>{evento.time}</span>
                <span>{evento.place}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    inscrito: ['#0F8A6B', 'rgba(15,138,107,.1)', 'Inscrito'],
    vagas: ['#4A4857', 'rgba(74,72,87,.08)', 'Vagas abertas'],
    lotado: ['#B4234B', 'rgba(180,35,75,.1)', 'Lotado']
  };

  const [color, background, label] = map[status] || map.vagas;

  return (
    <div
      style={{
        fontWeight: 700,
        fontSize: 11.5,
        color,
        background,
        padding: '6px 11px',
        borderRadius: 9,
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </div>
  );
}

const eyebrowStyle = {
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: '#8B88A0',
  marginBottom: 8
};

const titleStyle = {
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 800,
  fontSize: 34,
  letterSpacing: '-.03em',
  margin: '0 0 22px'
};
