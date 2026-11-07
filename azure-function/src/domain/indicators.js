export function indicators(input) {
  const keys = ['eventCount', 'certificateCount', 'seatsUsed', 'seatsTotal', 'totalHours'];
  if (!input || keys.some((key) => !Number.isSafeInteger(input[key]) || input[key] < 0) || input.seatsUsed > input.seatsTotal) {
    const error = new Error('Indicadores exigem contagens inteiras não negativas e ocupação válida.');
    error.status = 400;
    throw error;
  }
  return {
    ...Object.fromEntries(keys.map((key) => [key, input[key]])),
    availableSeats: input.seatsTotal - input.seatsUsed,
    occupancyPercent: input.seatsTotal ? Math.round(input.seatsUsed / input.seatsTotal * 10000) / 100 : 0,
    averageCertificateHours: input.certificateCount ? Math.round(input.totalHours / input.certificateCount * 100) / 100 : 0
  };
}
