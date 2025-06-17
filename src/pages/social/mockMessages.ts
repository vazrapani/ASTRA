export const mockMessages = [
  {
    id: 1,
    user: '타로봇',
    lastMessage: '오늘의 운세를 확인해보세요!',
    time: '오전 10:30',
    unread: 2,
    messages: [
      { from: '타로봇', text: '오늘의 운세를 확인해보세요!', time: '오전 10:30' },
      { from: '나', text: '고마워요!', time: '오전 10:31' },
    ],
  },
  {
    id: 2,
    user: '친구1',
    lastMessage: '이번 주말에 뭐해?',
    time: '어제',
    unread: 0,
    messages: [
      { from: '친구1', text: '이번 주말에 뭐해?', time: '어제' },
      { from: '나', text: '아직 계획 없어!', time: '어제' },
    ],
  },
]; 