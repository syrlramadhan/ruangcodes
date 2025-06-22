export default function Footer() {
  return (
    <footer style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#f9f9f9', fontSize: '0.9rem', color: '#555', marginTop: '2rem' }}>
      © {new Date().getFullYear()} AsciiDoc Blog. Dibuat dengan ❤️ dan Next.js.
    </footer>
  );
}