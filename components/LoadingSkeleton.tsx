'use client'

import React from 'react'

interface SkeletonProps {
  className?: string
  count?: number
}

export const Skeleton = ({ className = '', count = 1 }: SkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50 bg-[length:200%_100%] rounded ${className}`}
          style={{
            animation: 'shimmer 2s infinite',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </>
  )
}

export const CardSkeleton = () => (
  <div className="rounded-3xl shadow-xl p-6 backdrop-blur-2xl border-2 bg-gray-800/40 border-gray-700/50">
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  </div>
)

export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
  <tr className="border-b border-gray-700/50">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
)

export const TableSkeleton = ({
  rows = 5,
  columns = 5,
}: {
  rows?: number
  columns?: number
}) => (
  <div className="rounded-3xl shadow-xl backdrop-blur-2xl border-2 bg-gray-800/40 border-gray-700/50 overflow-hidden">
    <table className="min-w-full">
      <thead className="bg-gray-800/60">
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="px-6 py-4 text-left">
              <Skeleton className="h-4 w-24" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
)

export const StatCardSkeleton = () => (
  <div className="rounded-3xl shadow-xl p-6 backdrop-blur-2xl border-2 bg-gray-800/40 border-gray-700/50">
    <div className="flex items-start justify-between">
      <div className="space-y-3 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-14 w-14 rounded-2xl" />
    </div>
  </div>
)

export const ListSkeleton = ({ items = 5 }: { items?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div
        key={i}
        className="rounded-2xl shadow-md p-4 backdrop-blur-xl border bg-gray-800/30 border-gray-700/50 hover-lift"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
)
