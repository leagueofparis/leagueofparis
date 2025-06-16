import React, { useState } from "react";
import { uploadImage, invokeEdgeFunction } from "../supabaseClient";

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
	const [currentIndex, setCurrentIndex] = useState(0);
	const [totalFiles, setTotalFiles] = useState(0);
	const [currentFileName, setCurrentFileName] = useState("");
	const [isConverting, setIsConverting] = useState(false);

	const handleChange = (e) => {
		if (multiple) {
			setFile(e.target.files);
		} else {
			setFile(e.target.files[0]);
		}
		setStatus("");
		setCurrentIndex(0);
		setTotalFiles(0);
		setCurrentFileName("");
		setIsConverting(false);
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

		if (multiple) {
			setTotalFiles(file.length);
		} else {
			setTotalFiles(1);
		}
		setCurrentIndex(0);
		setStatus("");

		try {
			if (multiple) {
				for (let i = 0; i < file.length; i++) {
					const f = file[i];
					setCurrentIndex(i + 1);
					setCurrentFileName(f.name);
					setIsConverting(false);

					// Check if file needs conversion
					if (
						f.type === "image/heic" ||
						f.name.toLowerCase().endsWith(".heic")
					) {
						setIsConverting(true);
						setStatus(`Converting ${f.name} (${i + 1}/${file.length})...`);
					} else {
						setStatus(`Uploading ${f.name} (${i + 1}/${file.length})...`);
					}
					await uploadImage(f, folder);
					setIsConverting(false);
				}
			} else {
				setCurrentIndex(1);
				setCurrentFileName(file.name);
				setIsConverting(false);
				if (
					file.type === "image/heic" ||
					file.name.toLowerCase().endsWith(".heic")
				) {
					setIsConverting(true);
					setStatus(`Converting ${file.name} (1/1)...`);
				} else {
					setStatus(`Uploading ${file.name} (1/1)...`);
				}
				await uploadImage(file, folder);
				setIsConverting(false);
				//await sendDiscordWebhook(message || `New upload to ${folder}`, file);
			}

			setStatus("Upload successful!");
			setFile(null);
			setMessage("");
			setCurrentIndex(0);
			setTotalFiles(0);
			setCurrentFileName("");
			setIsConverting(false);
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
				{/* Status/Progress Bar */}
				{totalFiles > 0 && currentIndex > 0 && (
					<div className="w-full mt-2">
						<div className="text-center text-sm mb-1">
							{isConverting
								? `Converting ${currentFileName} (${currentIndex}/${totalFiles})...`
								: `Uploading ${currentFileName} (${currentIndex}/${totalFiles})...`}
						</div>
						<div className="w-full bg-base-200 rounded-full h-2">
							<div
								className="bg-primary h-2 rounded-full transition-all duration-300"
								style={{ width: `${(currentIndex / totalFiles) * 100}%` }}
							></div>
						</div>
					</div>
				)}
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
			<div className="mx-auto max-w-6xl">
				<h1 className="text-3xl font-extrabold mb-2 text-base-content">
					Uploads
				</h1>
				<p className="mb-8 text-base-content/70 text-lg">
					Upload files to the appropriate section below.
				</p>
				<div className="flex flex-col md:flex-row gap-8 justify-center flex-wrap">
					<UploadContainer title="Schedule Uploads" folder="schedules" />
					<UploadContainer
						title="Willow Wednesday Uploads"
						folder="willow-wednesdays"
						multiple={true}
					/>
					<UploadContainer title="Art Gallery" folder="art" multiple={true} />
				</div>
			</div>
		</div>
	);
}
