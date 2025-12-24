import React, { useState, useEffect } from "react";
import { uploadImage } from "../../supabaseClient";

const StatForm = ({ stat, onSubmit, onCancel, loading }) => {
	const [title, setTitle] = useState("");
	const [value, setValue] = useState("");
	const [description, setDescription] = useState("");
	const [mediaType, setMediaType] = useState("");
	const [mediaUrl, setMediaUrl] = useState("");
	const [mediaFile, setMediaFile] = useState(null);
	const [uploadKey, setUploadKey] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (stat) {
			setTitle(stat.title || "");
			setValue(stat.value || "");
			setDescription(stat.description || "");
			setMediaType(stat.media_type || "");
			setMediaUrl(stat.media_url || "");
			setMediaFile(null);
			setUploadKey("");
		} else {
			resetForm();
		}
	}, [stat]);

	const resetForm = () => {
		setTitle("");
		setValue("");
		setDescription("");
		setMediaType("");
		setMediaUrl("");
		setMediaFile(null);
		setUploadKey("");
		setError("");
	};

	const handleMediaFileChange = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			setMediaFile(file);
			setMediaUrl(""); // Clear URL if file is selected
			// Detect media type
			if (file.type.startsWith("image/")) {
				setMediaType("image");
			} else if (file.type.startsWith("video/")) {
				setMediaType("video");
			}
		}
	};

	const handleMediaUrlChange = (url) => {
		setMediaUrl(url);
		setMediaFile(null); // Clear file if URL is entered
		// Detect media type from URL
		if (url) {
			const urlLower = url.toLowerCase();
			if (
				urlLower.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i) ||
				urlLower.includes("image")
			) {
				setMediaType("image");
			} else if (
				urlLower.match(/\.(mp4|webm|ogg|mov)$/i) ||
				urlLower.includes("video") ||
				urlLower.includes("twitch.tv/clip")
			) {
				setMediaType("video");
			} else if (urlLower.includes("twitch.tv/clip")) {
				setMediaType("video");
			}
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (!title.trim()) {
			setError("Please enter a title.");
			return;
		}

		if (!value.trim()) {
			setError("Please enter a value.");
			return;
		}

		try {
			let finalMediaUrl = mediaUrl;
			let finalMediaType = mediaType;

			// Upload media if file is selected
			if (mediaFile) {
				if (!uploadKey.trim()) {
					setError("Please enter upload key for media upload.");
					return;
				}
				const uploadedUrl = await uploadImage(
					mediaFile,
					"wrapped-stats",
					uploadKey
				);
				finalMediaUrl = uploadedUrl;
			}

			const statData = {
				title: title.trim(),
				value: value.trim(),
				description: description.trim() || null,
				media_type: finalMediaType || null,
				media_url: finalMediaUrl || null,
			};

			onSubmit(statData);
		} catch (err) {
			console.error("Error saving stat:", err);
			setError("Failed to save stat: " + err.message);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{/* Title */}
			<div>
				<label className="label">
					<span className="label-text text-primary">
						Title <span className="text-red-500">*</span>
					</span>
				</label>
				<input
					type="text"
					className="input input-bordered w-full"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="e.g., Total Hours Streamed"
					required
				/>
			</div>

			{/* Value */}
			<div>
				<label className="label">
					<span className="label-text text-primary">
						Value <span className="text-red-500">*</span>
					</span>
				</label>
				<input
					type="text"
					className="input input-bordered w-full"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="e.g., 1,234 or League of Legends"
					required
				/>
			</div>

			{/* Description */}
			<div>
				<label className="label">
					<span className="label-text text-primary">Description</span>
				</label>
				<textarea
					className="textarea textarea-bordered w-full h-24"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Fun description or context for this stat (optional)"
				/>
			</div>

			{/* Media URL Input */}
			<div>
				<label className="label">
					<span className="label-text text-primary">Media URL</span>
				</label>
				<input
					type="url"
					className="input input-bordered w-full"
					value={mediaUrl}
					onChange={(e) => handleMediaUrlChange(e.target.value)}
					placeholder="Image, video, or Twitch clip URL (optional)"
					disabled={!!mediaFile}
				/>
			</div>

			{/* OR divider */}
			{(mediaUrl || mediaFile) && (
				<div className="text-center text-sm text-base-content/70">OR</div>
			)}

			{/* File Upload */}
			<div>
				<label className="label">
					<span className="label-text text-primary">Upload Media</span>
				</label>
				<div className="relative">
					<input
						id="mediaFileInput"
						type="file"
						onChange={handleMediaFileChange}
						className="hidden"
						accept="image/*,video/*"
						disabled={!!mediaUrl}
					/>
					<label
						htmlFor="mediaFileInput"
						className={`btn btn-secondary w-full text-white cursor-pointer ${
							mediaUrl ? "btn-disabled" : ""
						}`}
					>
						{mediaFile ? mediaFile.name : "Upload Image or Video"}
					</label>
				</div>
				{mediaFile && (
					<div className="mt-2">
						<label className="label">
							<span className="label-text text-primary">
								Upload Key <span className="text-red-500">*</span>
							</span>
						</label>
						<input
							type="password"
							className="input input-bordered w-full"
							value={uploadKey}
							onChange={(e) => setUploadKey(e.target.value)}
							placeholder="Enter upload key"
							required
						/>
					</div>
				)}
			</div>

			{/* Preview */}
			{(mediaUrl || mediaFile) && (
				<div>
					<label className="label">
						<span className="label-text text-primary">Preview</span>
					</label>
					<div className="w-full h-48 bg-base-300 rounded-lg flex items-center justify-center overflow-hidden">
						{mediaFile ? (
							mediaType === "image" ? (
								<img
									src={URL.createObjectURL(mediaFile)}
									alt="Preview"
									className="max-w-full max-h-full object-contain"
								/>
							) : (
								<video
									src={URL.createObjectURL(mediaFile)}
									controls
									className="max-w-full max-h-full"
								/>
							)
						) : mediaUrl ? (
							mediaType === "image" ? (
								<img
									src={mediaUrl}
									alt="Preview"
									className="max-w-full max-h-full object-contain"
									onError={(e) => {
										e.target.style.display = "none";
									}}
								/>
							) : (
								<video src={mediaUrl} controls className="max-w-full max-h-full" />
							)
						) : null}
					</div>
				</div>
			)}

			{/* Error Message */}
			{error && (
				<div className="text-red-600 text-sm text-center">{error}</div>
			)}

			{/* Buttons */}
			<div className="flex gap-2">
				<button
					type="submit"
					className="btn btn-primary flex-1"
					disabled={loading || !title.trim() || !value.trim()}
				>
					{loading ? "Saving..." : stat ? "Update Stat" : "Create Stat"}
				</button>
				{onCancel && (
					<button
						type="button"
						className="btn btn-ghost"
						onClick={onCancel}
						disabled={loading}
					>
						Cancel
					</button>
				)}
			</div>
		</form>
	);
};

export default StatForm;

