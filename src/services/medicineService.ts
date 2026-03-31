import type { Medicine } from '@/types/medicine'

export class MedicineService {
  private static readonly API_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

  // For Admin Panel (Paginated)
  static async getMedicines(page = 1, limit = 10, search = ''): Promise<{ items: Medicine[], total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search
    })
    
    const response = await fetch(`${this.API_URL}/products?${params}`)
    if (!response.ok) throw new Error('Failed to fetch medicines')
    
    const res = await response.json()
    // Support both old and new response formats for safety during migration
    if (res.code === 0 && res.data) {
      return res.data
    }
    return { items: res.data || [], total: res.meta?.total || 0 }
  }

  // For Storefront (Get All / Legacy support)
  // We fetch a large limit to simulate getting all. In a real app, we might want to paginate the store too.
  static async getAllMedicines(): Promise<Medicine[]> {
    const data = await this.getMedicines(1, 1000)
    return data.items || []
  }

  static async getMedicineById(id: string): Promise<Medicine | undefined> {
    const response = await fetch(`${this.API_URL}/products/${id}`)
    if (response.status === 404) return undefined
    if (!response.ok) throw new Error('Failed to fetch medicine')
    const res = await response.json()
    return res.code === 0 && res.data ? res.data : res
  }

  static async createMedicine(medicine: Partial<Medicine>): Promise<Medicine> {
    const response = await fetch(`${this.API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicine)
    })
    if (!response.ok) throw new Error('Failed to create medicine')
    const res = await response.json()
    return res.code === 0 && res.data ? res.data : res
  }

  static async updateMedicine(id: string, medicine: Partial<Medicine>): Promise<Medicine> {
    const response = await fetch(`${this.API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicine)
    })
    if (!response.ok) throw new Error('Failed to update medicine')
    const res = await response.json()
    return res.code === 0 && res.data ? res.data : res
  }

  static async deleteMedicine(id: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/products/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete medicine')
  }

  static async getSafetyInfo(): Promise<{ caveat: string[]; remark: string[]; guide: string[]; delivery: string[] }> {
    const response = await fetch(`${this.API_URL}/config`)
    if (!response.ok) throw new Error('Failed to fetch config')
    const res = await response.json()
    return res.code === 0 && res.data ? res.data : res
  }
}
