import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/app/generated/prisma";

type UsersState = {
  users: User[];
  currentPage: number;
  pageSize: number;
  total: number;
  pages: { [pageNumber: number]: User[] };
  fetchedPages: number[];
};

const initialState: UsersState = {
  users: [],
  // Pagination state
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pages: {}, // { [pageNumber: number]: User[] }
  fetchedPages: [],
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
    },
    setTotal(state, action: PayloadAction<number>) {
      state.total = action.payload;
    },
    setPages(state, action: PayloadAction<{ [pageNumber: number]: User[] }>) {
      state.pages = action.payload;
    },
    setFetchedPages(state, action: PayloadAction<number[]>) {
      state.fetchedPages = action.payload;
    },
    addUser(state, action: PayloadAction<User>) {
      state.users.push(action.payload);
    },
    updateUser(state, action: PayloadAction<User>) {
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUser(state, action: PayloadAction<string>) {
      state.users = state.users.filter((user) => user.id !== action.payload);
    },
  },
});

export const {} = usersSlice.actions;

export default usersSlice.reducer;
