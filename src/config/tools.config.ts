export interface ToolMetadata {
  id: string
  title: string
  description: string
  icon: string
  tags: string[]
  featured: boolean
}

export const tools: ToolMetadata[] = [
  {
    id: 'unit-price-comparator',
    title: 'Unit Price Comparator',
    description: 'Find the best value across different package sizes.',
    icon: 'Scale',
    tags: ['Shopping', 'Utility'],
    featured: true,
  },
]
