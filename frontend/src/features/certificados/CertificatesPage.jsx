import { useEffect, useState } from 'react';
import { buscarCertificados, inserirCertificado, alterarCertificado, excluirCertificado } from '../../services/api.js';

const empty = { title: '', student: '', hours: 1, completedAt: '', status: 'disponivel' };

export default function CertificatesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null);
  async function load() {
    try { setItems(await buscarCertificados()); } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  function open(item) { setEditing(item?.id ?? null); setForm(item ? { ...item } : { ...empty }); setError(''); }
  async function run(action) {
    setBusy(true); setError('');
    try { await action(); await load(); } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  function save(event) {
    event.preventDefault();
    void run(async () => {
      const body = { ...form, hours: Number(form.hours) };
      if (editing) await alterarCertificado(editing, body);
      else await inserirCertificado(body);
      setForm(null);
    });
  }
  function download(item) {
    void run(async () => {
      const updated = await alterarCertificado(item.id, { ...item, status: 'emitido' });
      const text = `CERTIFICADO DE PARTICIPAÇÃO\n\n${updated.student}\n${updated.title}\nCarga horária: ${updated.hours} horas\nConclusão: ${updated.completedAt}\nIdentificador: ${updated.id}\n`;
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url; link.download = `certificado-${updated.id}.txt`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
  return <section>
    <div className="page-heading"><h1>Certificados</h1><button onClick={() => open(null)}>Novo certificado</button></div>
    {error && <p role="alert">{error}</p>}
    {loading && <p role="status">Carregando...</p>}
    {!loading && !items.length && <p>Nenhum certificado encontrado.</p>}
    <div className="certificate-list">{items.map((item) => <article className="panel" key={item.id}>
      <h2>{item.title}</h2><p>{item.student}</p><p>{item.hours} horas, {item.completedAt}</p>
      <p>{item.status === 'emitido' ? 'Emitido' : 'Disponível'}</p>
      <div className="actions">
        <button disabled={busy} onClick={() => download(item)}>Baixar certificado</button>
        <button disabled={busy} onClick={() => open(item)}>Editar</button>
        {deleting === item.id ? <>
          <span>Excluir este certificado?</span>
          <button disabled={busy} onClick={() => run(async () => { await excluirCertificado(item.id); setDeleting(null); })}>Confirmar</button>
          <button onClick={() => setDeleting(null)}>Cancelar</button>
        </> : <button disabled={busy} onClick={() => setDeleting(item.id)}>Excluir</button>}
      </div>
    </article>)}</div>
    {form && <div className="dialog-overlay"><form role="dialog" aria-modal="true" aria-labelledby="certificate-heading" className="panel certificate-form" onSubmit={save}>
      <h2 id="certificate-heading">{editing ? 'Editar certificado' : 'Novo certificado'}</h2>
      {error && <p role="alert">{error}</p>}
      {[
        ['title', 'Evento', 'text'], ['student', 'Participante', 'text'],
        ['hours', 'Carga horária', 'number'], ['completedAt', 'Conclusão', 'date']
      ].map(([key, label, type]) => <label key={key}>{label}<input required maxLength={200} type={type} min={type === 'number' ? 1 : undefined} max={type === 'number' ? 1000 : undefined} value={form[key]}
        onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}
      <label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
        <option value="disponivel">Disponível</option><option value="emitido">Emitido</option>
      </select></label>
      <div className="actions"><button disabled={busy} type="submit">{busy ? 'Salvando...' : 'Salvar'}</button><button type="button" disabled={busy} onClick={() => setForm(null)}>Cancelar</button></div>
    </form></div>}
  </section>;
}
