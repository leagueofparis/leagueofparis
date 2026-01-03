import React, { useState, useEffect } from "react";
import { uploadImage } from "../../supabaseClient";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";

// Leaderboard Entry Editor Component
const LeaderboardEntryEditor = ({ entries, onChange, maxEntries = 10, showImages = true, label = "Entries" }) => {
	const addEntry = () => {
		if (entries.length >= maxEntries) return;
		onChange([...entries, { name: "", value: "", image_url: "" }]);
	};

	const updateEntry = (index, field, value) => {
		const newEntries = [...entries];
		newEntries[index] = { ...newEntries[index], [field]: value };
		onChange(newEntries);
	};

	const removeEntry = (index) => {
		const newEntries = entries.filter((_, i) => i !== index);
		onChange(newEntries);
	};

	const moveEntry = (index, direction) => {
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= entries.length) return;
		const newEntries = [...entries];
		[newEntries[index], newEntries[newIndex]] = [newEntries[newIndex], newEntries[index]];
		onChange(newEntries);
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<Label className="text-base font-semibold">{label}</Label>
				<span className="text-sm text-muted-foreground">
					{entries.length}/{maxEntries}
				</span>
			</div>

			{entries.map((entry, index) => (
				<div
					key={index}
					className="flex gap-2 items-start p-3 bg-muted/50 rounded-lg border border-border"
				>
					{/* Rank indicator */}
					<div className="flex flex-col items-center justify-center min-w-[40px] pt-2">
						<span className="text-lg font-bold text-muted-foreground">
							#{index + 1}
						</span>
						<div className="flex flex-col gap-1 mt-2">
							<button
								type="button"
								onClick={() => moveEntry(index, -1)}
								disabled={index === 0}
								className="p-1 hover:bg-muted rounded disabled:opacity-30"
								title="Move up"
							>
								<GripVertical className="h-3 w-3 rotate-90" />
							</button>
							<button
								type="button"
								onClick={() => moveEntry(index, 1)}
								disabled={index === entries.length - 1}
								className="p-1 hover:bg-muted rounded disabled:opacity-30"
								title="Move down"
							>
								<GripVertical className="h-3 w-3 rotate-90" />
							</button>
						</div>
					</div>

					{/* Entry fields */}
					<div className="flex-1 space-y-2">
						<div className="grid grid-cols-2 gap-2">
							<Input
								placeholder="Name *"
								value={entry.name}
								onChange={(e) => updateEntry(index, "name", e.target.value)}
								className="text-sm"
							/>
							<Input
								placeholder="Value *"
								value={entry.value}
								onChange={(e) => updateEntry(index, "value", e.target.value)}
								className="text-sm"
							/>
						</div>
						{showImages && (
							<>
								<Input
									placeholder="Image/GIF URL (optional)"
									value={entry.image_url || ""}
									onChange={(e) => updateEntry(index, "image_url", e.target.value)}
									className="text-sm"
								/>
								{entry.image_url && (
									<div className="flex items-center gap-2">
										<img
											src={entry.image_url}
											alt={entry.name}
											className="w-8 h-8 rounded-md object-contain border"
											onError={(e) => {
												e.target.style.display = "none";
											}}
										/>
										<span className="text-xs text-muted-foreground">Preview</span>
									</div>
								)}
							</>
						)}
					</div>

					{/* Delete button */}
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => removeEntry(index)}
						className="text-destructive hover:text-destructive hover:bg-destructive/10"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			))}

			{entries.length < maxEntries && (
				<Button
					type="button"
					variant="outline"
					onClick={addEntry}
					className="w-full"
				>
					<Plus className="h-4 w-4 mr-2" />
					Add Entry
				</Button>
			)}
		</div>
	);
};

const StatForm = ({ stat, onSubmit, onCancel, loading }) => {
	const [statType, setStatType] = useState("normal");
	const [title, setTitle] = useState("");
	const [value, setValue] = useState("");
	const [description, setDescription] = useState("");
	const [mediaType, setMediaType] = useState("");
	const [mediaUrl, setMediaUrl] = useState("");
	const [mediaFile, setMediaFile] = useState(null);
	const [uploadKey, setUploadKey] = useState("");
	const [error, setError] = useState("");
	const [uploading, setUploading] = useState(false);
	const [leaderboardData, setLeaderboardData] = useState([]);

	useEffect(() => {
		if (stat) {
			setStatType(stat.stat_type || (stat.leaderboard_data?.length > 0 ? "leaderboard" : "normal"));
			setTitle(stat.title || "");
			setValue(stat.value || "");
			setDescription(stat.description || "");
			setMediaType(stat.media_type || "");
			setMediaUrl(stat.media_url || "");
			setMediaFile(null);
			setUploadKey("");
			setLeaderboardData(stat.leaderboard_data || []);
		} else {
			resetForm();
		}
	}, [stat]);

	const resetForm = () => {
		setStatType("normal");
		setTitle("");
		setValue("");
		setDescription("");
		setMediaType("");
		setMediaUrl("");
		setMediaFile(null);
		setUploadKey("");
		setError("");
		setLeaderboardData([]);
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

		// Validate based on stat type
		if (statType === "normal") {
			if (!value.trim()) {
				setError("Please enter a value.");
				return;
			}
		} else if (statType === "leaderboard" || statType === "stats_list") {
			if (leaderboardData.length === 0) {
				setError(`Please add at least one ${statType === "leaderboard" ? "leaderboard entry" : "stat item"}.`);
				return;
			}
			// Validate all entries have name and value
			const invalidEntry = leaderboardData.find(
				(entry) => !entry.name?.trim() || !entry.value?.trim()
			);
			if (invalidEntry) {
				setError("All entries must have a name and value.");
				return;
			}
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
				setUploading(true);
				setError("");
				try {
					console.log("Starting upload for file:", mediaFile.name);
					const uploadedUrl = await uploadImage(
						mediaFile,
						"wrapped-stats",
						uploadKey
					);
					console.log("Upload completed, URL:", uploadedUrl);
					if (!uploadedUrl) {
						throw new Error("Upload returned empty URL");
					}
					finalMediaUrl = uploadedUrl;
				} catch (uploadErr) {
					console.error("Upload error:", uploadErr);
					setError("Failed to upload media: " + uploadErr.message);
					setUploading(false);
					return;
				}
				setUploading(false);
			}

			const statData = {
				title: title.trim(),
				value: statType === "leaderboard" || statType === "stats_list" ? `${leaderboardData.length} items` : value.trim(),
				description: description.trim() || null,
				media_type: finalMediaType || null,
				media_url: finalMediaUrl || null,
				stat_type: statType,
				leaderboard_data: (statType === "leaderboard" || statType === "stats_list") ? leaderboardData : null,
			};

			console.log("Submitting stat data:", statData);
			onSubmit(statData);
		} catch (err) {
			console.error("Error saving stat:", err);
			setError("Failed to save stat: " + err.message);
			setUploading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{/* Stat Type Selector */}
			<div className="space-y-2">
				<Label>Stat Type</Label>
				<div className="flex gap-2 flex-wrap">
					<Button
						type="button"
						variant={statType === "normal" ? "default" : "outline"}
						onClick={() => setStatType("normal")}
						className="flex-1 min-w-[100px]"
					>
						Normal Stat
					</Button>
					<Button
						type="button"
						variant={statType === "leaderboard" ? "default" : "outline"}
						onClick={() => setStatType("leaderboard")}
						className="flex-1 min-w-[100px]"
					>
						Leaderboard
					</Button>
					<Button
						type="button"
						variant={statType === "stats_list" ? "default" : "outline"}
						onClick={() => setStatType("stats_list")}
						className="flex-1 min-w-[100px]"
					>
						Stats List
					</Button>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="title">
					Title <span className="text-destructive">*</span>
				</Label>
				<Input
					id="title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder={statType === "leaderboard" ? "e.g., Top Gifters" : statType === "stats_list" ? "e.g., Random Stats" : "e.g., Total Hours Streamed"}
					required
				/>
			</div>

			{/* Normal stat value field */}
			{statType === "normal" && (
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
			)}

			{/* Leaderboard entries editor */}
			{statType === "leaderboard" && (
				<LeaderboardEntryEditor
					entries={leaderboardData}
					onChange={setLeaderboardData}
					maxEntries={10}
					showImages={true}
					label="Leaderboard Entries"
				/>
			)}

			{/* Stats list entries editor */}
			{statType === "stats_list" && (
				<LeaderboardEntryEditor
					entries={leaderboardData}
					onChange={setLeaderboardData}
					maxEntries={15}
					showImages={false}
					label="Stats List Items"
				/>
			)}

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					className="h-24"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Fun description or context for this stat (optional). Supports HTML: <br>, <b>, <i>"
				/>
			</div>

			{/* Media fields - only for normal stats */}
			{statType === "normal" && (
				<>
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
				</>
			)}

			{error && (
				<div className="text-destructive text-sm text-center font-medium">{error}</div>
			)}

			<div className="flex gap-2 pt-2">
				<Button
					type="submit"
					className="flex-1"
					disabled={loading || uploading || !title.trim() || (statType === "normal" && !value.trim()) || ((statType === "leaderboard" || statType === "stats_list") && leaderboardData.length === 0)}
				>
					{(loading || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{uploading ? "Uploading media..." : loading ? "Saving..." : stat ? "Update Stat" : "Create Stat"}
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
