import api from "./api";

export interface Rule {
  id: number;
  room_id: number;
  name: string;
  metric: string;
  operator: string;
  threshold_value: number;
  target_device_id: number | null;
  action: string;
  alert_level: string;
  alert_message: string;
  is_active: boolean;
}

export interface RulePayload {
  room_id: number;
  name: string;
  metric: string;
  operator: string;
  threshold_value: number;
  target_device_id: number | null;
  action: string;
  alert_level: string;
  alert_message: string;
  is_active: boolean;
}

export const ruleApi = {
  listByRoom: async (roomId: number): Promise<Rule[]> => {
    const response = await api.get<Rule[]>(`/api/v1/rules/room/${roomId}`);
    return response.data;
  },

  create: async (payload: RulePayload): Promise<Rule> => {
    const response = await api.post<Rule>("/api/v1/rules/", payload);
    return response.data;
  },

  update: async (ruleId: number, payload: Partial<RulePayload>): Promise<Rule> => {
    const response = await api.put<Rule>(`/api/v1/rules/${ruleId}`, payload);
    return response.data;
  },

  remove: async (ruleId: number): Promise<void> => {
    await api.delete(`/api/v1/rules/${ruleId}`);
  },
};

