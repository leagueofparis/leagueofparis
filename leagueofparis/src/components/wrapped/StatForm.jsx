import React, { useState, useEffect } from "react";
import { uploadImage } from "../../supabaseClient";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

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
			<div className="space-y-2">
				<Label htmlFor="title">
					Title <span className="text-destructive">*</span>
				</Label>
				<Input
					id="title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="e.g., Total Hours Streamed"
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="value">
					Value <span className="text-destructive">*</span>
				</Label>
				<Input
					id="value"
					type="text"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="e.g., 1,234 or League of Legends"
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					className="h-24"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Fun description or context for this stat (optional)"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="mediaUrl">Media URL</Label>
				<Input
					id="mediaUrl"
					type="url"
					value={mediaUrl}
					onChange={(e) => handleMediaUrlChange(e.target.value)}
					placeholder="Image, video, or Twitch clip URL (optional)"
					disabled={!!mediaFile}
				/>
			</div>

			{(mediaUrl || mediaFile) && (
				<div className="text-center text-sm text-muted-foreground">OR</div>
			)}

			<div className="space-y-2">
				<Label htmlFor="mediaFile">Upload Media</Label>
				<div className="relative">
					<Input
						id="mediaFileInput"
						type="file"
						onChange={handleMediaFileChange}
						className="cursor-pointer"
						accept="image/*,video/*"
						disabled={!!mediaUrl}
					/>
				</div>
				{mediaFile && (
					<div className="space-y-2 pt-2">
						<Label htmlFor="uploadKey">
							Upload Key <span className="text-destructive">*</span>
						</Label>
						<Input
							id="uploadKey"
							type="password"
							value={uploadKey}
							onChange={(e) => setUploadKey(e.target.value)}
							placeholder="Enter upload key"
							required
						/>
					</div>
				)}
			</div>

			{(mediaUrl || mediaFile) && (
				<div className="space-y-2">
					<Label>Preview</Label>
					<div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
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

			{error && (
				<div className="text-destructive text-sm text-center font-medium">{error}</div>
			)}

			<div className="flex gap-2 pt-2">
				<Button
					type="submit"
					className="flex-1"
					disabled={loading || !title.trim() || !value.trim()}
				>
					{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{loading ? "Saving..." : stat ? "Update Stat" : "Create Stat"}
				</Button>
				{onCancel && (
					<Button
						type="button"
						variant="ghost"
						onClick={onCancel}
						disabled={loading}
					>
						Cancel
					</Button>
				)}
			</div>
		</form>
	);
};

export default StatForm;
