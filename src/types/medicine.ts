// 药品数据类型定义 - 匹配用户的index.json格式
export interface MedicineData {
  data: Medicine[]
  caveat: string[]
  remark: string[]
  guide: string[]
  delivery: string[]
}

export interface Medicine {
  name: string
  category: string[]
  tags: string[]
  price: number
  star: number
  spec: string
  description: string
  images: string[]
  id?: string
  title?: string
  manufacturer?: string
  specifications?: string
  details?: {
    usage?: string
    ingredients?: string[]
    precautions?: string[]
    storage?: string
    expiry?: string
    images?: string[]
  }
}

export interface MedicineFilter {
  category?: string
  priceRange?: [number, number]
  searchTerm?: string
  tags?: string[]
}