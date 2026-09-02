/**
 * Lightweight rule-based anomaly detection over inspection history.
 * Flags patterns worth an admin's attention without requiring a trained model
 * (a hackathon-appropriate stand-in for the "AI compliance auditing" module;
 * swap in a real classifier later using the same input/output shape).
 */
export const detectAnomalies = ({ inspections, shops }) => {
  const flags = [];

  // 1. Shops re-inspected unusually often in a short window (possible gaming of the system)
  const inspectionsByShop = {};
  inspections.forEach((insp) => {
    const shopId = insp.shop.toString();
    inspectionsByShop[shopId] = inspectionsByShop[shopId] || [];
    inspectionsByShop[shopId].push(insp);
  });

  Object.entries(inspectionsByShop).forEach(([shopId, list]) => {
    if (list.length >= 3) {
      const sorted = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const first = new Date(sorted[0].createdAt);
      const last = new Date(sorted[sorted.length - 1].createdAt);
      const daySpan = (last - first) / (1000 * 60 * 60 * 24);
      if (daySpan <= 30) {
        flags.push({
          type: "frequent_reinspection",
          shopId,
          severity: "medium",
          message: `Shop inspected ${list.length} times within ${Math.round(daySpan)} days.`,
        });
      }
    }
  });

  // 2. Shops whose certificate is close to expiry but have no scheduled re-inspection
  const now = new Date();
  shops
    .filter((s) => s.complianceStatus === "compliant")
    .forEach((shop) => {
      // caller passes shop.validUntil precomputed from its active certificate, if any
      if (shop.validUntil) {
        const daysLeft = (new Date(shop.validUntil) - now) / (1000 * 60 * 60 * 24);
        if (daysLeft <= 15 && daysLeft > 0) {
          flags.push({
            type: "expiring_soon",
            shopId: shop._id.toString(),
            severity: "low",
            message: `Certificate expires in ${Math.ceil(daysLeft)} day(s).`,
          });
        } else if (daysLeft <= 0) {
          flags.push({
            type: "expired_but_marked_compliant",
            shopId: shop._id.toString(),
            severity: "high",
            message: `Certificate expired ${Math.abs(Math.ceil(daysLeft))} day(s) ago but shop still marked compliant.`,
          });
        }
      }
    });

  // 3. Inspectors with an unusually high non-compliance rate (possible bias or overly harsh grading) vs the mean
  const byInspector = {};
  inspections
    .filter((i) => i.status === "completed")
    .forEach((i) => {
      const id = i.inspector.toString();
      byInspector[id] = byInspector[id] || { total: 0, nonCompliant: 0 };
      byInspector[id].total += 1;
      if (i.result === "non-compliant") byInspector[id].nonCompliant += 1;
    });

  const rates = Object.values(byInspector).map((v) => v.nonCompliant / v.total);
  const meanRate = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;

  Object.entries(byInspector).forEach(([inspectorId, stats]) => {
    if (stats.total >= 3) {
      const rate = stats.nonCompliant / stats.total;
      if (rate - meanRate >= 0.4) {
        flags.push({
          type: "inspector_outlier_rate",
          inspectorId,
          severity: "medium",
          message: `Non-compliance rate ${(rate * 100).toFixed(0)}% vs team average ${(meanRate * 100).toFixed(0)}%.`,
        });
      }
    }
  });

  return flags;
};
