export interface SystemConfig {
  caveat: string[]
  remark: string[]
  guide: string[]
  delivery: string[]
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const API_URL = `${API_BASE}/config`

export const ConfigService = {
  async getConfig(): Promise<SystemConfig> {
    const response = await fetch(API_URL)
    if (!response.ok) throw new Error('Failed to fetch config')
    const res = await response.json()
    return res.code === 0 && res.data ? res.data : res
  },

  async updateConfig(config: SystemConfig): Promise<SystemConfig> {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    if (!response.ok) throw new Error('Failed to update config')
    const res = await response.json()
    return res.code === 0 && res.data ? res.data : res
  }
}
