export function generateRecommendations(d) {
  const recs = [];

  if (d.heatRisk > 0.5) {
    recs.push('Install cooling systems and ensure access to air conditioning during peak summer months.');
    recs.push('Develop heat emergency response plans for vulnerable populations.');
  }
  if (d.heatRisk > 0.3) {
    recs.push('Plant shade trees and expand urban green spaces to reduce heat island effects.');
  }

  if (d.floodRisk > 0.5) {
    recs.push('Review and update flood insurance coverage for properties in low-lying areas.');
    recs.push('Invest in stormwater management infrastructure and drainage improvements.');
  }
  if (d.floodRisk > 0.3) {
    recs.push('Create emergency flood preparedness kits and evacuation routes.');
  }

  if (d.wildfireRisk > 0.5) {
    recs.push('Create defensible space around structures by clearing vegetation within 30 feet.');
    recs.push('Develop community wildfire protection plans with local fire departments.');
  }
  if (d.wildfireRisk > 0.3) {
    recs.push('Use fire-resistant building materials for new construction and renovations.');
  }

  if (recs.length === 0) {
    recs.push('Continue monitoring climate trends and maintain current preparedness measures.');
    recs.push('Consider investing in renewable energy to reduce long-term climate impact.');
  }

  return recs.slice(0, 5);
}
