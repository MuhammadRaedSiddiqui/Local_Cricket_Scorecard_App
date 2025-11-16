'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Users, Trophy, Calendar, MapPin, Plus, X, AlertCircle } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface Player {
  name: string
  is_captain?: boolean
  is_keeper?: boolean
}

interface Team {
  name: string
  players: Player[]
}

export default function CreateMatchPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [oversSelection, setOversSelection] = useState('20')

  // Match Details
  const [matchData, setMatchData] = useState({
    venue: '',
    overs: 20,
    startTime: new Date().toISOString().slice(0, 16),
    isPrivate: false
  })

  // Team 1
  const [team1, setTeam1] = useState<Team>({
    name: '',
    players: []
  })
  const [team1PlayerInput, setTeam1PlayerInput] = useState('')

  // Team 2
  const [team2, setTeam2] = useState<Team>({
    name: '',
    players: []
  })
  const [team2PlayerInput, setTeam2PlayerInput] = useState('')

  // Add player to team with DUPLICATE CHECK
  const addPlayer = (team: 'team1' | 'team2') => {
    const input = team === 'team1' ? team1PlayerInput : team2PlayerInput
    const currentTeam = team === 'team1' ? team1 : team2

    // Trim and validate input
    const playerName = input.trim()

    if (!playerName) {
      toast.error('Please enter a player name')
      return
    }

    // Check if player limit reached
    if (currentTeam.players.length >= 11) {
      toast.error('Maximum 11 players allowed per team')
      return
    }

    // CHECK FOR DUPLICATE PLAYER NAMES
    const isDuplicate = currentTeam.players.some(
      player => player.name.toLowerCase() === playerName.toLowerCase()
    )

    if (isDuplicate) {
      toast.error(`Player "${playerName}" already exists in this team`)
      return
    }

    const newPlayer: Player = {
      name: playerName,
      is_captain: currentTeam.players.length === 0, // First player is captain by default
      is_keeper: currentTeam.players.length === 1   // Second player is keeper by default
    }

    if (team === 'team1') {
      setTeam1({ ...team1, players: [...team1.players, newPlayer] })
      setTeam1PlayerInput('')
      console.log(team1)
      console.log(setTeam1PlayerInput)
    } else {
      setTeam2({ ...team2, players: [...team2.players, newPlayer] })
      setTeam2PlayerInput('')
    }
  }

  // Remove player
  const removePlayer = (team: 'team1' | 'team2', index: number) => {
    if (team === 'team1') {
      const playerName = team1.players[index].name
      setTeam1({
        ...team1,
        players: team1.players.filter((_, i) => i !== index)
      })
    } else {
      const playerName = team2.players[index].name
      setTeam2({
        ...team2,
        players: team2.players.filter((_, i) => i !== index)
      })
    }
  }

  // Toggle captain/keeper
  const toggleRole = (team: 'team1' | 'team2', index: number, role: 'captain' | 'keeper') => {
    const currentTeam = team === 'team1' ? team1 : team2
    const updatedPlayers = currentTeam.players.map((player, i) => {
      if (role === 'captain') {
        return { ...player, is_captain: i === index }
      } else {
        return { ...player, is_keeper: i === index }
      }
    })

    if (team === 'team1') {
      setTeam1({ ...team1, players: updatedPlayers })
    } else {
      setTeam2({ ...team2, players: updatedPlayers })
    }
  }

  // ENHANCED VALIDATION
  const validateStep = () => {
    if (step === 1) {
      if (!matchData.venue.trim()) {
        toast.error('Please enter a venue')
        return false
      }
      if (!matchData.startTime) {
        toast.error('Please select start time')
        return false
      }
    }
    else if (step === 2) {
      if (!team1.name.trim()) {
        toast.error('Please enter Team 1 name')
        return false
      }
      if (team1.players.length < 2) {
        toast.error('Team 1 needs at least 2 players')
        return false
      }
      const hasCaptain = team1.players.some(p => p.is_captain)
      if (!hasCaptain) {
        toast.error('Please select a captain for Team 1')
        return false
      }
    }
    else if (step === 3) {
      if (!team2.name.trim()) {
        toast.error('Please enter Team 2 name')
        return false
      }
      if (team2.players.length < 2) {
        toast.error('Team 2 needs at least 2 players')
        return false
      }
      // CHECK FOR DUPLICATE TEAM NAMES
      if (team1.name.trim().toLowerCase() === team2.name.trim().toLowerCase()) {
        toast.error('Teams cannot have the same name')
        return false
      }
      const hasCaptain = team2.players.some(p => p.is_captain)
      if (!hasCaptain) {
        toast.error('Please select a captain for Team 2')
        return false
      }
    }
    return true
  }

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  // Handle create match
  const handleCreateMatch = async () => {
    if (!validateStep()) return

    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')

      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...matchData,
          teamOne: team1,
          teamTwo: team2
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create match')
      }

      toast.success(
        <div className="flex flex-col">
          <span>Match created successfully!</span>
          <span className="font-bold text-lg">Code: {data.data.matchCode}</span>
        </div>,
        { duration: 5000 }
      )

      setTimeout(() => {
        router.push(`/matches/${data.data._id}`)
      }, 2000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create match')
      setLoading(false)
    }
  }

  return (
    <>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-x-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>

            <h1 className="text-xl font-bold text-gray-900">Create Match</h1>

            <div className="text-sm text-gray-500">
              Step {step} of 4
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1">
          <motion.div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-1"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="container mx-auto px-2 md:px-4 py-8 max-w-2xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Match Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Match Details</h2>
                      <p className="text-gray-600">Set up your match information</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Venue */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Venue
                      </label>
                      <input
                        type="text"
                        value={matchData.venue}
                        onChange={(e) => setMatchData({ ...matchData, venue: e.target.value })}
                        placeholder="e.g., Local Park Ground"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Overs */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Overs
                      </label>
                      <select
                        value={oversSelection} // Use the new string state
                        onChange={(e) => {
                          const newSelection = e.target.value;
                          setOversSelection(newSelection); // Update the dropdown's state

                          if (newSelection === 'custom') {
                            // If they select custom, default the number input to 1.
                            // The user can then change it.
                            setMatchData({ ...matchData, overs: 1 });
                          } else {
                            // If they select a number, update matchData directly.
                            setMatchData({ ...matchData, overs: parseInt(newSelection) });
                          }
                        }}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map(num => (
                          <option key={num} value={num}>{num} Overs</option>
                        ))}
                        {/* Add the custom option */}
                        <option value="custom">Custom...</option>
                      </select>
                    </div>

                    {/* Conditionally render the custom input field with animation */}
                    <AnimatePresence>
                      {oversSelection === 'custom' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Overs (1-99)
                          </label>
                          <input
                            type="number"
                            // This is the fix: Show an empty string if overs is 0
                            value={matchData.overs === 0 ? '' : matchData.overs}
                            onChange={(e) => {
                              const val = e.target.value;

                              // If the input is empty, set state to 0
                              if (val === '') {
                                setMatchData({ ...matchData, overs: 0 });
                                return;
                              }

                              const num = parseInt(val);

                              // If not a number (e.g., "1e"), just ignore the keypress
                              if (isNaN(num)) {
                                return;
                              }

                              // We have a valid number, now just clamp it
                              if (num > 99) {
                                setMatchData({ ...matchData, overs: 99 });
                              } else if (num < 0) {
                                setMatchData({ ...matchData, overs: 0 });
                              } else {
                                // This is the correct way, no concatenation!
                                setMatchData({ ...matchData, overs: num });
                              }
                            }}
                            placeholder="e.g., 12"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Start Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        value={matchData.startTime}
                        onChange={(e) => setMatchData({ ...matchData, startTime: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Private Match */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="private"
                        checked={matchData.isPrivate}
                        onChange={(e) => setMatchData({ ...matchData, isPrivate: e.target.checked })}
                        className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="private" className="text-sm text-gray-700">
                        Make this a private match (only accessible via code)
                      </label>
                    </div>
                  </div>
                </Card>

                <Button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  Next: Team 1 Setup
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Team 1 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="p-3 md:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-2xl font-bold text-gray-900">Team 1 Setup</h2>
                      <p className="text-sm md:text-xs text-gray-600">Add team name and players</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Team Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Team Name
                      </label>
                      <input
                        type="text"
                        value={team1.name}
                        onChange={(e) => setTeam1({ ...team1, name: e.target.value })}
                        placeholder="e.g., Weekend Warriors"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        maxLength={30}
                      />
                    </div>

                    {/* Add Players */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Players ({team1.players.length}/11) - Min 2 required
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={team1PlayerInput}
                          onChange={(e) => setTeam1PlayerInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addPlayer('team1')
                            }
                          }}
                          placeholder="Player name"
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <Button
                          type="button"
                          onClick={() => addPlayer('team1')}
                          disabled={team1.players.length >= 11}
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Players List */}
                    <div className="space-y-2">
                      {team1.players.map((player, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{player.name}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleRole('team1', index, 'captain')}
                                className={`px-2 py-1 text-xs rounded-full ${player.is_captain
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-200 text-gray-500'
                                  }`}
                              >
                                C
                              </button>
                              <button
                                onClick={() => toggleRole('team1', index, 'keeper')}
                                className={`px-2 py-1 text-xs rounded-full ${player.is_keeper
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-200 text-gray-500'
                                  }`}
                              >
                                WK
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => removePlayer('team1', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {team1.players.length === 0 && (
                        <p className="text-sm md:text-xs text-center text-gray-500 py-4">No players added yet</p>
                      )}
                    </div>
                  </div>
                </Card>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setStep(1)}
                    variant="secondary"
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    Next: Team 2
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Team 2 */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-2xl font-bold text-gray-900">Team 2 Setup</h2>
                      <p className="text-sm md:text-xs text-gray-600">Add team name and players</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Team Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Team Name
                      </label>
                      <input
                        type="text"
                        value={team2.name}
                        onChange={(e) => setTeam2({ ...team2, name: e.target.value })}
                        placeholder="e.g., Sunday Strikers"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        maxLength={30}
                      />
                    </div>

                    {/* Add Players */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Players ({team2.players.length}/11) - Min 2 required
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={team2PlayerInput}
                          onChange={(e) => setTeam2PlayerInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addPlayer('team2')
                            }
                          }}
                          placeholder="Player name"
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <Button
                          type="button"
                          onClick={() => addPlayer('team2')}
                          disabled={team2.players.length >= 11}
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Players List */}
                    <div className="space-y-2">
                      {team2.players.map((player, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{player.name}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleRole('team2', index, 'captain')}
                                className={`px-2 py-1 text-xs rounded-full ${player.is_captain
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-200 text-gray-500'
                                  }`}
                              >
                                C
                              </button>
                              <button
                                onClick={() => toggleRole('team2', index, 'keeper')}
                                className={`px-2 py-1 text-xs rounded-full ${player.is_keeper
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-200 text-gray-500'
                                  }`}
                              >
                                WK
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => removePlayer('team2', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {team2.players.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No players added yet</p>
                      )}
                    </div>
                  </div>
                </Card>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setStep(2)}
                    variant="secondary"
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    Next: Review
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Match Details</h2>

                  {/* Match Info */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Venue</span>
                      <span className="font-medium">{matchData.venue}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Overs</span>
                      <span className="font-medium">{matchData.overs}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Start Time</span>
                      <span className="font-medium">
                        {new Date(matchData.startTime).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-xl p-4">
                      <h3 className="font-bold text-green-900 mb-2">{team1.name}</h3>
                      <p className="text-sm text-green-700 mb-2">{team1.players.length} players</p>
                      <div className="text-xs text-green-600">
                        Captain: {team1.players.find(p => p.is_captain)?.name || 'Not set'}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4">
                      <h3 className="font-bold text-green-900 mb-2">{team2.name}</h3>
                      <p className="text-sm text-green-700 mb-2">{team2.players.length} players</p>
                      <div className="text-xs text-green-600">
                        Captain: {team2.players.find(p => p.is_captain)?.name || 'Not set'}
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setStep(3)}
                    variant="secondary"
                    className="flex-1"
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateMatch}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    {loading ? (
                      <>
                        <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Creating Match...
                      </>
                    ) : (
                      <>
                        Create Match
                        <Trophy className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}