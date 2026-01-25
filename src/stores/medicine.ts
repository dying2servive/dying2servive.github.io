import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Medicine, MedicineFilter } from '@/types/medicine'
import { MedicineService } from '@/services/medicineService'

export const useMedicineStore = defineStore('medicine', () => {
  // 状态
  const medicines = ref<Medicine[]>([])
  // 保存初始顺序以便重置排序
  const originalMedicines = ref<Medicine[]>([])
  const currentMedicine = ref<Medicine | null>(null)
  type SafetyInfo = { caveat: string[]; remark: string[]; guide: string[]; delivery: string[] }
  const safetyInfo = ref<SafetyInfo>({ caveat: [], remark: [], guide: [], delivery: [] })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filter = ref<MedicineFilter>({})

  // 计算属性
  const filteredMedicines = computed(() => {
    let result = medicines.value

    // 搜索过滤
    if (filter.value.searchTerm) {
      const term = filter.value.searchTerm.toLowerCase()
      result = result.filter(medicine => 
        medicine.name.toLowerCase().includes(term) ||
        medicine.description.toLowerCase().includes(term) ||
        medicine.tags.some(tag => tag.toLowerCase().includes(term)) ||
        medicine.category.some(cat => cat.toLowerCase().includes(term))
      )
    }

    // 分类过滤
    if (filter.value.category) {
      result = result.filter(medicine => 
        medicine.category.some(cat => cat === filter.value.category)
      )
    }

    // 标签过滤
    if (filter.value.tags && filter.value.tags.length > 0) {
      result = result.filter(medicine =>
        medicine.tags.some(tag => filter.value.tags!.includes(tag))
      )
    }

    // 价格范围过滤
    if (filter.value.priceRange) {
      const [min, max] = filter.value.priceRange
      result = result.filter(medicine => medicine.price >= min && medicine.price <= max)
    }

    return result
  })

  const categories = computed(() => {
    const categorySet = new Set<string>()
    medicines.value.forEach(medicine => {
      medicine.category.forEach(cat => categorySet.add(cat))
    })
    return Array.from(categorySet).sort()
  })

  const tags = computed(() => {
    const tagSet = new Set<string>()
    medicines.value.forEach(medicine => {
      medicine.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  })

  const priceRange = computed(() => {
    if (medicines.value.length === 0) return { min: 0, max: 0 }
    const prices = medicines.value.map(m => m.price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }
  })

  // 方法
  const fetchMedicines = async () => {
    loading.value = true
    error.value = null
    try {
      const [medicinesData, safetyData] = await Promise.all([
        MedicineService.getAllMedicines(),
        MedicineService.getSafetyInfo()
      ])
      medicines.value = medicinesData
      // 记录初始顺序用于重置排序
      originalMedicines.value = medicinesData
      safetyInfo.value = safetyData
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取药品列表失败'
      console.error('获取药品列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchMedicineById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const medicine = await MedicineService.getMedicineById(id)
      if (medicine) {
        currentMedicine.value = medicine
      } else {
        error.value = '药品不存在'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取药品详情失败'
      console.error('获取药品详情失败:', err)
    } finally {
      loading.value = false
    }
  }

  const setFilter = (newFilter: MedicineFilter) => {
    filter.value = { ...filter.value, ...newFilter }
  }

  const clearFilter = () => {
    filter.value = {}
  }

  const searchMedicines = (searchTerm: string) => {
    setFilter({ searchTerm })
  }

  const filterByCategory = (category: string) => {
    setFilter({ category })
  }

  const filterByTags = (tags: string[]) => {
    setFilter({ tags })
  }

  const filterByPriceRange = (priceRange: [number, number]) => {
    setFilter({ priceRange })
  }

  const sortMedicines = (sortBy: 'price' | 'star' | 'name', sortOrder: 'asc' | 'desc') => {
    const sorted = [...medicines.value].sort((a, b) => {
      let aValue: number | string
      let bValue: number | string
      
      switch (sortBy) {
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'star':
          aValue = a.star
          bValue = b.star
          break
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
    
    medicines.value = sorted
  }

  // 重置为初始顺序（默认排序）
  const resetSort = () => {
    medicines.value = [...originalMedicines.value]
  }

  return {
    // 状态
    medicines,
    currentMedicine,
    safetyInfo,
    loading,
    error,
    filter,
    
    // 计算属性
    filteredMedicines,
    categories,
    tags,
    priceRange,
    
    // 方法
    fetchMedicines,
    fetchMedicineById,
    setFilter,
    clearFilter,
    searchMedicines,
    filterByCategory,
    filterByTags,
    filterByPriceRange,
    sortMedicines,
    resetSort
  }
})