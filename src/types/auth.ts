export interface User {
  id: string
  email: string
  role: 'admin' | 'assistant'
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

export interface RolePermission {
  role: 'admin' | 'assistant'
  permission_id: string
  granted: boolean
}

export interface AccessMatrix {
  [resource: string]: {
    [action: string]: {
      admin: boolean
      assistant: boolean
    }
  }
}

// Define the access matrix for different resources and actions
export const ACCESS_MATRIX: AccessMatrix = {
  koi: {
    create: { admin: true, assistant: false },
    read: { admin: true, assistant: true },
    update: { admin: true, assistant: false },
    delete: { admin: true, assistant: false },
    export: { admin: true, assistant: true },
    bulk_upload: { admin: true, assistant: false }
  },
  customers: {
    create: { admin: true, assistant: false },
    read: { admin: true, assistant: true },
    update: { admin: true, assistant: false },
    delete: { admin: true, assistant: false },
    export: { admin: true, assistant: true }
  },
  breeders: {
    create: { admin: true, assistant: false },
    read: { admin: true, assistant: true },
    update: { admin: true, assistant: false },
    delete: { admin: true, assistant: false }
  },
  varieties: {
    create: { admin: true, assistant: false },
    read: { admin: true, assistant: true },
    update: { admin: true, assistant: false },
    delete: { admin: true, assistant: false }
  },
  shipping: {
    create: { admin: true, assistant: true },
    read: { admin: true, assistant: true },
    update: { admin: true, assistant: true },
    delete: { admin: true, assistant: false }
  },
  shipping_locations: {
    create: { admin: true, assistant: false },
    read: { admin: true, assistant: true },
    update: { admin: true, assistant: false },
    delete: { admin: true, assistant: false }
  },
  reports: {
    read: { admin: true, assistant: true },
    export: { admin: true, assistant: true },
    generate: { admin: true, assistant: true }
  },
  configurations: {
    read: { admin: true, assistant: false },
    update: { admin: true, assistant: false }
  },
  users: {
    create: { admin: true, assistant: false },
    read: { admin: true, assistant: false },
    update: { admin: true, assistant: false },
    delete: { admin: true, assistant: false },
    manage_roles: { admin: true, assistant: false }
  }
}

export type UserRole = 'admin' | 'assistant'
export type ResourceType = keyof typeof ACCESS_MATRIX
export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'export' | 'bulk_upload' | 'generate' | 'manage_roles'
