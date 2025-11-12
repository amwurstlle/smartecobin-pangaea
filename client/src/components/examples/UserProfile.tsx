import UserProfile from "../../pages/UserProfile";

export default function UserProfileExample() {
  return <UserProfile onLogout={() => console.log("Logged out")} />;
}
