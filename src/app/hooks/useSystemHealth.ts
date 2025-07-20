// ===================================
// HOOK DE SYSTEM HEALTH REFACTORIZADO
// ===================================
// Re-exporta la funcionalidad desde el nuevo servicio de health

export { useHealthMonitoring as useSystemHealth } from "../lib/healthService";
