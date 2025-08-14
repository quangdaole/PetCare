export default function Footer() {
    return (
      <footer className="site-footer">
        <div className="footer-wrap">
          © {new Date().getFullYear()} PetCare 
          <p> This app served for the class CS3744 at Virginia Tech</p>
        </div>
      </footer>
    );
  }
  