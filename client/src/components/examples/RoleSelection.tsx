import RoleSelection from "../../pages/RoleSelection";

export default function RoleSelectionExample() {
  return <RoleSelection onRoleSelect={(role) => console.log("Role selected:", role)} />;
}
