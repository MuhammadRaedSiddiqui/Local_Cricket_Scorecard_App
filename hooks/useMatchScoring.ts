import { useReducer, useCallback, useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Match, ScoringState, ScoringAction, Ball } from '@/types/match'
import {
  validateBallUpdate,
  calculateBallOutcome,
} from '@/utils/scoringValidations'
import { apiCall } from '@/utils/apiHelpers'
import { pusherClient } from '@/lib/pusher-client'

export const initialScoringState: ScoringState = {
  selectedBatsman1: '',
  selectedBatsman2: '',
  selectedBowler: '',
  previousBowler: '',
  currentStriker: 'batsman1',
  currentOver: [],
  outBatsmen: [],
  currentInnings: 1,
  extraRuns: 0,
}

const scoringReducer = (
  state: ScoringState,
  action: ScoringAction
): ScoringState => {
  switch (action.type) {
    case 'SET_BATSMAN_1':
      return { ...state, selectedBatsman1: action.payload }
    case 'SET_BATSMAN_2':
      return { ...state, selectedBatsman2: action.payload }
    case 'SET_BOWLER':
      return { ...state, selectedBowler: action.payload }
    case 'SET_STRIKER':
      return { ...state, currentStriker: action.payload }
    case 'ROTATE_STRIKE':
      return {
        ...state,
        currentStriker:
          state.currentStriker === 'batsman1' ? 'batsman2' : 'batsman1',
      }
    case 'ADD_TO_CURRENT_OVER':
      return { ...state, currentOver: [...state.currentOver, action.payload] }
    case 'COMPLETE_OVER':
      return {
        ...state,
        currentOver: [],
        previousBowler: state.selectedBowler,
        selectedBowler: '', // Clear for new selection
        currentStriker:
          state.currentStriker === 'batsman1' ? 'batsman2' : 'batsman1',
      }
    case 'WICKET':
      // *** THIS IS A KEY FIX ***
      // When a wicket falls, we MUST clear the slot of the out batsman
      const outBatsmanName = action.payload;
      return {
        ...state,
        outBatsmen: [...state.outBatsmen, outBatsmanName],
        // If batsman 1 was out, clear his slot. Otherwise, keep him.
        selectedBatsman1: state.selectedBatsman1 === outBatsmanName ? '' : state.selectedBatsman1,
        // If batsman 2 was out, clear his slot. Otherwise, keep him.
        selectedBatsman2: state.selectedBatsman2 === outBatsmanName ? '' : state.selectedBatsman2,
      };
    case 'RESET_FOR_INNINGS':
      return {
        ...initialScoringState,
        currentInnings: state.currentInnings + 1,
      }
    case 'SET_EXTRA_RUNS':
      return { ...state, extraRuns: action.payload }
    case 'RESTORE_STATE':
      console.log('🔄 REDUCER: Restoring state to:', action.payload)
      return action.payload
    default:
      return state
  }
}


export const useMatchScoring = (matchId: string) => {
  const router = useRouter()
  const [scoringState, dispatch] = useReducer(
    scoringReducer,
    initialScoringState
  )

  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStateRestored, setIsStateRestored] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // For double-click protection
  const lastUpdateTimestamp = useRef<number>(0);

  // --- 1. STATE SYNC FUNCTION ---
  const syncStateFromServer = useCallback((serverData: Match, message?: string) => {
    const serverTimestamp = new Date(serverData.updatedAt).getTime();
    if (serverTimestamp < lastUpdateTimestamp.current && message) {
      console.log('[Sync] Ignoring stale Pusher update');
      return;
    }

    console.log('[Sync] Syncing state from server', serverData);
    lastUpdateTimestamp.current = serverTimestamp;

    setMatch(serverData);

    if (serverData.scoringState) {
      dispatch({ type: 'RESTORE_STATE', payload: serverData.scoringState });
    } else {
      if (serverData.status === 'completed') {
        toast.success('Match is complete!');
        router.push(`/matches/${matchId}`);
      }
    }

    if (message) {
      toast(message, { icon: '🏏', duration: 2000 });
    }
  }, [matchId, router]);


  // --- 2. PUSHER LISTENER ---
  useEffect(() => {
    if (!matchId) return;
    let userId: string | null = null;
    try {
      const userData = localStorage.getItem('user');
      if (userData) userId = JSON.parse(userData).id;
    } catch (e) { console.error("Failed to parse user for Pusher"); }

    if (!userId) {
      console.error("No user ID found, can't subscribe to real-time updates");
      return;
    }

    const channelName = `private-user-${userId}`;
    let channel: any;
    try {
      channel = pusherClient.subscribe(channelName);
      channel.bind('pusher:subscription_succeeded', () => {
        console.log(`[Pusher] Subscribed to ${channelName}`);
      });
      channel.bind('pusher:subscription_error', (status: any) => {
        console.error(`[Pusher] Subscription failed:`, status);
      });

      channel.bind('match-updated', (data: any) => {
        console.log('[Pusher] Received match-updated event:', data);
        if (data.matchId === matchId) {
          // The event payload (data) is the new, full Match object
          syncStateFromServer(data as Match, 'Match updated!');
        }
      });
    } catch (e) {
      console.error('Failed to subscribe to Pusher:', e);
    }

    return () => {
      if (channel) {
        pusherClient.unsubscribe(channelName);
      }
    };
  }, [matchId, syncStateFromServer]);


  // --- 3. INITIAL DATA FETCH ---
  const fetchMatch = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/matches/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to load match');
      }

      const data = await response.json();
      syncStateFromServer(data.data);
      setIsStateRestored(true);

    } catch (err: any) {
      toast.error(err.message || 'Failed to load match');
      router.push(`/matches/${matchId}`);
    } finally {
      setLoading(false);
    }
  }, [matchId, router, syncStateFromServer]);


  // --- 4. SERVER ACTIONS (Event Triggers) ---

  const recordBall = useCallback(
    async (outcome: string, providedExtraRuns?: number) => {
      if (isSubmitting || !match) return;

      const battingTeam = match.batting_team === match.teamOne.name ? match.teamOne : match.teamTwo;
      if (!battingTeam) return;

      const errors = validateBallUpdate(match, outcome, battingTeam, scoringState.currentInnings);
      if (errors.some((e) => e.type === 'error')) {
        toast.error(errors[0].message);
        return;
      }

      setIsSubmitting(true);
      const extraRunsToUse = providedExtraRuns ?? 0;

      // --- Optimistic UI Update ---
      const { isWicket, shouldRotateStrike } =
        calculateBallOutcome(outcome, extraRunsToUse);

      dispatch({ type: 'ADD_TO_CURRENT_OVER', payload: outcome });
      if (isWicket) {
        const currentBatsman = scoringState.currentStriker === 'batsman1'
          ? scoringState.selectedBatsman1
          : scoringState.selectedBatsman2;
        dispatch({ type: 'WICKET', payload: currentBatsman });
      } else if (shouldRotateStrike) {
        dispatch({ type: 'ROTATE_STRIKE' });
      }
      const legalBalls = [...scoringState.currentOver, outcome].filter(b => b !== 'WD' && b !== 'NB').length;
      if (legalBalls === 6) {
        dispatch({ type: 'COMPLETE_OVER' });
      }
      // --- End Optimistic UI ---

      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/matches/${matchId}/record-ball`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ outcome, extraRuns: extraRunsToUse }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to save ball event');
        }

        // Sync with authoritative server state
        syncStateFromServer(data.data);

      } catch (err: any) {
        toast.error(`Error: ${err.message}`);
        fetchMatch(); // Rollback on error
      } finally {
        setIsSubmitting(false);
      }
    },
    [matchId, isSubmitting, syncStateFromServer, match, scoringState, fetchMatch]
  );

  // This is a "full state" update, so it calls the old API
  const saveFullState = useCallback(async (updates: Partial<Match>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/matches/${matchId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates), // Send only the specific updates
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      syncStateFromServer(data.data, 'State saved!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [matchId, isSubmitting, syncStateFromServer]);

  const [isUndoing, setIsUndoing] = useState(false);

  const undoLastBall = async () => {
    if (!match || !match.ballHistory || match.ballHistory.length === 0) {
      toast.error('No balls to undo');
      return;
    }

    setIsUndoing(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/matches/${matchId}/undo-ball`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to undo ball');
      }

      const data = await response.json();
      setMatch(data.data);
      toast.success('Last ball undone successfully');
      await fetchMatch();

    } catch (error: any) {
      console.error('Undo error:', error);
      toast.error(error.message || 'Failed to undo last ball');
    } finally {
      setIsUndoing(false);
    }
  };

  const canUndo = match?.ballHistory && match.ballHistory.length > 0 && !isUndoing && !isSubmitting;

 

  // --- 5. DERIVED STATE ---
  const battingTeam = match?.batting_team === match?.teamOne.name ? match?.teamOne : match?.teamTwo;
  const bowlingTeam = match?.bowling_team === match?.teamOne.name ? match?.teamOne : match?.teamTwo;

  return {
    match,
    loading,
    isSubmitting,
    scoringState,
    dispatch,
    battingTeam,
    bowlingTeam,
    fetchMatch,
    recordBall,
    saveFullState, // Use this for Toss, Player Select
    isStateRestored,
    undoLastBall,
    canUndo,
    isUndoing,
  };
};