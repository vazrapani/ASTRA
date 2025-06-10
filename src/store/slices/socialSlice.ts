import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Friend {
  id: string;
  nickname: string;
  profileImage: string;
  lastActive: Date;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

interface SocialState {
  friends: Friend[];
  messages: Message[];
  selectedFriend: Friend | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SocialState = {
  friends: [],
  messages: [],
  selectedFriend: null,
  isLoading: false,
  error: null,
};

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    setFriends: (state, action: PayloadAction<Friend[]>) => {
      state.friends = action.payload;
    },
    addFriend: (state, action: PayloadAction<Friend>) => {
      state.friends.push(action.payload);
    },
    removeFriend: (state, action: PayloadAction<string>) => {
      state.friends = state.friends.filter(friend => friend.id !== action.payload);
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setSelectedFriend: (state, action: PayloadAction<Friend | null>) => {
      state.selectedFriend = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setFriends,
  addFriend,
  removeFriend,
  setMessages,
  addMessage,
  setSelectedFriend,
  setLoading,
  setError,
} = socialSlice.actions;

export default socialSlice.reducer; 