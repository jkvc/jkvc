export default function Footer() {
  return (
    <footer className="footer footer-center bg-base-200 p-8 text-base-content">
      <div>
        <p>
          Built by <span className="font-semibold">jkvc</span>
        </p>
        <div className="flex gap-4 mt-2">
          <a
            href="https://github.com/jkvc"
            className="link link-hover"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://twitter.com/jkvc"
            className="link link-hover"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
}
