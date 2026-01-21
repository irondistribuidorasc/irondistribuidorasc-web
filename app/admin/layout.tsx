import { AdminBottomNav } from "@/src/components/admin/AdminBottomNav";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			{/* Padding inferior para compensar a bottom nav no mobile */}
			<div className="pb-20 md:pb-0">{children}</div>
			<AdminBottomNav />
		</>
	);
}
