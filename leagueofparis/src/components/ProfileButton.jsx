import { useUser } from "../contexts/UserContext";
import { supabase } from "../supabaseClient";

export default function ProfileButton() {
	const { user } = useUser();

	const handleLogout = async () => {
		await supabase.auth.signOut();
	};

	return (
		<div className="dropdown dropdown-end">
			<button tabIndex={0} className="btn btn-ghost btn-circle avatar">
				<img
					src={user.user_metadata.avatar_url}
					className="h-10 w-10 rounded-full cursor-pointer"
					alt={user.user_metadata.full_name}
				/>
			</button>
			<ul
				tabIndex={0}
				className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-neutral rounded-box w-52"
			>
				<li>
					<a onClick={handleLogout} className="text-rose-900 font-bold">
						Logout
					</a>
				</li>
			</ul>
		</div>
	);
}
