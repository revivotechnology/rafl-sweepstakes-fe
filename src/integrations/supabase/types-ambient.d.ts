declare module "./types" {
  export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

  export interface Database {
    public: {
      Tables: Record<string, unknown>
      Views: Record<string, unknown>
      Functions: Record<string, unknown>
      Enums: Record<string, unknown>
      CompositeTypes: Record<string, unknown>
    }
  }
}
