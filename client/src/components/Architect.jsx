export default function ArchitectCard({ architect }) {
    return (
        <div className="card">
            {architect.thumbnail?.source && (
                <img src={architect.thumbnail.source} alt={architect.title} />
            )}

            <h3>{architect.title}</h3>

            <p>{architect.extract}</p>
        </div>
    );
}