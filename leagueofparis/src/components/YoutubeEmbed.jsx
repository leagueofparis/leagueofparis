export default function YoutubeEmbed({ videoId }) {
    return (
        <div className="relative w-full pb-[56.25%] h-0">
            <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
            ></iframe>
        </div>
    );
}