import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Team, Player, ScheduleEvent, AttendanceRecord, User, UserRole, TeamCategory } from '../types';
import { MOCK_TEAMS, MOCK_PLAYERS, MOCK_SCHEDULE, MOCK_ATTENDANCE, MOCK_USERS } from '../services/mockData';

interface DataContextType {
  teams: Team[];
  players: Player[];
  users: User[];
  schedule: ScheduleEvent[];
  attendance: AttendanceRecord[];
  addPlayer: (player: Player) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;
  addTeam: (team: Team) => void;
  updateTeam: (team: Team) => void;
  deleteTeam: (teamId: string) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  markAttendance: (records: AttendanceRecord[]) => void;
  addEvent: (event: ScheduleEvent) => void;
  getPlayersByTeam: (teamId: string) => Player[];
  getEventsByTeam: (teamId: string) => ScheduleEvent[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>(MOCK_SCHEDULE);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);

  const addPlayer = (player: Player) => {
    setPlayers(prev => [...prev, player]);
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };

  const deletePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const addTeam = (team: Team) => {
    setTeams(prev => [...prev, team]);
    // Automatically create a coach user for the new team
    const coachUsername = `${team.name.toLowerCase().replace(/\s+/g, '_')}_coach`;
    const newCoach: User = {
      id: `u-auto-${Date.now()}`,
      name: `${team.name} Coach`,
      username: coachUsername,
      password: 'password123',
      role: UserRole.COACH,
      assignedTeamId: team.id,
      avatarUrl: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 100)}`
    };
    setUsers(prev => [...prev, newCoach]);
  };

  const updateTeam = (updatedTeam: Team) => {
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
  };

  const deleteTeam = (teamId: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
    setPlayers(prev => prev.filter(p => p.teamId !== teamId));
    setUsers(prev => prev.filter(u => u.assignedTeamId !== teamId));
  };

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const markAttendance = (records: AttendanceRecord[]) => {
    setAttendance(prev => {
        const newIds = new Set(records.map(r => `${r.playerId}-${r.date}`));
        const filtered = prev.filter(r => !newIds.has(`${r.playerId}-${r.date}`));
        return [...filtered, ...records];
    });
  };

  const addEvent = (event: ScheduleEvent) => {
    setSchedule(prev => [...prev, event]);
  };

  const getPlayersByTeam = (teamId: string) => players.filter(p => p.teamId === teamId);
  const getEventsByTeam = (teamId: string) => schedule.filter(e => e.teamId === teamId);

  const value = useMemo(() => ({
    teams,
    players,
    users,
    schedule,
    attendance,
    addPlayer,
    updatePlayer,
    deletePlayer,
    addTeam,
    updateTeam,
    deleteTeam,
    addUser,
    updateUser,
    deleteUser,
    markAttendance,
    addEvent,
    getPlayersByTeam,
    getEventsByTeam
  }), [teams, players, users, schedule, attendance]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};