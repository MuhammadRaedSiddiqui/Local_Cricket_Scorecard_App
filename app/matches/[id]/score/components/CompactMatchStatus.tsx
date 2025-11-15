import React from 'react';
import { Trophy, Target, Circle } from 'lucide-react';

interface Team {
    name: string;
    total_score: number;
    total_wickets: number;
    total_balls: number;
    extras: number;
    players: any[];
}

interface Match {
    target?: number;
    overs: number;
    currentInnings: number;
}

interface CompactMatchStatusProps {
    battingTeam: Team | null;
    bowlingTeam: Team | null;
    currentInnings: number;
    match: Match;
    batsman1: string;
    batsman2: string;
    bowler: string;
    striker: 'batsman1' | 'batsman2';
    currentOver: string[];
    previousBowler?: string;
}

// Helper function to convert balls to overs
const ballsToOvers = (balls: number): string => {
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return `${overs}.${remainingBalls}`;
};

const getBallClass = (ball: string) => {
    console.log('Ball value:', ball); // Debug log

    if (ball === 'W') return 'bg-red-500 text-white'
    if (ball === '4') return 'bg-blue-500 text-white'
    if (ball === '6') return 'bg-purple-500 text-white'
    if (ball === 'WD' || ball === 'NB') return 'bg-yellow-500 text-white'
    if (ball === '0') return 'bg-gray-400 text-white'
    if (ball === '1' || ball === '2' || ball === '3') return 'bg-green-500 text-white'
    return 'bg-gray-400 text-white'
}



export default function CompactMatchStatus({
    battingTeam,
    bowlingTeam,
    currentInnings,
    match,
    batsman1,
    batsman2,
    bowler,
    striker,
    currentOver,
    previousBowler,
}: CompactMatchStatusProps) {
    if (!battingTeam || !bowlingTeam) {
        return (
            <div className="bg-gray-50 rounded-xl shadow-md border border-gray-200 p-4 mb-4">
                <div className="text-center text-gray-500">
                    <p>No match data available</p>
                </div>
            </div>
        );
    }

    const runsNeeded = match.target ? Math.max(0, match.target - battingTeam.total_score) : 0;
    const ballsRemaining = (match.overs * 6) - battingTeam.total_balls;

    return (
        <div className="bg-gray-50 rounded-xl shadow-md border border-gray-200 overflow-hidden mb-4">
            {/* Score Header */}
            <div className="bg-white p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    {/* Batting Team Score */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">

                            <span className="text-xs font-semibold text-green-600 uppercase">Batting</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 truncate">{battingTeam.name}</h2>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-900">
                                {battingTeam.total_score}/{battingTeam.total_wickets}
                            </span>
                            <span className="text-sm text-gray-500">
                                ({ballsToOvers(battingTeam.total_balls)})
                            </span>
                        </div>
                    </div>

                    {/* VS or Target */}
                    <div className="px-3 text-center">
                        {currentInnings === 2 && match.target ? (
                            <div className="bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                                <div className="text-xs text-gray-500">Need</div>
                                <div className="text-xl font-black text-green-600">{runsNeeded}</div>
                                <div className="text-xs text-gray-500">{ballsRemaining}b</div>
                            </div>
                        ) : (
                            <div className="text-xl font-semibold text-gray-400">vs</div>
                        )}
                    </div>

                    {/* Bowling Team */}
                    <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-xs font-semibold text-blue-600 uppercase">Bowling</span>

                        </div>
                        <h2 className="text-lg font-bold text-gray-900 truncate">{bowlingTeam.name}</h2>
                        <div className="text-sm text-gray-600">
                            {currentInnings === 1 ? '1st Innings' : '2nd Innings'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Players */}
            <div className="bg-white px-4 py-3 border-b border-gray-200">
                <div className="flex items-start justify-between text-sm">
                    {/* Batting Team & Batsmen - Left */}
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-gray-900">{battingTeam.name}</span>
                            <span className="text-gray-500 text-xs">batting</span>
                        </div>
                        <div className="mt-2 space-y-1">
                            {/* Striker */}
                            <div className="flex items-baseline gap-1">
                                <span className="text-green-600">●</span>
                                <span className="font-medium text-gray-900">
                                    {striker === 'batsman1' ? batsman1 : batsman2}:
                                </span>
                                <span className="text-gray-700">
                                    {(() => {
                                        const strikerName = striker === 'batsman1' ? batsman1 : batsman2;
                                        const player = battingTeam.players.find(p => p.name === strikerName);
                                        return player ? `${player.runs_scored || 0}* (${player.balls_played || 0})` : '0* (0)';
                                    })()}
                                </span>
                            </div>
                            {/* Non-striker */}
                            <div className="flex items-baseline gap-1 pl-3">
                                <span className="font-medium text-gray-700">
                                    {striker === 'batsman2' ? batsman1 : batsman2}:
                                </span>
                                <span className="text-gray-600">
                                    {(() => {
                                        const nonStrikerName = striker === 'batsman2' ? batsman1 : batsman2;
                                        const player = battingTeam.players.find(p => p.name === nonStrikerName);
                                        return player ? `${player.runs_scored || 0} (${player.balls_played || 0})` : '0 (0)';
                                    })()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bowling Team & Bowlers - Right */}
                    <div className="flex-1 text-right">
                        <div className="flex items-baseline justify-end gap-2">
                            <span className="text-gray-500 text-xs">bowling</span>
                            <span className="font-semibold text-gray-900">{bowlingTeam.name}</span>
                        </div>
                        <div className="mt-2 space-y-1">
                            {/* Current Bowler */}
                            <div className="flex items-baseline justify-end gap-1">
                                <span className="font-medium text-gray-900">{bowler}:</span>
                                <span className="text-gray-700">
                                    {(() => {
                                        const bowlerPlayer = bowlingTeam.players.find(p => p.name === bowler);
                                        if (bowlerPlayer) {
                                            const overs = ballsToOvers(bowlerPlayer.balls_bowled || 0);
                                            return `${overs} (${bowlerPlayer.wickets || 0})`;
                                        }
                                        return '0.0 (0)';
                                    })()}
                                </span>
                                <span className="text-blue-600">●</span>
                            </div>
                            {/* Previous Bowler */}
                            {previousBowler && (
                                <div className="flex items-baseline justify-end gap-1 pr-3">
                                    <span className="font-medium text-gray-700">:{previousBowler}</span>
                                    <span className="text-gray-600">
                                        {(() => {
                                            const prevBowlerPlayer = bowlingTeam.players.find(p => p.name === previousBowler);
                                            if (prevBowlerPlayer) {
                                                const overs = ballsToOvers(prevBowlerPlayer.balls_bowled || 0);
                                                return `${overs} (${prevBowlerPlayer.wickets || 0})`;
                                            }
                                            return '0.0 (0)';
                                        })()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Over */}
            {currentOver && currentOver.length > 0 && (
                <div className="px-4 py-3 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">This Over:</p>
                    <div className="flex gap-2">
                        {currentOver.map((ball, i) => (
                            <span
                                key={i}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${getBallClass(ball)}`}
                            >
                                {ball}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}