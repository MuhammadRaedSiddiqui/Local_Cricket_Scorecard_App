'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, Link2, ArrowRight, Lightbulb } from 'lucide-react'
import { useRouter } from 'next/navigation' // Import useRouter
import apiClient from '@/lib/api-client' // Import your apiClient
import toast from 'react-hot-toast' // Import toast for feedback

interface JoinMatchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function JoinMatchModal({ isOpen, onClose }: JoinMatchModalProps) {
  const [matchCode, setMatchCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter() // Initialize router

  const handleJoin = async () => {
    if (!matchCode.trim()) {
      toast.error('Please enter a match code');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiClient.joinMatch(matchCode.trim());
      
      toast.success(response.message || 'Successfully joined match!');
      
      onClose();
      router.push(`/matches/${response.data._id}`);

    } catch (error: any) {
      console.error('Join match error:', error);
      if (error.message.includes('404')) {
        toast.error('Match not found. Please check the code.');
      } else if (error.message.includes('409')) {
        toast.error('You are already in this match.');
        onClose();
      } else {
        toast.error(error.message || 'Failed to join match.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        // --- THIS IS THE NEW WRAPPER ---
        // It's a single fixed container that uses flexbox to center its child.
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose} // Add onClick here to close when clicking the backdrop
        >
          {/* This modal div is now the child. 
            It doesn't need any fixed/top/left/translate classes.
            We add onClick(e.stopPropagation) to prevent clicks inside the modal from closing it.
          */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-xl z-50 p-6 relative" // 'relative' is good practice
            onClick={(e) => e.stopPropagation()} // Stop click from bubbling to backdrop
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                  <Link2 className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Join a Match</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter the match code shared by your friend to join their game
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Code
                </label>
                <input
                  type="text"
                  value={matchCode}
                  onChange={(e) => setMatchCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC123"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-mono uppercase"
                  maxLength={6}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-700 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span>Tip: Match codes are 6 characters long (letters/numbers).</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoin}
                disabled={!matchCode.trim() || isLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Joining...
                  </span>
                ) : (
                  <>
                    Join Match
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}