import { BaseAPI } from "./base-api";

class DashboardAPI extends BaseAPI {
  constructor() {
    super("/admin");
  }

  async getRevenue(params: any): Promise<any> {
    return this.get("/revenue", params);
  }

  async getCommissions(): Promise<any> {
    return this.get(`/commissions/calculate`);
  }

  async rejectRequest(id: string): Promise<void> {
    return this.post(`/${id}/cancel`, {});
  }
  async getRevenueTicketType(): Promise<any> {
    return this.get(`/revenue/ticket`);
  }
  async getTopAgentRevenue(): Promise<any> {
    return this.get(`/revenue/top-agent-lv1-by-revenue`);
  }
}

export const dashboardAPI = new DashboardAPI();
export default dashboardAPI;
