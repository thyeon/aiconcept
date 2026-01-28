// ============================================
// Virtual Scrolling Utilities
// ============================================

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

// ============================================
// Virtual List Hook
// ============================================

interface UseVirtualListOptions {
  count: number
  estimateSize?: (index: number) => number
  getScrollElement?: () => HTMLElement | null
  overscan?: number
}

/**
 * Virtual scrolling hook for large lists
 * @param options - Virtual list configuration
 */
export function useVirtualList(options: UseVirtualListOptions) {
  const { count, estimateSize = () => 50, getScrollElement, overscan = 5 } = options

  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: getScrollElement || (() => parentRef.current),
    estimateSize,
    overscan,
  })

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
  }
}

// ============================================
// Dynamic Size Virtual List
// ============================================

interface UseDynamicVirtualListOptions {
  items: any[]
  estimateSize?: (index: number) => number
  getScrollElement?: () => HTMLElement | null
  overscan?: number
}

/**
 * Virtual scrolling hook for items with dynamic sizes
 * @param options - Virtual list configuration
 */
export function useDynamicVirtualList(options: UseDynamicVirtualListOptions) {
  const { items, estimateSize, getScrollElement, overscan } = options

  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: getScrollElement || (() => parentRef.current),
    estimateSize: estimateSize || ((index) => {
      // Estimate based on item content
      const item = items[index]
      if (!item) return 50

      // Dynamic estimation based on content length
      const textLength = JSON.stringify(item).length
      return Math.min(Math.max(textLength / 10, 40), 200)
    }),
    overscan,
  })

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
  }
}

// ============================================
// Virtual List Component
// ============================================

import { ReactNode } from 'react'

interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  estimateSize?: (index: number) => number
  className?: string
  overscan?: number
}

/**
 * Reusable virtual list component
 * @example
 * <VirtualList
 *   items={largeArray}
 *   renderItem={(item, index) => <div key={index}>{item.name}</div>}
 *   estimateSize={() => 60}
 * />
 */
export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = () => 50,
  className = '',
  overscan = 5,
}: VirtualListProps<T>) {
  const { parentRef, virtualizer, virtualItems, totalSize } = useVirtualList({
    count: items.length,
    estimateSize,
    overscan,
  })

  return (
    <div ref={parentRef} className={className} style={{ overflow: 'auto', height: '100%' }}>
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Virtual Grid Component (2D)
// ============================================

interface VirtualGridProps<T> {
  items: T[]
  columns: number
  renderItem: (item: T, index: number) => ReactNode
  estimateSize?: (index: number) => number
  rowHeight?: number
  className?: string
}

/**
 * Virtual scrolling grid component
 * @example
 * <VirtualGrid
 *   items={images}
 *   columns={4}
 *   renderItem={(item, index) => <ImageCard key={index} image={item} />}
 *   rowHeight={200}
 * />
 */
export function VirtualGrid<T>({
  items,
  columns,
  renderItem,
  estimateSize = () => 200,
  rowHeight,
  className = '',
}: VirtualGridProps<T>) {
  const rowCount = Math.ceil(items.length / columns)

  const { parentRef, virtualizer, virtualItems, totalSize } = useVirtualList({
    count: rowCount,
    estimateSize: () => rowHeight || estimateSize(0),
  })

  return (
    <div ref={parentRef} className={className} style={{ overflow: 'auto', height: '100%' }}>
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const rowStartIndex = virtualRow.index * columns
          const rowEndIndex = Math.min(rowStartIndex + columns, items.length)
          const rowItems = items.slice(rowStartIndex, rowEndIndex)

          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: '1rem',
              }}
            >
              {rowItems.map((item, colIndex) => (
                <div key={rowStartIndex + colIndex}>
                  {renderItem(item, rowStartIndex + colIndex)}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Use Cases
// ============================================

/**
 * Example: Virtual Case List
 *
 * import { useVirtualList } from '@/lib/virtual-scrolling'
 *
 * function CaseList({ cases }) {
 *   const { parentRef, virtualItems, totalSize } = useVirtualList({
 *     count: cases.length,
 *     estimateSize: () => 80, // Average case item height
 *   })
 *
 *   return (
 *     <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
 *       <div style={{ height: `${totalSize}px` }}>
 *         {virtualItems.map((virtualItem) => {
 *           const caseItem = cases[virtualItem.index]
 *           return (
 *             <div
 *               key={caseItem.id}
 *               style={{
 *                 position: 'absolute',
 *                 top: 0,
 *                 transform: `translateY(${virtualItem.start}px)`,
 *                 height: `${virtualItem.size}px`,
 *               }}
 *             >
 *               <CaseItem case={caseItem} />
 *             </div>
 *           )
 *         })}
 *       </div>
 *     </div>
 *   )
 * }
 */
