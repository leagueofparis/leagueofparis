import React, { useState, useEffect, useRef } from "react";
import { getImageUrls } from "../supabaseClient";

const ImageCarousel = () => {
	const [images, setImages] = useState([]);
	const [current, setCurrent] = useState(0);
	const intervalRef = useRef(null);

	useEffect(() => {
		const fetchImages = async () => {
			const images = await getImageUrls("art");
			console.log(images);
			setImages(images);
		};

		fetchImages();
	}, []);

	// Default images if none provided
	const defaultImages = [
		"https://picsum.photos/800/400?random=1",
		"https://picsum.photos/800/400?random=2",
		"https://picsum.photos/800/400?random=3",
		"https://picsum.photos/800/400?random=4",
		"https://picsum.photos/800/400?random=5",
	];

	const displayImages = images.length > 0 ? images : defaultImages;
	const total = displayImages.length;

	// Autoplay effect
	useEffect(() => {
		intervalRef.current = setInterval(() => {
			setCurrent((prev) => (prev + 1) % total);
		}, 3000);
		return () => clearInterval(intervalRef.current);
	}, [total]);

	// Scroll to the current slide
	useEffect(() => {
		const el = document.getElementById(`slide${current}`);
		if (el)
			el.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "start",
			});
	}, [current]);

	const goTo = (idx) => setCurrent(idx);
	const goPrev = () =>
		setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
	const goNext = () =>
		setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));

	return (
		<div className="carousel w-full h-[375px] rounded-lg">
			{displayImages.map((image, index) => (
				<div
					key={index}
					id={`slide${index}`}
					className="carousel-item relative w-full"
				>
					<img
						src={image}
						className="w-full h-[375px] object-contain rounded-lg"
						alt={`Slide ${index + 1}`}
					/>
					<div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
						<button onClick={goPrev} className="btn btn-circle">
							❮
						</button>
						<button onClick={goNext} className="btn btn-circle">
							❯
						</button>
					</div>
				</div>
			))}
			{/* Dots navigation */}
			<div className="absolute flex justify-center w-full bottom-4 gap-2">
				{displayImages.map((_, idx) => (
					<button
						key={idx}
						onClick={() => goTo(idx)}
						className={`btn btn-xs rounded-full ${current === idx ? "btn-primary" : "btn-ghost"}`}
					/>
				))}
			</div>
		</div>
	);
};

export default ImageCarousel;
