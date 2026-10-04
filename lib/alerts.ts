// lib/alerts.ts
// Simple rule-based anomaly detection engine for dashboard alerts (PRD §24, §51)

export interface AlertItem {
  id: string;
  type: 'warning' | 'info' | 'danger';
  title: string;
  description: string;
  busPlate?: string;
  date?: string;
}

export function detectAlerts(
  records: Array<{
    _id?: string;
    date: Date | string;
    busId?: { plateNumber?: string } | string;
    travelledKm: number;
    closingKm: number;
    openingKm: number;
    diesel: { qty: number; total: number };
    adblue: { qty: number; total: number };
  }>
): AlertItem[] {
  const alerts: AlertItem[] = [];

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const busName =
      typeof r.busId === 'object' && r.busId?.plateNumber
        ? r.busId.plateNumber
        : 'Bus';

    // Rule 1: Closing KM <= Opening KM anomaly
    if (r.closingKm <= r.openingKm && (r.closingKm > 0 || r.openingKm > 0)) {
      alerts.push({
        id: `km-check-${r._id || i}`,
        type: 'danger',
        title: `Invalid Odometer Reading (${busName})`,
        description: `Closing KM (${r.closingKm}) is not greater than Opening KM (${r.openingKm}). Please review entry.`,
        busPlate: busName,
      });
    }

    // Rule 2: Low Fuel Efficiency (KM/L < 2.5 KM/L for heavy bus)
    if (r.diesel.qty > 0 && r.travelledKm > 0) {
      const kmPerL = r.travelledKm / r.diesel.qty;
      if (kmPerL < 2.5) {
        alerts.push({
          id: `kml-low-${r._id || i}`,
          type: 'warning',
          title: `Unusually Low Fuel Efficiency (${busName})`,
          description: `Efficiency is ${kmPerL.toFixed(1)} KM/L (${r.travelledKm} km on ${r.diesel.qty}L). Review fuel log.`,
          busPlate: busName,
        });
      }
    }

    // Rule 3: High AdBlue consumption (Adblue > 10% of diesel qty)
    if (r.adblue.qty > 0 && r.diesel.qty > 0) {
      const ratio = r.adblue.qty / r.diesel.qty;
      if (ratio > 0.12) {
        alerts.push({
          id: `adblue-high-${r._id || i}`,
          type: 'info',
          title: `High AdBlue Consumption (${busName})`,
          description: `AdBlue filled: ${r.adblue.qty}L vs Diesel: ${r.diesel.qty}L (${(ratio * 100).toFixed(0)}% ratio).`,
          busPlate: busName,
        });
      }
    }
  }

  return alerts;
}
