export interface Room {
  id: number;
  code?: string;
  name: string;
  building?: string;
  floor?: number;
  location?: string | null;
  auto_control_enabled?: boolean;
}
