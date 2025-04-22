import { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Transition } from "@headlessui/react";
import logo from "../../assets/logo.png"; //
import "./Navbar.css";

import { AuthContext } from "../../context/authContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const lๆinks = ["Home", "About", "Services", "Contact"];

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
    <nav className="navbar">
      <div className="navbar-container w-100 px-3">
        <Link className="nav-brand navbrand d-flex flex-column align-items-center justify-content-between" to="/Home">
          <div className="navbrand row d-flex align-items-center justify-content-center ">
            <img
              src={logo}
              alt="TLC Logo"
              style={{
                width: "90px",
                // height: "180px",
                objectFit: "contain",
              }}
            />
            &nbsp;ระบบยืม-คืน
          </div>
        </Link>
        <div className="nav-links desktop">
          {role === 2 ? (
            <ul className="nav flex-row w-100">
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
                <Link className="nav-link" to="/" onClick={logout}>
                  ออกจากระบบ
                </Link>
              </li>
            </ul>
          ) : role === 1 ? (
            <ul className="nav flex-row w-100">
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
                <Link className="nav-link" to="/" onClick={logout}>
                  ออกจากระบบ
                </Link>
              </li>
            </ul>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div className="menu-icon mobile">
          <button className="btn-navbar" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X size={28} /> : <Menu size={28} />}</button>
        </div>
      </div>

      <Transition show={isOpen} enter="transition-enter" enterFrom="transition-enter-from" enterTo="transition-enter-to" leave="transition-leave" leaveFrom="transition-leave-from" leaveTo="transition-leave-to">
        <div className="mobile-menu mobile">
        {role === 2 ? (
            <ul className="nav flex-row w-100">
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
                <Link className="nav-link" to="/" onClick={logout}>
                  ออกจากระบบ
                </Link>
              </li>
            </ul>
          ) : role === 1 ? (
            <ul className="nav flex-row w-100">
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
                <Link className="nav-link" to="/" onClick={logout}>
                  ออกจากระบบ
                </Link>
              </li>
            </ul>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </Transition>
    </nav>
  );
};

export default Navbar;
