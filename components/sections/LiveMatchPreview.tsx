'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/animations/ScrollAnimation'
import { Clock, Users, TrendingUp } from 'lucide-react'

export default function LiveMatchPreview() {
  const [activeTeam, setActiveTeam] = useState('Australia')

  const teams = {
    Australia: {
      batting: [
        { name: 'Travis Head', runs: 47, balls: 30, fours: 5, sixes: 2, strikeRate: 156.7, status: 'c Alex Carey b Josh Hazlewood' },
        { name: 'David Warner', runs: 29, balls: 17, fours: 3, sixes: 1, strikeRate: 170.6, status: 'c Alex Carey b Josh Hazlewood' },
        { name: 'Mitchell Marsh', runs: 75, balls: 49, fours: 6, sixes: 4, strikeRate: 153.0, status: 'c Alex Carey b Josh Hazlewood' },
        { name: 'Glenn Maxwell', runs: 15, balls: 11, fours: 1, sixes: 1, strikeRate: 136.3, status: 'c Alex Carey b Josh Hazlewood' },
        { name: 'Josh Inglis', runs: 9, balls: 13, fours: 0, sixes: 0, strikeRate: 69.2, status: 'not out' },
        { name: 'Matthew Wade', runs: 14, balls: 9, fours: 2, sixes: 0, strikeRate: 155.5, status: 'not out' },
      ],
      bowling: [
        { name: 'Mitchell Starc', overs: 5.0, maidens: 0, runs: 31, wickets: 0, economy: 6.2 },
        { name: 'Josh Hazlewood', overs: 6.0, maidens: 1, runs: 23, wickets: 1, economy: 3.83 },
        { name: 'Nathan Ellis', overs: 7.3, maidens: 0, runs: 60, wickets: 0, economy: 8.0 },
        { name: 'Adam Zampa', overs: 10.0, maidens: 0, runs: 50, wickets: 0, economy: 5.0 },
      ],
    },
    India: {
      batting: [
        { name: 'Rohit Sharma', runs: 61, balls: 43, fours: 7, sixes: 2, strikeRate: 141.8, status: 'b Adam Zampa' },
        { name: 'Shubman Gill', runs: 35, balls: 27, fours: 4, sixes: 1, strikeRate: 129.6, status: 'c Glenn Maxwell b Josh Hazlewood' },
        { name: 'Virat Kohli', runs: 48, balls: 38, fours: 5, sixes: 0, strikeRate: 126.3, status: 'b Nathan Ellis' },
        { name: 'Suryakumar Yadav', runs: 24, balls: 15, fours: 2, sixes: 1, strikeRate: 160.0, status: 'c Josh Inglis b Starc' },
        { name: 'Hardik Pandya', runs: 10, balls: 9, fours: 1, sixes: 0, strikeRate: 111.1, status: 'not out' },
        { name: 'Ravindra Jadeja', runs: 7, balls: 8, fours: 0, sixes: 0, strikeRate: 87.5, status: 'not out' },
      ],
      bowling: [
        { name: 'Mohammed Siraj', overs: 5.0, maidens: 0, runs: 36, wickets: 1, economy: 7.2 },
        { name: 'Jasprit Bumrah', overs: 6.0, maidens: 1, runs: 21, wickets: 2, economy: 3.5 },
        { name: 'Kuldeep Yadav', overs: 10.0, maidens: 0, runs: 47, wickets: 1, economy: 4.7 },
        { name: 'Axar Patel', overs: 8.0, maidens: 0, runs: 49, wickets: 0, economy: 6.1 },
      ],
    },
  }

  
    const opponentTeam = activeTeam === 'Australia' ? 'India' : 'Australia'
  const { batting, yetToBat, bowling } = teams[activeTeam]
  const opponentBowling = teams[opponentTeam].bowling

  const hasBatted = batting && batting.length > 0
  const hasBowled = opponentBowling && opponentBowling.length > 0

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden" id="preview">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollAnimation>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              See it in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                action
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Experience the live scoreboard interface that thousands of local teams love
            </p>
          </div>
        </ScrollAnimation>

        {/* Live Scorecard Preview */}
        <ScrollAnimation delay={0.2}>
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-200/30 via-accent-200/30 to-primary-200/30 blur-3xl"></div>
            <motion.div
              initial={{ scale: 0.95 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Summer League Final</h3>
                    <p className="text-primary-100">Match 42 • Green Park Stadium</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">LIVE</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">2.3K watching</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teams and Scores */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">Riverside Rangers</h4>
                        <p className="text-sm text-gray-600">Innings 1 of 1</p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-primary-600">248/7</div>
                        <div className="text-sm text-gray-600">20 overs</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Batting</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">S. Kumar*</span>
                          <span className="text-sm text-gray-600">45 (32)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">R. Patel</span>
                          <span className="text-sm text-gray-600">28 (19)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">Valley Vikings</h4>
                        <p className="text-sm text-gray-600">Innings 1 of 1</p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-gray-900">186/5</div>
                        <div className="text-sm text-gray-600">16.4 overs</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Bowling</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">M. Johnson</span>
                          <span className="text-sm text-gray-600">3-0-28-2</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Economy</span>
                          <span className="text-sm font-medium">9.33</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Status */}
                <div className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Valley Vikings need 63 runs in 20 balls
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">RRR: 18.90</span>
                  </div>
                </div>

                {/* Recent Balls */}
                <div className="mt-6">
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">This Over</p>
                  <div className="flex gap-2">
                    {['1', '4', 'W', '2', '0', '6'].map((ball, index) => (
                      <div
                        key={index}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          ball === 'W'
                            ? 'bg-red-100 text-red-600'
                            : ball === '4'
                            ? 'bg-blue-100 text-blue-600'
                            : ball === '6'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ball}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </ScrollAnimation>

        {/* Detailed Scorecard Tabs */}
        <ScrollAnimation delay={0.4}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto mt-16 bg-white rounded-3xl shadow-xl border border-gray-200 p-8"
          >
             {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 rounded-lg p-1 flex space-x-1 max-w-xs w-full mx-4">
                {['Australia', 'India'].map((team) => (
                  <button
                    key={team}
                    onClick={() => setActiveTeam(team)}
                    className={`w-1/2 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTeam === team
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-white text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>

            {/* Batting Section */}
            {hasBatted ? (
              <>
                <div className="overflow-x-auto mb-8">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-700 border-b">
                        <th className="text-left px-4 py-2">Batting</th>
                        <th className="text-left px-4 py-2">Status</th>
                        <th className="text-center px-4 py-2">R</th>
                        <th className="text-center px-4 py-2">B</th>
                        <th className="text-center px-4 py-2">4s</th>
                        <th className="text-center px-4 py-2">6s</th>
                        <th className="text-center px-4 py-2">SR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batting.map((b) => (
                        <tr key={b.name} className="border-b hover:bg-gray-50 transition">
                          <td className="py-3 px-4 font-medium text-gray-800">{b.name}</td>
                          <td className="py-3 px-4 text-gray-600">{b.status}</td>
                          <td className="py-3 text-center">{b.runs}</td>
                          <td className="py-3 text-center">{b.balls}</td>
                          <td className="py-3 text-center">{b.fours}</td>
                          <td className="py-3 text-center">{b.sixes}</td>
                          <td className="py-3 text-center">{b.strikeRate.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Yet to Bat Section */}
                {yetToBat && yetToBat.length > 0 && (
                  <div className="mb-12 bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Yet to Bat</p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-800">
                      {yetToBat.slice(0, 4).map((player) => (
                        <span
                          key={player}
                          className="px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm"
                        >
                          {player}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="mb-8 text-center text-gray-600">No batting data yet.</div>
            )}

            {/* Bowling Section */}
            {hasBowled ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 border-b">
                      <th className="text-left px-4 py-2">Bowling</th>
                      <th className="text-center px-4 py-2">O</th>
                      <th className="text-center px-4 py-2">M</th>
                      <th className="text-center px-4 py-2">R</th>
                      <th className="text-center px-4 py-2">W</th>
                      <th className="text-center px-4 py-2">Econ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opponentBowling.map((p) => (
                      <tr key={p.name} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4 font-medium text-gray-800">{p.name}</td>
                        <td className="py-3 text-center">{p.overs}</td>
                        <td className="py-3 text-center">{p.maidens}</td>
                        <td className="py-3 text-center">{p.runs}</td>
                        <td className="py-3 text-center">{p.wickets}</td>
                        <td className="py-3 text-center">{p.economy.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-600">No bowling data yet.</div>
            )}
          </motion.div>
        </ScrollAnimation>
      </div>
    </section>
  )
}
