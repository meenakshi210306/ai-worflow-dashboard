export function getHealthStatus() {
  return {
    status: "ok",
    service: "ai-workflow-dashboard-api",
    timestamp: new Date().toISOString()
  };
}
