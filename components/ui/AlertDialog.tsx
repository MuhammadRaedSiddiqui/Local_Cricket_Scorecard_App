'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!mounted) {
    return null
  }

  if (!open) {
    return null
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => {
          onOpenChange(false)
        }}
      />
      <div className="relative z-50 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}

const AlertDialogContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-xl p-6"
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      {children}
    </div>
  )
}

const AlertDialogHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-4">{children}</div>
}

const AlertDialogTitle = ({ children }: { children: React.ReactNode }) => {
  return <h2 className="text-lg font-semibold text-gray-900">{children}</h2>
}

const AlertDialogDescription = ({ children }: { children: React.ReactNode }) => {
  return <div className="text-sm text-gray-600 mt-2">{children}</div>
}

const AlertDialogFooter = ({ children }: { children: React.ReactNode }) => {
  console.log('🔧 AlertDialogFooter rendering')
  return <div className="flex gap-3 justify-end mt-6">{children}</div>
}

const AlertDialogCancel = ({ 
  onClick, 
  children 
}: { 
  onClick: () => void
  children: React.ReactNode 
}) => {

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      onClick()
    } catch (error) {
      console.error('🔧 Error calling onClick:', error)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={() => console.log('🔧 Cancel button mouse down')}
      onMouseUp={() => console.log('🔧 Cancel button mouse up')}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
    >
      {children}
    </button>
  )
}

const AlertDialogAction = ({ 
  onClick, 
  children,
  variant = 'default',
  disabled = false
}: { 
  onClick: () => void
  children: React.ReactNode
  variant?: 'default' | 'destructive'
  disabled?: boolean
}) => {
  const handleClick = (e: React.MouseEvent) => {    
    e.preventDefault()
    e.stopPropagation()
    
    if (disabled) {
      return
    }
    
    try {
      onClick()
    } catch (error) {
      console.error('🔧 Error calling onClick:', error)
    }
  }

  const variantClasses = variant === 'destructive' 
    ? "bg-red-500 text-white hover:bg-red-600 active:bg-red-700" 
    : "bg-green-500 text-white hover:bg-green-600 active:bg-green-700"
  
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      onMouseDown={() => console.log('🔧 Action button mouse down')}
      onMouseUp={() => console.log('🔧 Action button mouse up')}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses}`}
    >
      {children}
    </button>
  )
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
}