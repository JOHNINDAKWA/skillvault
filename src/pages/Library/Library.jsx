import "./Library.css";

function Library() {
  return (
    <section className="library-page page-section">
      <div className="container">
        <span className="eyebrow">My Library</span>
        <h1>Purchased Guides</h1>
        <p>
          This will show purchased guides, reading progress, bookmarks, receipts,
          and downloads where allowed.
        </p>
      </div>
    </section>
  );
}

export default Library;