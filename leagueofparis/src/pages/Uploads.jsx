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
		if (!file) {
			setStatus("Please select a file.");
			return;
		}
		setStatus("Uploading...");
		try {
			if (multiple) {
				for (const f of file) {
					await uploadImage(f, folder);
				}
			} else {
				await uploadImage(file, folder);
			}
			setStatus("Upload successful!");
			setFile(null);
		} catch (err) {
			setStatus("Upload failed: " + err.message);
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
