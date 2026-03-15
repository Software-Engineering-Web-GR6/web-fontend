export type * from "./sensor";
export type * from "./device";
export type * from "./alert";
export type * from "./threshold";
export type * from "./auth";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatar?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
