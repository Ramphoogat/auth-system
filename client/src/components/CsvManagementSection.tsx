import { FiDownload, FiUpload } from "react-icons/fi";
import { useToast } from "./ToastProvider";
import type { IUser } from "../pages/admin/AdminComponents";

interface CsvManagementSectionProps {
    users: IUser[];
    showInfo: (msg: string) => void;
}

const CsvManagementSection: React.FC<CsvManagementSectionProps> = ({ users, showInfo }) => {
    const { showError, showSuccess } = useToast();

    const handleExportCSV = () => {
        if (users.length === 0) {
            showError("No users to export.");
            return;
        }
        const headers = ["Name", "Username", "Email", "Role"];
        const rows = users.map(u => [
            u.name || "",
            u.username,
            u.email,
            u.role
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess("Users exported successfully.");
    };

    const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const lines = text.split("\n");
            // Skip header and empty lines
            const dataLines = lines.filter(line => line.trim() !== "").slice(1);
            showInfo(`Ready to import ${dataLines.length} records. (Functionality would need specific backend endpoint)`);
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = "";
    };

    return (
        <div className="flex flex-wrap items-center gap-3 relative">
            <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition-all"
            >
                <FiDownload size={14} /> Export CSV
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-xs font-bold transition-all cursor-pointer">
                <FiUpload size={14} /> Import CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
            </label>
        </div>
    );
};

export default CsvManagementSection;
