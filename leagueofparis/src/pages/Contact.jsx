import React, { useState } from "react";
import { getUser } from "../utilities/auth";
import Recaptcha from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY;

function Contact() {
	const user = getUser();
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [status, setStatus] = useState("");
	const [email, setEmail] = useState("");
	const [emailError, setEmailError] = useState("");
	const [captchaToken, setCaptchaToken] = useState("");

	function validateEmail(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		setEmailError("");
		if (!subject || !message) {
			setStatus("Please fill in all fields.");
			return;
		}
		if (!captchaToken) {
			setStatus("Please verify you are human.");
			return;
		}
		let emailToUse = email;
		let usernameToUse = "";
		if (!user) {
			if (!email) {
				setEmailError("Email is required.");
				return;
			}
			if (!validateEmail(email)) {
				setEmailError("Please enter a valid email address.");
				return;
			}
		} else {
			emailToUse = user.email;
			usernameToUse = user.username;
		}
		const contactData = {
			Subject: "Contact Form Submission",
			Html: `From: <b>${usernameToUse}</b> (${emailToUse})<br><br>Subject: <b>${subject}</b><br><br>Message: <b>${message}</b>`,
			CaptchaToken: captchaToken,
		};
		console.log(contactData, "contactData");
		try {
			const token = localStorage.getItem("jwtToken");
			const response = await fetch("/api/email/send-to-me", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token && { Authorization: `Bearer ${token}` }),
				},
				body: JSON.stringify(contactData),
			});

			if (response.ok) {
				setStatus("Message sent! Thank you for reaching out.");
				setSubject("");
				setMessage("");
				setEmail("");
			} else {
				setStatus("Failed to send message. Please try again later.");
			}
		} catch (err) {
			setStatus("An error occurred. Please try again later.");
		}
	};

	const handleCaptchaChange = (token) => {
		setCaptchaToken(token);
	};

	return (
		<div className="flex justify-center">
			<div className="bg-base-200 p-8 rounded-lg shadow-lg w-full max-w-md">
				<h1 className="text-2xl font-bold mb-4 text-center">Contact Me!</h1>
				<div className="text-base-content/70 mb-4 text-center">
					Please fill out the form below to contact me.
					<div className="divider"></div>
					You can also email me directly at{" "}
					<a href="mailto:leagueofparis5@gmail.com" className="font-semibold">
						leagueofparis5@gmail.com
					</a>
				</div>
				<div className="divider"></div>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
					{user && (
						<div className="text-sm text-base-content/70 mb-2">
							Logged in as{" "}
							<span className="font-semibold">{user.username}</span>
							{user.email && ` (${user.email})`}
						</div>
					)}
					<div className="form-control w-full">
						<label className="label">
							<span className="label-text">Subject</span>
						</label>
						<input
							type="text"
							className="input input-bordered w-full"
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							placeholder="Subject"
							maxLength={50}
							required
						/>
					</div>
					<div className="form-control w-full">
						<label className="label">
							<span className="label-text">Message</span>
						</label>
						<textarea
							className="textarea textarea-bordered w-full"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Your message"
							rows={5}
							maxLength={500}
							required
						/>
						<div className="text-xs text-right text-base-content/70 mt-1">
							Max length: 500 characters
						</div>
					</div>
					{!user && (
						<div className="form-control w-full">
							<label className="label">
								<span className="label-text">Email</span>
							</label>
							<input
								type="email"
								className="input input-bordered w-full"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Your email"
								required
							/>
							{emailError && (
								<div className="text-error text-xs mt-1">{emailError}</div>
							)}
						</div>
					)}
					<Recaptcha
						sitekey={RECAPTCHA_SITE_KEY}
						onChange={handleCaptchaChange}
						onExpired={() => setCaptchaToken("")}
					/>
					<button type="submit" className="btn btn-primary w-full">
						Send
					</button>
					{status && (
						<div
							className={`mt-2 text-center ${
								status.includes("Please") ? "text-error" : "text-success"
							}`}
						>
							{status}
						</div>
					)}
				</form>
			</div>
		</div>
	);
}

export default Contact;
