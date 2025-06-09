import React, { useState } from "react";
import {
	uploadImage,
	invokeEdgeFunction,
	getImageUrl,
} from "../supabaseClient";

async function validateUploadKey(key) {
	const { data, error } = await invokeEdgeFunction("validate-secret", key);
	if (error) {
		throw error;
	}
	return data;
}

function UploadContainer({ title, folder, multiple = false }) {
	const [file, setFile] = useState(null);
	const [status, setStatus] = useState("");
	const [key, setKey] = useState("");
	const [message, setMessage] = useState("");

	const handleChange = (e) => {
		if (multiple) {
			setFile(e.target.files);
		} else {
			setFile(e.target.files[0]);
		}
		setStatus("");
	};

	const handleUpload = async () => {
		try {
			await validateUploadKey(key);
		} catch {
			setStatus("Invalid upload key.");
			return;
		}
		if (!file || (multiple && file.length === 0)) {
			setStatus("Please select a file.");
			return;
		}

		setStatus("Uploading...");

		try {
			if (multiple) {
				for (const f of file) {
					await uploadImage(f, folder); // still upload to Supabase if ne
				}
			} else {
				await uploadImage(file, folder);
				await sendDiscordWebhook(message || `New upload to ${folder}`, file);
			}

			setStatus("Upload successful!");
			setFile(null);
			setMessage("");
		} catch (err) {
			setStatus("Upload failed: " + err.message);
		}
	};

	const sendDiscordWebhook = async (message, file) => {
		const webhookUrl =
			"https://discord.com/api/webhooks/1381780518999162900/j-QCrbbynbM75BURLg-2BaUmoXt9qSf1vuWDJfjdP4-6FDOivu4ZG2OiGyLReH3NOwQQ";

		const formData = new FormData();
		formData.append("file", file, file.name); // attach file from input

		formData.append(
			"payload_json",
			JSON.stringify({
				content: message || "File uploaded!",
				username: "Paris",
				avatar_url:
					"https://cdn.discordapp.com/avatars/1288610223896006778/59676ebfb59a83ead87a69a69ccb085c.webp?size=1024",
				// No embeds!
			})
		);

		try {
			const res = await fetch(webhookUrl, {
				method: "POST",
				body: formData,
			});
			if (!res.ok) {
				const errorText = await res.text();
				console.error("Discord webhook error:", errorText);
			}
		} catch (error) {
			console.error("Failed to send webhook:", error);
		}
	};

	return (
		<div className="card bg-base-300 shadow-xl w-full max-w-md mx-auto my-6">
			<div className="card-body items-center">
				<h2 className="card-title text-lg font-bold mb-2">{title}</h2>
				<input
					type="file"
					onChange={handleChange}
					className="file-input file-input-bordered w-full max-w-xs mb-3"
					multiple={multiple}
				/>
				<input
					type="password"
					placeholder="Upload key"
					className="input input-bordered w-full max-w-xs mb-3"
					value={key}
					onChange={(e) => setKey(e.target.value)}
				/>
				{folder === "schedules" && (
					<input
						type="text"
						placeholder="Schedule message (optional)"
						className="input input-bordered w-full max-w-xs mb-3"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
				)}
				<button
					onClick={handleUpload}
					className="btn btn-primary w-full"
					disabled={status === "Uploading..."}
				>
					{status === "Uploading..." ? "Uploading..." : "Upload"}
				</button>
				<div
					className={`mt-2 min-h-[24px] text-center font-medium ${status.includes("failed") || status.includes("Invalid") ? "text-red-200" : status ? "text-success" : ""}`}
				>
					{status}
				</div>
			</div>
		</div>
	);
}

export default function Uploads() {
	return (
		<div className="min-h-screen py-10 px-2">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-extrabold mb-2 text-base-content">
					Uploads
				</h1>
				<p className="mb-8 text-base-content/70 text-lg">
					Upload files to the appropriate section below.
				</p>
				<div className="flex flex-col md:flex-row gap-8 justify-center">
					<UploadContainer title="Schedule Uploads" folder="schedules" />
					<UploadContainer
						title="Willow Wednesday Uploads"
						folder="willow-wednesdays"
						multiple={true}
					/>
				</div>
			</div>
		</div>
	);
}
