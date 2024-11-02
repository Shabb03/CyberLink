import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
  BlockedUsers: undefined;
  ChangePassword: undefined;
  Chat: { userId: number, receiverId: number };
  Comments: { postId: number };
  CreatePost: undefined;
  DeleteAccount: undefined;
  EditProfile: undefined;
  Follow: undefined;
  Messages: { currentUserId: number };
  Notifications: undefined;
  Post: undefined;
  Profile: undefined;
  Search: undefined;
  Settings: undefined;
  UserProfile: undefined;
};