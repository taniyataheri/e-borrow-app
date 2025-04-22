import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import logo from "../../assets/logo.png"; //

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const getLinkClass = (path) => (location.pathname === path ? "active mb-1" : "mb-1");

  const auth = useContext(AuthContext);
  const { user, logout } = auth;
  const [role, setRole] = useState(null);

  useEffect(() => {
    try {
      setRole(user.role);
    } catch (error) {
      navigate("/");
    }
  }, [auth]);

  return (
    <>
      <nav className="custom-sidebar d-flex flex-column align-items-center">
        <Link className="nav-brand d-flex flex-column align-items-center" to="/Home">
          <img
            src={logo}
            alt="TLC Logo"
            style={{
              width: "180px",
              height: "180px",
              objectFit: "contain",
              marginBottom: "10px",
            }}
          />
          ระบบยืม-คืน
        </Link>
        {role === 2 ? (
          <ul className="nav flex-column w-100">
            <li className="nav-item">
              <Link className={`nav-link ${getLinkClass("/Home")}`} to="/Home">
                หน้าหลัก
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${getLinkClass("/History")}`} to="/History">
                รายการคำขอ
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${getLinkClass("/return-history")}`} to="/return-history">
                ประวัติการคืน
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${getLinkClass("/cancelled-requests")}`} to="/cancelled-requests">
                รายการที่ถูกยกเลิก
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link mb-1" to="/" onClick={logout}>
                ออกจากระบบ
              </Link>
            </li>
          </ul>
        ) : role === 1 ? (
          <ul className="nav flex-column w-100">
            <li className="nav-item">
              <Link className={`nav-link ${getLinkClass("/Home")}`} to="/Home">
                หน้าหลัก
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${getLinkClass("/History")}`} to="/History">
                รายการคำขอ
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${getLinkClass("/return-history")}`} to="/return-history">
                ประวัติการคืน
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${getLinkClass("/cancelled-requests")}`} to="/cancelled-requests">
                รายการที่ถูกยกเลิก
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${getLinkClass("/Signup")}`} to="/Signup">
                สร้างบัญชีผู้ใช้งาน
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link mb-1" to="/" onClick={logout}>
                ออกจากระบบ
              </Link>
            </li>
          </ul>
        ) : (
          <p>Loading...</p>
        )}
      </nav>
    </>
  );
}

export default Navbar;
