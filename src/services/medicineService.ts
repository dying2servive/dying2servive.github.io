import type { Medicine, MedicineData } from '@/types/medicine'

// 全局变量存储药品数据和安全信息
let medicineDataCache: MedicineData | null = null

// 从index.json加载真实药品数据
const loadMedicineData = async (): Promise<MedicineData> => {
  if (medicineDataCache) {
    return medicineDataCache
  }
  
  try {
    const response = await fetch('/index.json')
    const data = await response.json() as MedicineData
    
    // 为每个药品添加ID（基于名称生成）
    data.data = data.data.map(medicine => ({
      ...medicine,
      id: medicine.name.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')
    }))
    
    medicineDataCache = data
    return data
  } catch (error) {
    console.error('加载药品数据失败:', error)
    // 返回空数据作为后备
    return {
      data: [],
      caveat: [],
      remark: [],
      guide: [],
      delivery: []
    } as any
  }
}

export class MedicineService {
  // 获取所有药品
  static async getAllMedicines(): Promise<Medicine[]> {
    await new Promise(resolve => setTimeout(resolve, 300)) // 模拟网络延迟
    const data = await loadMedicineData()
    return data.data
  }

  // 根据ID获取药品详情
  static async getMedicineById(id: string): Promise<Medicine | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const medicines = await this.getAllMedicines()
    return medicines.find(medicine => medicine.id === id)
  }

  // 搜索药品（支持名称、标签、分类搜索）
  static async searchMedicines(searchTerm: string): Promise<Medicine[]> {
    await new Promise(resolve => setTimeout(resolve, 250))
    const medicines = await this.getAllMedicines()
    const term = searchTerm.toLowerCase()
    
    return medicines.filter(medicine => 
      medicine.name.toLowerCase().includes(term) ||
      medicine.description.toLowerCase().includes(term) ||
      medicine.tags.some(tag => tag.toLowerCase().includes(term)) ||
      medicine.category.some(cat => cat.toLowerCase().includes(term))
    )
  }

  // 按分类筛选
  static async getMedicinesByCategory(category: string): Promise<Medicine[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const medicines = await this.getAllMedicines()
    return medicines.filter(medicine => 
      medicine.category.some(cat => cat === category)
    )
  }

  // 按标签筛选
  static async getMedicinesByTag(tag: string): Promise<Medicine[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const medicines = await this.getAllMedicines()
    return medicines.filter(medicine => 
      medicine.tags.some(t => t === tag)
    )
  }

  // 获取所有分类
  static async getCategories(): Promise<string[]> {
    const medicines = await this.getAllMedicines()
    const categorySet = new Set<string>()
    medicines.forEach(medicine => {
      medicine.category.forEach(cat => categorySet.add(cat))
    })
    return Array.from(categorySet).sort()
  }

  // 获取所有标签
  static async getTags(): Promise<string[]> {
    const medicines = await this.getAllMedicines()
    const tagSet = new Set<string>()
    medicines.forEach(medicine => {
      medicine.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }

  // 获取安全信息
  static async getSafetyInfo(): Promise<{ caveat: string[]; remark: string[]; guide: string[]; delivery: string[] }> {
    const data = await loadMedicineData()
    const anyData = data as any
    return {
      caveat: data.caveat,
      remark: data.remark,
      guide: Array.isArray(anyData?.guide) ? anyData.guide : [],
      delivery: Array.isArray(anyData?.delivery) ? anyData.delivery : []
    }
  }
}