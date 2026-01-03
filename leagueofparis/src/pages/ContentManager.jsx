import React, { useState, useEffect } from "react";
import {
	uploadImage,
	getAvailableFolders,
	createAnnouncement,
	getAnnouncements,
	invokeEdgeFunction,
	getFeaturedVideo,
} from "../supabaseClient";
import YoutubeEmbed from "../components/YoutubeEmbed";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { Loader2 } from "lucide-react";

function ContentManager() {
	const [file, setFile] = useState(null);
	const [status, setStatus] = useState("");
	const [key, setKey] = useState("");
	const [message, setMessage] = useState("");
	const [selectedFolder, setSelectedFolder] = useState("");
	const [folders, setFolders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [totalFiles, setTotalFiles] = useState(0);
	const [currentFileName, setCurrentFileName] = useState("");
	const [isConverting, setIsConverting] = useState(false);

	// Announcement states
	const [announcementContent, setAnnouncementContent] = useState("");
	const [announcements, setAnnouncements] = useState([]);
	const [announcementStatus, setAnnouncementStatus] = useState("");
	const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
	const [announcementKey, setAnnouncementKey] = useState("");
	const [expirationDate, setExpirationDate] = useState("");

	const [featuredVideo, setFeaturedVideo] = useState(null);
	const [featureVideoUrl, setFeatureVideoUrl] = useState("");
	const [featureVideoStartDate, setFeatureVideoStartDate] = useState(null);
	const [featureVideoEndDate, setFeatureVideoEndDate] = useState(null);

	useEffect(() => {
		const fetchFolders = async () => {
			try {
				const availableFolders = await getAvailableFolders();
				setFolders(availableFolders);
				if (availableFolders.length > 0) {
					setSelectedFolder(availableFolders[0]);
				}
			} catch (error) {
				console.error("Error fetching folders:", error);
				setStatus("Failed to load folders: " + error.message);
			}
		};

		const fetchAnnouncements = async () => {
			try {
				setLoadingAnnouncements(true);
				const data = await getAnnouncements();
				setAnnouncements(data);
			} catch (error) {
				console.error("Error fetching announcements:", error);
				setAnnouncementStatus("Failed to load announcements: " + error.message);
			} finally {
				setLoadingAnnouncements(false);
			}
		};

		fetchFolders();
		fetchAnnouncements();
	}, []);

	useEffect(() => {
		const fetchFeaturedVideo = async () => {
			try {
				const data = await getFeaturedVideo();
				setFeaturedVideo(data);
			} catch (error) {
				console.error("Error fetching featured video:", error);
			}
		};
		fetchFeaturedVideo();
	}, []);

	const handleFileChange = (e) => {
		setFile(e.target.files);
		setStatus("");
		setCurrentIndex(0);
		setTotalFiles(0);
		setCurrentFileName("");
		setIsConverting(false);
	};

	const handleUpload = async () => {
		if (!file || file.length === 0) {
			setStatus("Please select a file.");
			return;
		}

		if (!selectedFolder) {
			setStatus("Please select a folder.");
			return;
		}

		setTotalFiles(file.length);
		setCurrentIndex(0);
		setStatus("");
		setLoading(true);

		try {
			for (let i = 0; i < file.length; i++) {
				const f = file[i];
				setCurrentIndex(i + 1);
				setCurrentFileName(f.name);
				setIsConverting(false);

				// Check if file needs conversion
				if (f.type === "image/heic" || f.name.toLowerCase().endsWith(".heic")) {
					setIsConverting(true);
					setStatus(`Converting ${f.name} (${i + 1}/${file.length})...`);
				} else {
					setStatus(`Uploading ${f.name} (${i + 1}/${file.length})...`);
				}

				await uploadImage(f, selectedFolder, key);
				setIsConverting(false);
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
		} finally {
			setLoading(false);
		}
	};

	const handleCreateAnnouncement = async () => {
		if (!announcementContent.trim()) {
			setAnnouncementStatus("Please enter announcement content.");
			return;
		}

		if (!announcementKey.trim()) {
			setAnnouncementStatus("Please enter announcement key.");
			return;
		}

		setAnnouncementStatus("");
		setLoading(true);

		try {
			await createAnnouncement(
				announcementContent,
				announcementKey,
				expirationDate || null
			);
			setAnnouncementStatus("Announcement created successfully!");
			setAnnouncementContent("");
			setExpirationDate("");

			// Refresh announcements
			const data = await getAnnouncements();
			setAnnouncements(data);
		} catch (err) {
			setAnnouncementStatus("Failed to create announcement: " + err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleSaveFeaturedVideo = async () => {
		const body = {
			youtube_url: featureVideoUrl,
		};

		if (featureVideoStartDate) body.start_date = featureVideoStartDate;
		if (featureVideoEndDate) body.end_date = featureVideoEndDate;

		try {
			console.log(body);
			await invokeEdgeFunction("featured-video", body);
		} catch (err) {
			console.error("Request failed:", err.message);
		}
	};

	return (
		<div className="min-h-screen py-10 px-2">
			<div className="w-full flex flex-col gap-8 justify-center items-center max-w-7xl mx-auto">
				<div className="text-center">
					<h1 className="text-3xl font-extrabold mb-2 text-foreground">
						Content Manager
					</h1>
					<p className="text-muted-foreground text-lg">
						Upload files and manage announcements.
					</p>
				</div>

				<div className="gap-8 flex flex-col md:flex-row w-full justify-center items-start">
					{/* File Upload Section */}
					<Card className="w-full md:w-1/3">
						<CardHeader>
							<CardTitle className="text-primary text-center">Upload Files</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="folder-select">Select Folder</Label>
								<Select value={selectedFolder} onValueChange={setSelectedFolder} disabled={folders.length === 0}>
									<SelectTrigger id="folder-select">
										<SelectValue placeholder="Select a folder" />
									</SelectTrigger>
									<SelectContent>
										{folders.map((folder) => (
											<SelectItem key={folder} value={folder}>
												{folder}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="fileInput">Select Files</Label>
								<div className="flex gap-2 items-center">
									<Input
										id="fileInput"
										type="file"
										onChange={handleFileChange}
										multiple
										accept="image/*"
										className="cursor-pointer"
									/>
								</div>
								{file && file.length > 0 && (
									<div className="text-sm text-muted-foreground truncate">
										{Array.from(file).map((f) => f.name).join(", ")}
									</div>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="upload-key">Upload Key</Label>
								<Input
									id="upload-key"
									type="password"
									placeholder="Enter upload key"
									value={key}
									onChange={(e) => setKey(e.target.value)}
								/>
							</div>

							{selectedFolder === "schedules" && (
								<div className="space-y-2">
									<Label htmlFor="schedule-message">Schedule Message (Optional)</Label>
									<Input
										id="schedule-message"
										type="text"
										placeholder="Enter schedule message"
										value={message}
										onChange={(e) => setMessage(e.target.value)}
									/>
								</div>
							)}

							<Button
								onClick={handleUpload}
								className="w-full"
								disabled={loading || !file || !selectedFolder || !key}
							>
								{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{loading ? "Uploading..." : "Upload Files"}
							</Button>

							{totalFiles > 0 && currentIndex > 0 && (
								<div className="space-y-2">
									<div className="text-center text-sm">
										{isConverting
											? `Converting ${currentFileName} (${currentIndex}/${totalFiles})...`
											: `Uploading ${currentFileName} (${currentIndex}/${totalFiles})...`}
									</div>
									<Progress value={(currentIndex / totalFiles) * 100} />
								</div>
							)}

							<div
								className={`min-h-[24px] text-center font-medium ${
									status.includes("failed") ||
									status.includes("Invalid") ||
									status.includes("Failed")
										? "text-destructive"
										: status
										? "text-green-600"
										: ""
								}`}
							>
								{status}
							</div>
						</CardContent>
					</Card>

					{/* Announcement Manager Section */}
					<Card className="w-full md:w-1/3">
						<CardHeader>
							<CardTitle className="text-primary text-center">Announcement Manager</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="announcement-content">Announcement Content</Label>
								<Textarea
									id="announcement-content"
									className="h-32"
									placeholder="Enter your announcement here..."
									value={announcementContent}
									onChange={(e) => setAnnouncementContent(e.target.value)}
									maxLength={500}
								/>
								<div className="text-xs text-right text-muted-foreground">
									{announcementContent.length}/500 characters
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="expiration-date">Expiration Date (Optional)</Label>
								<Input
									id="expiration-date"
									type="datetime-local"
									value={expirationDate}
									onChange={(e) => setExpirationDate(e.target.value)}
									min={new Date().toISOString().slice(0, 16)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="announcement-key">Announcement Key</Label>
								<Input
									id="announcement-key"
									type="password"
									placeholder="Enter announcement key"
									value={announcementKey}
									onChange={(e) => setAnnouncementKey(e.target.value)}
								/>
							</div>

							<Button
								onClick={handleCreateAnnouncement}
								className="w-full"
								disabled={loading || !announcementContent.trim() || !announcementKey.trim()}
							>
								{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{loading ? "Creating..." : "Create Announcement"}
							</Button>

							<div
								className={`min-h-[24px] text-center font-medium ${
									announcementStatus.includes("Failed") ||
									announcementStatus.includes("Invalid")
										? "text-destructive"
										: announcementStatus
										? "text-green-600"
										: ""
								}`}
							>
								{announcementStatus}
							</div>

							<div className="mt-6">
								<h3 className="text-lg font-semibold mb-3 text-primary">Recent Announcements</h3>
								{loadingAnnouncements ? (
									<div className="flex items-center justify-center">
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										<span>Loading...</span>
									</div>
								) : announcements.length > 0 ? (
									<div className="space-y-4">
										<div className="bg-muted rounded-lg p-4">
											{announcements.map((announcement, index) => (
												<div key={index} className="text-foreground">
													<div className="flex flex-row justify-between text-sm text-muted-foreground mb-2">
														<span>
															{new Date(announcement.created_at).toLocaleDateString("en-US", {
																month: "short",
																day: "numeric",
															})}
														</span>
														{announcement.expires_at && (
															<span>
																Expires:{" "}
																{new Date(announcement.expires_at).toLocaleDateString("en-US", {
																	month: "short",
																	day: "numeric",
																})}
															</span>
														)}
													</div>

													<div className="text-xl font-bold">{announcement.content}</div>
												</div>
											))}
										</div>
									</div>
								) : (
									<div className="text-center text-muted-foreground">No announcements yet</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Featured Video Section */}
					<Card className="w-full md:w-1/3">
						<CardHeader>
							<CardTitle className="text-primary text-center">Featured Video</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="youtube-url">Youtube URL</Label>
								<Input
									id="youtube-url"
									type="text"
									placeholder="Enter youtube url"
									value={featureVideoUrl}
									onChange={(e) => setFeatureVideoUrl(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="video-start-date">Start Date</Label>
								<Input
									id="video-start-date"
									type="datetime-local"
									value={featureVideoStartDate}
									onChange={(e) => setFeatureVideoStartDate(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="video-end-date">End Date</Label>
								<Input
									id="video-end-date"
									type="datetime-local"
									value={featureVideoEndDate}
									onChange={(e) => setFeatureVideoEndDate(e.target.value)}
								/>
							</div>
							<Button onClick={handleSaveFeaturedVideo} className="w-full">
								Save
							</Button>

							<div className="pt-4 border-t">
								<Label className="font-bold text-primary block mb-2">Current Featured Video</Label>
								<div className="space-y-2">
									<div className="flex flex-row justify-between text-sm">
										<span>
											Start:{" "}
											{featuredVideo?.start_date &&
												new Date(featuredVideo.start_date).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
												})}
										</span>
										<span>
											End:{" "}
											{featuredVideo?.end_date &&
												new Date(featuredVideo.end_date).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
												})}
										</span>
									</div>
									<YoutubeEmbed videoId={featuredVideo?.value} />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export default ContentManager;
