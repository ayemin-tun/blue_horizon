import PasswordRequestTable from "./components/PasswordRequestTable";

export const metadata = {
  title: "Password Reset Requests - Admin Dashboard",
};

export default function PasswordRequestPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header Layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-blue-950 tracking-tight">
            Password Reset Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and resolve agent password assistance requests.
          </p>
        </div>
      </div>

      {/* Table Component Section */}
      <div className="w-full">
        <PasswordRequestTable />
      </div>
    </div>
  );
}