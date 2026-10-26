export async function aggregate(clients) {
  const [eventos, certificados] = await Promise.all([clients.events('/eventos'), clients.certificates('/certificados')]);
  const seatsUsed = eventos.reduce((sum, event) => sum + event.seatsUsed, 0);
  const seatsTotal = eventos.reduce((sum, event) => sum + event.seatsTotal, 0);
  const totalHours = certificados.reduce((sum, certificate) => sum + certificate.hours, 0);
  const indicadores = await clients.enrich({ eventCount: eventos.length, certificateCount: certificados.length, seatsUsed, seatsTotal, totalHours });
  return { eventos, certificados, indicadores, generatedAt: new Date().toISOString() };
}
