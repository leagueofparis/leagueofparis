import React, { useState, useEffect } from "react";
import {
	uploadImage,
	getAvailableFolders,
	createAnnouncement,
	getAnnouncements,
} from "../supabaseClient";

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

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const isExpired = (expirationDate) => {
		if (!expirationDate) return false;
		return new Date(expirationDate) <= new Date();
	};

	return (
		<div className="min-h-screen py-10 px-2">
			<div className="mx-auto max-w-6xl">
				<h1 className="text-3xl font-extrabold mb-2 text-base-content">
					Content Manager
				</h1>
				<p className="mb-8 text-base-content/70 text-lg">
					Upload files and manage announcements.
				</p>

				<div className="grid md:grid-cols-2 gap-8">
					{/* File Upload Section */}
					<div className="card bg-base-300 shadow-xl">
						<div className="card-body items-center">
							<h2 className="card-title text-xl font-bold mb-4">
								Upload Files
							</h2>

							{/* Folder Selection */}
							<div className="w-full mb-4">
								<label className="label">
									<span className="label-text">Select Folder</span>
								</label>
								<select
									className="select select-bordered w-full"
									value={selectedFolder}
									onChange={(e) => setSelectedFolder(e.target.value)}
									disabled={folders.length === 0}
								>
									{folders.length === 0 ? (
										<option>Loading folders...</option>
									) : (
										folders.map((folder) => (
											<option key={folder} value={folder}>
												{folder}
											</option>
										))
									)}
								</select>
							</div>

							{/* File Input */}
							<div className="w-full mb-4">
								<label className="label">
									<span className="label-text">Select Files</span>
								</label>
								<input
									type="file"
									onChange={handleFileChange}
									className="file-input file-input-bordered w-full"
									multiple={true}
									accept="image/*"
								/>
							</div>

							{/* Upload Key */}
							<div className="w-full mb-4">
								<label className="label">
									<span className="label-text">Upload Key</span>
								</label>
								<input
									type="password"
									placeholder="Enter upload key"
									className="input input-bordered w-full"
									value={key}
									onChange={(e) => setKey(e.target.value)}
								/>
							</div>

							{/* Optional Message for Schedules */}
							{selectedFolder === "schedules" && (
								<div className="w-full mb-4">
									<label className="label">
										<span className="label-text">
											Schedule Message (Optional)
										</span>
									</label>
									<input
										type="text"
										placeholder="Enter schedule message"
										className="input input-bordered w-full"
										value={message}
										onChange={(e) => setMessage(e.target.value)}
									/>
								</div>
							)}

							{/* Upload Button */}
							<button
								onClick={handleUpload}
								className="btn btn-primary w-full"
								disabled={loading || !file || !selectedFolder || !key}
							>
								{loading ? "Uploading..." : "Upload Files"}
							</button>

							{/* Progress Bar */}
							{totalFiles > 0 && currentIndex > 0 && (
								<div className="w-full mt-4">
									<div className="text-center text-sm mb-2">
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

							{/* Status Message */}
							<div
								className={`mt-4 min-h-[24px] text-center font-medium ${
									status.includes("failed") ||
									status.includes("Invalid") ||
									status.includes("Failed")
										? "text-red-600"
										: status
											? "text-success"
											: ""
								}`}
							>
								{status}
							</div>
						</div>
					</div>

					{/* Announcement Manager Section */}
					<div className="card bg-base-300 shadow-xl">
						<div className="card-body items-center">
							<h2 className="card-title text-xl font-bold mb-4">
								Announcement Manager
							</h2>

							{/* Announcement Content */}
							<div className="w-full mb-4">
								<label className="label">
									<span className="label-text">Announcement Content</span>
								</label>
								<textarea
									className="textarea textarea-bordered w-full h-32"
									placeholder="Enter your announcement here..."
									value={announcementContent}
									onChange={(e) => setAnnouncementContent(e.target.value)}
									maxLength={500}
								/>
								<div className="text-xs text-right text-base-content/70 mt-1">
									{announcementContent.length}/500 characters
								</div>
							</div>

							{/* Expiration Date */}
							<div className="w-full mb-4">
								<label className="label">
									<span className="label-text">Expiration Date (Optional)</span>
								</label>
								<input
									type="datetime-local"
									className="input input-bordered w-full"
									value={expirationDate}
									onChange={(e) => setExpirationDate(e.target.value)}
									min={new Date().toISOString().slice(0, 16)}
								/>
							</div>

							{/* Announcement Key */}
							<div className="w-full mb-4">
								<label className="label">
									<span className="label-text">Announcement Key</span>
								</label>
								<input
									type="password"
									placeholder="Enter announcement key"
									className="input input-bordered w-full"
									value={announcementKey}
									onChange={(e) => setAnnouncementKey(e.target.value)}
								/>
							</div>

							{/* Create Announcement Button */}
							<button
								onClick={handleCreateAnnouncement}
								className="btn btn-secondary w-full"
								disabled={
									loading ||
									!announcementContent.trim() ||
									!announcementKey.trim()
								}
							>
								{loading ? "Creating..." : "Create Announcement"}
							</button>

							{/* Announcement Status */}
							<div
								className={`mt-4 min-h-[24px] text-center font-medium ${
									announcementStatus.includes("Failed") ||
									announcementStatus.includes("Invalid")
										? "text-red-600"
										: announcementStatus
											? "text-success"
											: ""
								}`}
							>
								{announcementStatus}
							</div>

							{/* Recent Announcements */}
							<div className="w-full mt-6">
								<h3 className="text-lg font-semibold mb-3">
									Recent Announcements
								</h3>
								{loadingAnnouncements ? (
									<div className="text-center">
										<span className="loading loading-spinner loading-sm"></span>
										<span className="ml-2">Loading...</span>
									</div>
								) : announcements.length > 0 ? (
									<div className="flex flex-col items-center justify-center gap-4 w-full mb-4">
										<div className="bg-base-200 rounded-lg min-w-[300px] pl-2">
											{announcements.map((announcement, index) => (
												<div key={index} className="text-base-content">
													<div className="flex flex-row justify-between">
														<label className="label">
															{new Date(
																announcement.created_at
															).toLocaleDateString("en-US", {
																month: "short",
																day: "numeric",
															})}
														</label>
														<label className="label">
															{announcement.expires_at && (
																<>
																	<span className="label-text">Expires:</span>
																	<label className="label">
																		{new Date(
																			announcement.expires_at
																		).toLocaleDateString("en-US", {
																			month: "short",
																			day: "numeric",
																		})}
																	</label>
																</>
															)}
														</label>
													</div>

													<div className="text-3xl font-bold ">
														{announcement.content}
													</div>
												</div>
											))}
										</div>
									</div>
								) : (
									<div className="text-center text-base-content/70">
										No announcements yet
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ContentManager;
