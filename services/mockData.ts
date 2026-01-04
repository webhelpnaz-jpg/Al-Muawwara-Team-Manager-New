import { Team, Player, UserRole, User, TeamCategory, ScheduleEvent, AttendanceRecord } from '../types';

export const MOCK_TEAMS: Team[] = [
  { id: 't1', name: 'Rugby', category: TeamCategory.SPORTS, coachName: 'Rugby Coach', coachJoinedDate: '2020-01-15', icon: '🏉' },
  { id: 't2', name: 'Cricket', category: TeamCategory.SPORTS, coachName: 'Cricket Coach', coachJoinedDate: '2019-05-20', icon: '🏏' },
  { id: 't3', name: 'Football', category: TeamCategory.SPORTS, coachName: 'Football Coach', coachJoinedDate: '2021-03-10', icon: '⚽' },
  { id: 't4', name: 'Kung Fu', category: TeamCategory.SPORTS, coachName: 'Kung Fu Master', coachJoinedDate: '2018-11-01', icon: '🥋' },
  { id: 't5', name: 'Badminton', category: TeamCategory.SPORTS, coachName: 'Badminton Coach', coachJoinedDate: '2022-02-14', icon: '🏸' },
  { id: 't6', name: 'Swimming', category: TeamCategory.SPORTS, coachName: 'Swimming Coach', coachJoinedDate: '2020-08-30', icon: '🏊' },
  { id: 't7', name: 'Chess', category: TeamCategory.ACTIVITY, coachName: 'Chess Instructor', coachJoinedDate: '2015-06-01', icon: '♟️' },
  { id: 't8', name: 'Band', category: TeamCategory.ACTIVITY, coachName: 'Band Master', coachJoinedDate: '2017-09-15', icon: '🎺' },
  { id: 't9', name: 'Scouts', category: TeamCategory.ACTIVITY, coachName: 'Scout Master', coachJoinedDate: '2016-04-22', icon: '⚜️' },
];

const generateMockPlayers = (): Player[] => {
  const players: Player[] = [];
  const startYear = 2023;
  
  MOCK_TEAMS.forEach(team => {
    for (let i = 1; i <= 12; i++) {
      players.push({
        id: `p-${team.id}-${i}`,
        teamId: team.id,
        name: `Student ${team.id.toUpperCase()}-${i}`,
        grade: `${10 + (i % 3)}`, // Grades 10-12
        position: i === 1 ? 'Captain' : 'Member',
        contactParent: `077-${Math.floor(1000000 + Math.random() * 9000000)}`,
        dob: '2008-05-15',
        joinedDate: `${startYear}-01-10`,
        emergencyContactName: 'Guardian',
        emergencyContactPhone: `071-${Math.floor(1000000 + Math.random() * 9000000)}`,
        performanceNotes: i === 1 ? 'Excellent leadership skills.' : '',
        attendanceRate: Math.floor(70 + Math.random() * 30),
        status: Math.random() > 0.9 ? 'Medical' : 'Active',
      });
    }
  });
  return players;
};

export const MOCK_PLAYERS = generateMockPlayers();

export const MOCK_USERS: User[] = [
  // High-Level Access
  { id: 'u1', name: 'Principal', username: 'principal', password: 'password123', role: UserRole.PRINCIPAL, avatarUrl: 'https://picsum.photos/100/100?random=1' },
  { id: 'u2', name: 'Master In-Charge', username: 'mic', password: 'password123', role: UserRole.MASTER_IN_CHARGE, avatarUrl: 'https://picsum.photos/100/100?random=2' },
  { id: 'u-admin', name: 'Administrator', username: 'admin', password: 'admin', role: UserRole.ADMIN, avatarUrl: 'https://picsum.photos/100/100?random=5' },
  
  // Specific Coach Access (9 teams)
  { id: 'u-c1', name: 'Rugby Coach', username: 'rugby_coach', password: 'password123', role: UserRole.COACH, assignedTeamId: 't1', avatarUrl: 'https://picsum.photos/100/100?random=3' },
  { id: 'u-c2', name: 'Cricket Coach', username: 'cricket_coach', password: 'password123', role: UserRole.COACH, assignedTeamId: 't2', avatarUrl: 'https://picsum.photos/100/100?random=4' },
  { id: 'u-c3', name: 'Football Coach', username: 'football_coach', password: 'password123', role: UserRole.COACH, assignedTeamId: 't3', avatarUrl: 'https://picsum.photos/100/100?random=10' },
  { id: 'u-c4', name: 'Kung Fu Master', username: 'kungfu_coach', password: 'password123', role: UserRole.COACH, assignedTeamId: 't4', avatarUrl: 'https://picsum.photos/100/100?random=11' },
  { id: 'u-c5', name: 'Badminton Coach', username: 'badminton_coach', password: 'password123', role: UserRole.COACH, assignedTeamId: 't5', avatarUrl: 'https://picsum.photos/100/100?random=12' },
  { id: 'u-c6', name: 'Swimming Coach', username: 'swimming_coach', password: 'password123', role: UserRole.COACH, assignedTeamId: 't6', avatarUrl: 'https://picsum.photos/100/100?random=13' },
  { id: 'u-c7', name: 'Chess Instructor', username: 'chess_coach', password: 'password123', role: UserRole.COACH, assignedTeamId: 't7', avatarUrl: 'https://picsum.photos/100/100?random=14' },
  { id: 'u-c8', name: 'Band Master', username: 'band_coach', password: 'password123', role: UserRole.COACH, assignedTeamId: 't8', avatarUrl: 'https://picsum.photos/100/100?random=15' },
  { id: 'u-c9', name: 'Scout Master', username: 'scouts_coach', password: 'password123', role: UserRole.COACH, assignedTeamId: 't9', avatarUrl: 'https://picsum.photos/100/100?random=16' },

  // Parent Access - Linked to several mock students for demo
  { id: 'u-p1', name: 'Parent', username: 'parent', password: 'password123', role: UserRole.PARENT, linkedPlayerIds: [MOCK_PLAYERS[0].id, MOCK_PLAYERS[15].id, MOCK_PLAYERS[30].id], avatarUrl: 'https://picsum.photos/100/100?random=6' },
];

export const MOCK_SCHEDULE: ScheduleEvent[] = [
  { id: 'e1', teamId: 't1', title: 'Morning Practice', date: new Date().toISOString().split('T')[0], startTime: '06:00', endTime: '08:00', location: 'School Ground', type: 'Practice' },
  { id: 'e2', teamId: 't2', title: 'Net Practice', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '15:00', endTime: '17:30', location: 'Main Pitch', type: 'Practice' },
  { id: 'e3', teamId: 't3', title: 'Friendly Match', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], startTime: '16:00', endTime: '18:00', location: 'City Stadium', type: 'Match' },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', playerId: MOCK_PLAYERS[0].id, teamId: 't1', date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], status: 'Present' },
  { id: 'a2', playerId: MOCK_PLAYERS[0].id, teamId: 't1', date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], status: 'Medical' },
  { id: 'a3', playerId: MOCK_PLAYERS[0].id, teamId: 't1', date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], status: 'Absent' },
];