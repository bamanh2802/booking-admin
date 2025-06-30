// src/services/api/commission-api.ts
import type { CommissionListResponse} from "@/types/commission";
import { BaseAPI } from "./base-api";

class CommissionAPI extends BaseAPI {
constructor() {
    super("/commissions");
  }


  async getAllCommissions(): Promise<CommissionListResponse> {
      return this.get("/",)
    }

  async updateCommission(id: string, percent: number): Promise<any> {
      return this.patch(`/${id}`, {percent})
    }
}

const commissionAPI = new CommissionAPI();
export default commissionAPI;