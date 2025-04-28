import { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Transition } from "@headlessui/react";
import Swal from "sweetalert2";
import logo from "../../assets/logo.png"; //
import axios from "axios";
import "./Navbar.css";

import { AuthContext } from "../../context/authContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const links = ["Home", "About", "Services", "Contact"];

  const location = useLocation();
  const navigate = useNavigate();

  const getLinkClass = (path) =>
    location.pathname === path ? "active mb-1" : "mb-1";

  const auth = useContext(AuthContext);
  const { user, token , logout } = auth;
  const [role, setRole] = useState(null);
  
  useEffect(() => {
    try {
      setRole(user.role);
    } catch (error) {
      navigate("/");
    }
  }, [auth]);

  useEffect(() => {
    const fetchBorrow = () => {
      // console.log("Fetching borrow data...");
      // console.log("role",user.role);
      if (user && user.role === 1) {
        axios.get("http://localhost:3001/borrow", {
          headers: { Authorization: token }
        })
        .then((response) => {
          const pendingBorrows = response.data.filter((item) => item.status_name === "รอการอนุมัติ");
          console.log("รายการรอแสดง", pendingBorrows.length);
      
          if (pendingBorrows.length > 0 && location.pathname !== "/History") {
            sessionStorage.setItem("notifiedCount", pendingBorrows.length);
            Swal.fire({
              icon: "info",
              title: "แจ้งเตือน",
              html: `คุณมี <strong>${pendingBorrows.length}</strong> รายการรออนุมัติ`,
              confirmButtonText: "ไปยังหน้ารายการคำขอ",
              confirmButtonColor: "#2e7d32",
            }).then((result) => {
              if (result.isConfirmed) {
                sessionStorage.setItem("fromNotification", "true");
                navigate("/History");
              }
            });
          }
        })
        .catch((error) => {
          console.error("Fetch borrow error:", error);
          if (error.response && error.response.status === 401) {
            Swal.fire({
              icon: "error",
              title: "หมดเวลาเข้าสู่ระบบ",
              text: "กรุณาเข้าสู่ระบบใหม่",
              confirmButtonText: "ไปหน้า Login"
            }).then(() => {
              sessionStorage.clear();
              navigate("/");
            });
          }
        });
      }
    };
    fetchBorrow();
    const intervalId = setInterval(fetchBorrow, 300000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการออกจากระบบหรือไม่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/");
      }
    });
  };

  useEffect(() => {
    if (user) {
      if (user.role === 0) {
        Swal.fire({
          icon: "warning",
          title: "ไม่มีสิทธิ์เข้าถึง",
          text: "กรุณาเข้าสู่ระบบใหม่",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#d33",
        }).then(() => {
          logout();
          navigate("/");
        });
      }
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <nav className="navbar">
      <div className="navbar-container w-100 px-3">
        <Link
          className="nav-brand navbrand d-flex flex-column align-items-center justify-content-between"
          to="/Home"
        >
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
          {role === 2 || role === 0 ? (
            <ul className="nav flex-row w-100">
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/Home")}`}
                  to="/Home"
                >
                  หน้าหลัก
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/History")}`}
                  to="/History"
                >
                  รายการคำขอ
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/return-history")}`}
                  to="/return-history"
                >
                  ประวัติการคืน
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/cancelled-requests")}`}
                  to="/cancelled-requests"
                >
                  รายการที่ถูกยกเลิก
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  ออกจากระบบ
                </Link>
              </li>
            </ul>
          ) : role === 1 ? (
            <ul className="nav flex-row w-100">
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/Home")}`}
                  to="/Home"
                >
                  หน้าหลัก
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/History")}`}
                  to="/History"
                >
                  รายการคำขอ
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/return-history")}`}
                  to="/return-history"
                >
                  ประวัติการคืน
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/cancelled-requests")}`}
                  to="/cancelled-requests"
                >
                  รายการที่ถูกยกเลิก
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/Approve")}`}
                  to="/Approve"
                >
                  อนุมัติคำขอ
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  ออกจากระบบ
                </Link>
              </li>
            </ul>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div className="menu-icon mobile">
          <button className="btn-navbar" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <Transition
        show={isOpen}
        enter="transition-enter"
        enterFrom="transition-enter-from"
        enterTo="transition-enter-to"
        leave="transition-leave"
        leaveFrom="transition-leave-from"
        leaveTo="transition-leave-to"
      >
        <div className="mobile-menu mobile">
          {role === 2 || role === 0 ? (
            <ul className="nav flex-column w-100">
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/Home")}`}
                  to="/Home"
                >
                  หน้าหลัก
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/History")}`}
                  to="/History"
                >
                  รายการคำขอ
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/return-history")}`}
                  to="/return-history"
                >
                  ประวัติการคืน
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/cancelled-requests")}`}
                  to="/cancelled-requests"
                >
                  รายการที่ถูกยกเลิก
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  ออกจากระบบ
                </Link>
              </li>
            </ul>
          ) : role === 1 ? (
            <ul className="nav flex-column w-100">
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/Home")}`}
                  to="/Home"
                >
                  หน้าหลัก
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/History")}`}
                  to="/History"
                >
                  รายการคำขอ
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/return-history")}`}
                  to="/return-history"
                >
                  ประวัติการคืน
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/cancelled-requests")}`}
                  to="/cancelled-requests"
                >
                  รายการที่ถูกยกเลิก
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${getLinkClass("/Approve")}`}
                  to="/Approve"
                >
                  อนุมัติคำขอ
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
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
