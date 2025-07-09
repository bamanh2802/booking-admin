export interface QuickAction {
  _id: string;
  phone: string;
  title: string;
  isDone: boolean; 
  userId: string | null;
  createdAt: string;
  userInfo?: { 
    _id: string;
    email: string;
  };
}