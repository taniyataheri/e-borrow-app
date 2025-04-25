import { useEffect, useState, useContext } from "react";
import { Container, Card, Table, Button, Form, Modal, OverlayTrigger, Tooltip, Row, Col } from "react-bootstrap";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import Swal from "sweetalert2";

function CancelHistory() {
  const [canceledList, setCanceledList] = useState([]);
  const { user, token } = useContext(AuthContext); // ✅ ต้องมีบรรทัดนี้
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user || !token) return; // ✅ รอให้ user/token พร้อมก่อน
  
    axios
      .get("http://localhost:3001/listmembers/0", {
        headers: {
          Authorization: token, // ✅ ส่ง token ไปกับ header
        },
      })
      .then((res) => {
        setCanceledList(res.data);
      })
      .catch((err) => {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err);
        Swal.fire({
          icon: "error",
          title: "ไม่สามารถโหลดข้อมูลได้",
          text: err.response?.data?.message || "เกิดข้อผิดพลาด",
        });
      });
  }, [user, token]);

    const filteredList = canceledList.filter((item) => {
      const fullName =
        item.full_name && item.full_name.trim() !== ""
          ? item.full_name
          : `${item.frist_name || ""} ${item.last_name || ""}`.trim();
    
      const searchLower = searchTerm.toLowerCase();
    
      return (
        fullName.toLowerCase().includes(searchLower) ||
        item.team?.toLowerCase().includes(searchLower) ||
        item.product_name?.toLowerCase().includes(searchLower)
      );
    });

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  console.log("paginatedList", canceledList);
  const formatDDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear() + 543;
  
    return `${day}/${month}/${year}`;
  };
  const handleApprove = (data) => {
    Swal.fire({
      icon: "question",
      title: "คุณต้องการอนุญาต",
      html: `
        <div className="row d-flex align-items-center justify-content-center">
          <div className="col-12 d-flex align-items-center justify-content-center">
            <label for="teamSelect">เลือกทีม</label>
            <select id="teamSelect" class="swal2-select" style="padding: 8px;border-radius: 5px;">
              <option value="">-- เลือกทีม --</option>
              <option value="A">ทีม A</option>
              <option value="B">ทีม B</option>
              <option value="C">ทีม C</option>
              <option value="E">ทีม E</option>
              <option value="F">ทีม F</option>
              <option value="G">ทีม G</option>
              <option value="H">ทีม H</option>
              <option value="I">ทีม I</option>
              <option value="J">ทีม J</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "อนุมัติ",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        const team = document.getElementById("teamSelect").value;
        if (!team) {
          Swal.showValidationMessage("กรุณาเลือกทีมก่อนอนุมัติ");
          return false;
        }
        return team;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const selectedTeam = result.value;
  
        // ส่งข้อมูลไปอัปเดต backend

        // axios
        //   .put(`http://localhost:3001/users/approve/${user.member_id}`, {
        //     team: selectedTeam,
        //   })
        //   .then(() => {
        //     Swal.fire({
        //       icon: "success",
        //       title: "อนุมัติผู้ใช้สำเร็จ",
        //       confirmButtonColor: "#2e7d32",
        //     });
        //     // รีโหลดรายการผู้ใช้ หรือ fetch ใหม่
        //   })
        //   .catch((err) => {
        //     console.error(err);
        //     Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอนุมัติผู้ใช้ได้", "error");
        //   });
      }
    });
  };

  return (
    <div className="d-flex flex-column flex-lg-row">
      <Navbar />
      <Container className="py-4" style={{ backgroundColor: "#F5F5F5", minHeight: "100vh", marginTop: "80px" }}>
        <Card className="p-4 w-100">
          <h4 className="text-center mb-4" style={{ color: "#2e7d32" }}>
            รายการคำขออนมุมัติสิทธิ์เข้าใช้งาน
          </h4>

          {/* 🔍 Search Bar ชิดซ้าย */}
          <div className="d-flex justify-content-start mb-3">
            <input
              type="text"
              placeholder="🔍 ผู้สมัคร / ทีม"
              className="form-control"
              style={{ width: "350px" }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>No</th>
                <th>ชื่อ - นามสกุล</th>
                <th>อีเมล</th>
                <th>เบอร์โทร</th>
                <th>วัน/เดือน/ปี เกิด</th>
                <th>ชื่อผู้ใช้บัญชี</th>
                <th>สถานะ</th>
                <th>วันที่สมัคร</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.map((item, index) => (
                <tr key={index}>
                  <td>{index+1}</td>
                  <td>{item.prefix} {item.full_name}</td>
                  <td>{item.email}</td>
                  <td>{item.phone_number}</td>
                  <td>{formatDDate(item.birthday)}</td>
                  <td>{item.username || "-"}</td>
                  <td>{item.role_id === 0 ? "ยังไม่ได้รับการอนุมัติ" : "ได้รับการอนุมัติแล้ว"}</td>
                  <td style={{ color: "#2e7d32"}}>{formatDDate(item.join_date)}</td>
                  <td>
                    {item.role_id === 0 && (
                        <Button
                          variant="success"
                          className="w-100 my-1"
                          onClick={() =>handleApprove(item)}
                        >
                          อนุมัติ
                        </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* 📄 Pagination */}
          <nav className="d-flex justify-content-center mt-3">
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                  «
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                >
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  »
                </button>
              </li>
            </ul>
          </nav>
        </Card>
      </Container>
    </div>
  );
}

export default CancelHistory;
