import { useState, useContext, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Form,
  Modal,
  OverlayTrigger,
  Tooltip,
  Row,
  Col,
} from "react-bootstrap";
import { AuthContext } from "../../context/authContext";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
const apiUrl = import.meta.env.VITE_API_URL;

function History() {
  const [history, setHistory] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState(""); //
  const [searchTerm, setSearchTerm] = useState("");
  const [mName, setMName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [team, setTeam] = useState("");
  const [show, setShow] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnQty, setReturnQty] = useState(0);
  const [returnNote, setReturnNote] = useState("");
  const [currentReturn, setCurrentReturn] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [returnCondition, setReturnCondition] = useState(""); // สมบูรณ์ / ชำรุด / สูญหาย
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [returnGoodQty, setReturnGoodQty] = useState(0);
  const [returnDamagedQty, setReturnDamagedQty] = useState(0);
  const [returnLostQty, setReturnLostQty] = useState(0);
  const [returnComment, setReturnComment] = useState("");
  const [returnFine, setReturnFine] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null); // ถ้าใช้ตัวแปรนี้ในการยกเลิก
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveNote, setApproveNote] = useState("");
  const [approveTarget, setApproveTarget] = useState(null);
  const [canceledByInput, setCanceledByInput] = useState("");
  const [fine, setFine] = useState(0);

  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { user, token } = auth;
  const [role, setRole] = useState(null);

  const [reasonOptions, setReasonOptions] = useState([]);
  const [selectedReasonId, setSelectedReasonId] = useState("");

  useEffect(() => {
    if (showReturnModal) {
      fetch(`${apiUrl}/reasons`)
        .then((response) => response.json())
        .then((data) => {
          setReasonOptions(data);
        })
        .catch((error) => {
          console.error("Error fetching reasons:", error);
        });
    }
  }, [showReturnModal]);

  useEffect(() => {
    if (!user) return;
    setRole(user.role);

    const fromNotification =
      sessionStorage.getItem("fromNotification") === "true";
    sessionStorage.removeItem("fromNotification");

    if (user.role === 1) {
      axios
        .get(`${apiUrl}/borrow`, {
          headers: {
            Authorization: token, // <--- ส่ง token ที่คุณได้จาก context
          },
        })
        .then((res) => {
          let data = res.data;

          console.log(data);

          // ✅ เรียงให้รออนุมัติอยู่บนสุด ถ้ามาจากแจ้งเตือน
          if (fromNotification) {
            data = data.sort((a, b) => {
              if (
                a.status_name === "รอการอนุมัติ" &&
                b.status_name !== "รอการอนุมัติ"
              )
                return -1;
              if (
                a.status_name !== "รอการอนุมัติ" &&
                b.status_name === "รอการอนุมัติ"
              )
                return 1;
              return b.request_id - a.request_id;
            });
          }
          setHistory(data);
        });
    } else if (user.role === 2) {
      fetchBorrowMember(user.id);
    }
  }, [user]);

  useEffect(() => {
    const cameFromNotification = sessionStorage.getItem("fromNotification");

    if (cameFromNotification && history.length > 0) {
      const sorted = [...history].sort((a, b) => {
        if (
          a.status_name === "รอการอนุมัติ" &&
          b.status_name !== "รอการอนุมัติ"
        )
          return -1;
        if (
          a.status_name !== "รอการอนุมัติ" &&
          b.status_name === "รอการอนุมัติ"
        )
          return 1;
        return new Date(b.request_date) - new Date(a.request_date); // เรียงใหม่ล่าสุดลงล่าง
      });
      setHistory(sorted);

      sessionStorage.removeItem("fromNotification"); // เคลียร์ไม่ให้เรียงซ้ำ
    }
  }, [history]);

  const fetchBorrow = () => {
    axios
      .get(`${apiUrl}/borrow`, {
        headers: {
          Authorization: token, // ✅ เพิ่มตรงนี้
        },
      })
      .then((res) => setHistory(res.data));
  };

  const fetchBorrowMember = (id) => {
    axios
      .get(`${apiUrl}/borrow/${id}`, {
        headers: {
          Authorization: token, // ✅ เพิ่มตรงนี้เหมือนกัน
        },
      })
      .then((res) => setHistory(res.data))
      .catch((error) => {
        console.error("Error fetching borrow data:", error);
        if (error.response) {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: error.response.data.error,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
          });
        }
      });
  };
  useEffect(() => {
    if (showReturnModal && user && user.username) {
      setReceiverName(user.username);
    }
  }, [showReturnModal, user]);

  useEffect(() => {
    if (showReturnModal && currentReturn && currentReturn.full_name) {
      setReturnedName(currentReturn.full_name);
    }
  }, [showReturnModal, currentReturn]);

  useEffect(() => {
    if (showCancelModal && user && user.username) {
      setCanceledByInput(user.username);
    }
  }, [showCancelModal, user]);
  const updateStatus = (id, status_name, qty, product_id) => {
    axios
      .put(`${apiUrl}/borrow/${id}`, {
        status_name,
        qty,
        product_id,
      })
      .then((res) => {
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: res.data.message, // เช่น "อนุมัติการยืมสำเร็จ"
        }).then(() => {
          role === 1 ? fetchBorrow() : fetchBorrowMember(user.id);
        });
      })
      .catch((error) => {
        if (error.response) {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: error.response.data.error, // เช่น "จำนวนสินค้าไม่เพียงพอ ไม่สามารถอนุมัติได้"
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
          });
        }
        console.error("Update error:", error);
      });
  };

  const handleOpenReceiveModal = (record) => {
    const remaining = record.quantity - (record.return_quantity || 0);
    setReturnGoodQty(remaining);
    setReturnDamagedQty(0);
    setReturnLostQty(0);
    setReturnFine(0);
    setReturnComment("");
    setCurrentReturn(record);
    setShowReceiveModal(true);
  };

const handleCloseModalReturn = () => {
  setShowReturnModal(false);
  setFine("ไม่มีค่าปรับ");
  // เคลียร์ค่าที่เกี่ยวข้อง
  setReturnGoodQty(0);
  setReturnDamagedQty(0);
  setReturnLostQty(0);
  setSelectedReasonId("");
  setReturnComment("");
};

  const handleQtyChange = (type, value) => {
    value = Math.max(0, Number(value)); // ห้ามติดลบ
    const other1 =
      type === "good"
        ? returnDamagedQty
        : type === "damaged"
        ? returnGoodQty
        : returnGoodQty;
    const other2 =
      type === "lost"
        ? returnDamagedQty
        : type === "damaged"
        ? returnLostQty
        : returnLostQty;

    const total = value + other1 + other2;
    const max = currentReturn
      ? currentReturn.quantity - (currentReturn.total_return || 0)
      : 0;

    if (total > max) return; // ❌ ถ้าเกิน ห้าม set ค่า

    if (type === "good") setReturnGoodQty(value);
    if (type === "damaged") setReturnDamagedQty(value);
    if (type === "lost") setReturnLostQty(value);
  };

  const [receiverName, setReceiverName] = useState(""); // ชื่อผู้รับคืน
  const [returnedName, setReturnedName] = useState("");
  const [returnTotal, setReturnTotal] = useState(0); // จำนวนรวมของคืนทั้งหมด

  // const updateReturnStatus = () => {
  //   if (!currentReturn || !isTotalValid()) return;

  //   const totalQty = returnGoodQty + returnDamagedQty + returnLostQty;
  //   const remaining = currentReturn.quantity - (currentReturn.return_quantity || 0);
  //   const overdueDays = Math.ceil((new Date() - new Date(currentReturn.due_return_date)) / (1000 * 60 * 60 * 24));
  //   const fine = (returnLostQty * currentReturn.price_per_item) + (overdueDays > 0 ? overdueDays * 50 * totalQty : 0);

  //   axios.post(`http://localhost:3001/return-detail`, {
  //     request_id: currentReturn.request_id,
  //     product_id: currentReturn.product_id,
  //     good_qty: returnGoodQty,
  //     damaged_qty: returnDamagedQty,
  //     lost_qty: returnLostQty,
  //     fine_amount: fine,
  //     note: returnComment,
  //     received_by: receiverName,
  //     returned_by: returnedName,
  //   }).then(() => {
  //     setShowReceiveModal(false);
  //     setReturnGoodQty(0);
  //     setReturnDamagedQty(0);
  //     setReturnLostQty(0);
  //     setReturnComment("");
  //     setReceiverName("");
  //     setReturnedName("");
  //     setCurrentReturn(null);
  //     role === 1 ? fetchBorrow() : fetchBorrowMember(user.id);
  //   });
  // };

  const handleCancelRequest = () => {
    if (!cancelTargetId || !cancelReason.trim()) return;
    axios
      .put(`http://localhost:3001/borrow/${cancelTargetId}/cancel`, {
        reason: cancelReason,
        canceled_by:
          user?.full_name && user.full_name.trim() !== ""
            ? user.full_name
            : user?.email || "unknown",
      })
      .then(() => {
        setCancelReason("");
        setCancelTargetId(null);
        setShowCancelModal(false);
        role === 1 ? fetchBorrow() : fetchBorrowMember(user.id);
      });
  };

  const DateComponent = ({ dateString }) =>
    new Date(dateString).toLocaleDateString("th-TH");

  const calculateFine = () => {
    if (!currentReturn) return 0;
   
    // const totalReturned = returnGoodQty + returnDamagedQty + returnLostQty;
    // const lateDays = Math.ceil((new Date() - new Date(currentReturn.due_return_date)) / (1000 * 60 * 60 * 24));

    const dateNow = new Date();
    const dateOld = new Date(currentReturn.due_return_date);

    const diffTime = dateNow - dateOld; // เอาเวลาต่าง
    const lateDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // แปลงเป็นจำนวนวัน
    

    console.log(lateDays);
    const lateFine = lateDays > 0 ? lateDays * 50 : 0;
    const lostFine = returnLostQty * (currentReturn.price_per_item || 0);
    let fine ="";
    if(lateFine && lostFine){
      fine = `เกินวันที่กำหนด ${lateFine} บาท, ค่าของสูญหาย ${lostFine} บาท`;
      return fine;
    }else if(lateFine || lostFine){
      if(lateFine){
        fine = `เกินวันที่กำหนด ${lateFine} บาท`;
      }else{
        fine = `ค่าของสูญหาย ${lostFine} บาท`;
      }
      return fine;
    }else if(!lateFine && !lostFine){
      fine = `ไม่มีค่าปรับ`;
      return fine;
    }
    
  };

  // ❌ ลบส่วนนี้ออกจากใน filteredHistory
  const handleCloseCancel = () => {
    setShowCancelModal(false);
    setCancelReason("");
    setCancelTargetId(null);
    setSelectedRequest(null);
  };

  const handleOpenCancelModal = (request) => {
    console.log("ข้อมูลที่ส่งเข้า Modal:", request);
    setSelectedRequest(request); // ข้อมูลคำขอจากปุ่ม
    setCancelTargetId(request.request_id); // เก็บไว้ใช้ยืนยัน
    setCancelReason(""); // เคลียร์เหตุผลเก่า
    setShowCancelModal(true); // เปิด modal
  };

  const filteredHistory = history.filter((his) => {
    // console.log(his); // ✅ ตรวจสอบว่าข้อมูลมาครบไหม
    const allowedStatuses = [
      "รอการอนุมัติ",
      "อนุมัติแล้ว",
      "ผู้ยืมได้รับของแล้ว",
      "ถูกยกเลิก",
      "คืนไม่ครบ",
      "เลยกำหนดคืน",
      "คืนไม่ครบ/มีของชำรุด",
    ];
    // const allowedStatuses = ["รอการอนุมัติ", "อนุมัติแล้ว", "ผู้ยืมได้รับของแล้ว", "รับของแล้ว" , "คืนไม่ครบ", "คืนของแล้ว"];
    const matchStatus = allowedStatuses.includes(his.status_name);

    const matchFilter = !filter || his.status_name === filter;

    const matchSearch =
      his.name?.toLowerCase().includes(search.toLowerCase()) ||
      his.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      his.frist_name?.toLowerCase().includes(search.toLowerCase()) ||
      his.last_name?.toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchFilter && matchSearch;
  });
  // console.log("ยืนยันการยกเลิกคำขอ:", user);
  const confirmCancel = (requestId) => {
    
    axios
      .put(
        `http://localhost:3001/borrow/${requestId}/cancel`,
        {
          cancel_reason: cancelReason,
          canceled_by:
            user?.username && user.username.trim() !== ""
              ? user.username
              : user?.email || "unknown",
        },
        {
          headers: { Authorization: token },
        }
      )
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "ยกเลิกคำขอเรียบร้อยแล้ว",
        });
        handleCloseCancel(); // ปิด modal
        role === 1 ? fetchBorrow() : fetchBorrowMember(user.id); // โหลดข้อมูลใหม่
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "ไม่สามารถยกเลิกได้",
          text: "โปรดลองใหม่ภายหลัง",
        });
      });
  };
  const formatDDate = (dateStr) => {
    if (!dateStr) return "-";

    const date = new Date(dateStr);
    if (isNaN(date)) return "-"; // ตรวจสอบว่าไม่ใช่วันที่

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear() + 543;

    return `${day}/${month}/${year}`;
  };
  const handleConfirmReturn = () => {
    if (!currentReturn) return;
    console.log(currentReturn);
    const total = returnGoodQty + returnDamagedQty + returnLostQty;
    const remaining =
      currentReturn.quantity - (currentReturn.return_quantity || 0);

    if (total > remaining) {
      Swal.fire("แจ้งเตือน", "จำนวนที่คืนรวมเกินจำนวนที่ค้างคืน", "warning");
      return;
    }

    if (!returnedName.trim()) {
      Swal.fire("คำขอไม่ถูกต้อง", "กรุณากรอกชื่อผู้คืนของ", "warning");
      return;
    }

    if (!receiverName.trim()) {
      Swal.fire("คำขอไม่ถูกต้อง", "กรุณากรอกชื่อผู้รับคืน", "warning");
      return;
    }
    // 🔔 แสดง SweetAlert2 แบบยืนยันก่อน
    Swal.fire({
      title: "ยืนยันการคืนของ?",
      text: "คุณแน่ใจหรือไม่ว่าต้องการยืนยันการคืนของรายการนี้",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ ถ้าผู้ใช้กดยืนยัน ค่อยส่ง axios
        axios
          .post(
            `${apiUrl}/return-detail`,
            {
              request_id: currentReturn.request_id,
              product_id: currentReturn.product_id,
              good_qty: parseInt(returnGoodQty),
              damaged_qty: parseInt(returnDamagedQty),
              lost_qty: parseInt(returnLostQty),
              fine_amount: calculateFine(),
              note: returnComment,
              returned_by: returnedName,
              received_by: receiverName,
              qty: currentReturn.total,
            },
            {
              headers: { Authorization: token },
            }
          )
          .then(() => {
            Swal.fire("สำเร็จ", "บันทึกการคืนเรียบร้อยแล้ว", "success");

            setShowReturnModal(false);
            setReturnGoodQty(0);
            setReturnDamagedQty(0);
            setReturnLostQty(0);
            setReturnComment("");
            setReceiverName("");
            setReturnedName("");
            setCurrentReturn(null);

            role === 1 ? fetchBorrow() : fetchBorrowMember(user.id);
          })
          .catch((err) => {
            console.error("Error:", err);
            if (err.response) {
              Swal.fire(
                "ผิดพลาด",
                err.response.data || "ไม่สามารถบันทึกได้",
                "error"
              );
            } else {
              Swal.fire(
                "ข้อผิดพลาด",
                "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
                "error"
              );
            }
          });
      }
    });
    // axios.post(`${apiUrl}/reasons`/return-detail", {
    //   request_id: currentReturn.request_id,
    //   product_id: currentReturn.product_id,
    //   good_qty: parseInt(returnGoodQty),
    //   damaged_qty: parseInt(returnDamagedQty),
    //   lost_qty: parseInt(returnLostQty),
    //   fine_amount: calculateFine(),
    //   note: returnComment,
    //   returned_by: returnedName, // 👈 ส่งชื่อแทน user.id
    //   received_by: receiverName,
    // }, {
    //   headers: { Authorization: token }
    // }).then(() => {
    //   Swal.fire("สำเร็จ", "บันทึกการคืนเรียบร้อยแล้ว", "success");

    //   setShowReturnModal(false);
    //   setReturnGoodQty(0);
    //   setReturnDamagedQty(0);
    //   setReturnLostQty(0);
    //   setReturnComment("");
    //   setReceiverName("");
    //   setReturnedName("");
    //   setCurrentReturn(null);
    //   role === 1 ? fetchBorrow() : fetchBorrowMember(user.id);
    // }).catch((err) => {
    //   console.error("Error:", err);
    //   if (err.response) {
    //     Swal.fire("ผิดพลาด", err.response.data || "ไม่สามารถบันทึกได้", "error");
    //   } else {
    //     Swal.fire("ข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error");
    //   }
    // });
  };

  const handleClose = () => setShow(false);
  const handleShow = (name, email, phone, team) => {
    setMName(name);
    setEmail(email);
    setPhone(phone);
    setTeam(team);
    setShow(true);
  };

  const isTotalValid = () => {
    const total = returnGoodQty + returnDamagedQty + returnLostQty;
    const maxReturnable = currentReturn
      ? currentReturn.quantity - (currentReturn.return_quantity || 0)
      : 0;
    return total <= maxReturnable;
  };

  const isReturnValid = () => {
    const total = returnGoodQty + returnDamagedQty + returnLostQty;
    const max = currentReturn
      ? currentReturn.quantity - (currentReturn.return_quantity || 0)
      : 0;
    return total > 0 && total <= max && receiverName.trim() !== "";
  };
  return (
    <div className="d-flex flex-column flex-lg-row">
      <Navbar />
      <Container
        className="py-4"
        style={{
          backgroundColor: "#F5F5F5",
          minHeight: "100vh",
          marginTop: "80px",
        }}
      >
        <Card>
          <Card.Body>
            <h4 className="text-center mb-3" style={{ color: "#2e7d32" }}>
              {role === 1 ? "รายการคำขอ" : "รายการคำขอ"}
            </h4>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="🔍 ค้นหารายการทรัพย์สิน หรือชื่อผู้ใช้..."
                  className="form-control"
                  style={{ width: "350px" }} // ✅ เพิ่มความกว้างที่ต้องการ
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                />
              </Col>
              <Col md={6} className="d-flex justify-content-end">
                <Form.Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={{ width: "250px" }}
                >
                  <option value="">-- กรุณาเลือกสถานะ --</option>
                  <option value="รอการอนุมัติ">รอการอนุมัติ</option>
                  <option value="ถูกยกเลิก">ถูกยกเลิก</option>
                  <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
                  <option value="ผู้ยืมได้รับของแล้ว">
                    ผู้ยืมได้รับของแล้ว
                  </option>
                  <option value="คืนไม่ครบ">คืนไม่ครบ</option>
                  <option value="เลยกำหนดคืน">เลยกำหนดคืน</option>
                  <option value="คืนไม่ครบ/มีของชำรุด">คืนไม่ครบ/มีของชำรุด</option>
                </Form.Select>
              </Col>
            </Row>

            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>รายการที่</th>
                  {role === 1 && <th>ผู้ใช้งาน</th>}
                  <th>ทีม</th>
                  <th>ทรัพย์สิน</th>
                  <th>จำนวนที่ยืม</th>
                  <th>วันที่ยืม</th>
                  <th>กำหนดคืน</th>
                  <th>วันที่รับของ</th>
                  {/* <th>วันที่คืน</th> */}
                  <th>ค้างคืน</th>
                  {/* <th>คืนแล้ว</th> */}
                  <th>วัตถุประสงค์การยืม</th>
                  <th>สถานะ</th>
                  {role === 1 && <th>จัดการ</th>}
                </tr>
              </thead>
              <tbody>
                {filteredHistory
                  .sort((a, b) => {
                    if (
                      a.status_name === "รอการอนุมัติ" &&
                      b.status_name !== "รอการอนุมัติ"
                    )
                      return -1;
                    if (
                      a.status_name !== "รอการอนุมัติ" &&
                      b.status_name === "รอการอนุมัติ"
                    )
                      return 1;
                    return b.request_id - a.request_id;
                  })
                  .map((r, index) => (
                    <tr key={r.request_id}>
                      <td>{index + 1}</td>
                      {role === 1 && (
                        <td
                          onClick={() =>
                            handleShow(
                              r.full_name || `${r.frist_name} ${r.last_name}`,
                              r.email,
                              r.phone_number,
                              r.team
                            )
                          }
                        >
                          {r.full_name && r.full_name.trim() !== ""
                            ? r.full_name
                            : `${r.frist_name} ${r.last_name}`}
                        </td>
                      )}
                      <td>{r.team}</td>
                      {role === 1 && <td>{r.product_name}</td>}
                      {role === 2 && <td>{r.product_name}</td>}
                      <td>{r.quantity}</td>
                      <td>{formatDDate(r.request_date)}</td>
                      <td>{formatDDate(r.due_return_date)}</td>
                      <td>{formatDDate(r.receive_date)}</td>
                      {/* <td>{r.return_date ? <DateComponent dateString={r.return_date} /> : "-"}</td> */}
                      {role === 1 && <td>{r.total || 0}</td>}
                      {role === 2 && (
                        <td
                          style={{
                            color:
                              r.status_name === "คืนไม่ครบ" ? "red" : "black",
                          }}
                        >
                          {r.total || 0}
                        </td>
                      )}
                      {/* <td style={{ color: r.status_name === "คืนไม่ครบ" ? "green" : "black" }}>{["รับของแล้ว", "คืนไม่ครบ"].includes(r.status_name) ? (r.quantity || 0) - (r.total || 0) : r.status_name === "ส่งคืนแล้ว" ? 0 : "-"}</td> */}
                      {/* <td>{r.return_date ? (getFine(r.request_date, r.return_date) * r.price_per_item).toFixed(2) : 0}</td> */}
                      <td>{r.note}</td>
                      <td
                        style={{
                          fontWeight: "500",
                          color:
                            r.status_name === "ถูกยกเลิก"
                              ? "red"
                              : r.status_name === "คืนไม่ครบ"
                              ? "red"
                              : r.status_name === "รอการอนุมัติ"
                              ? "orange"
                              : r.status_name === "อนุมัติแล้ว"
                              ? "green"
                              : "black",
                        }}
                      >
                        {r.status_name}
                      </td>
                      {role === 1 && (
                        <td>
                          {r.status_name === "รอการอนุมัติ" && (
                            <>
                              <Button
                                variant="success"
                                className="w-100 my-1"
                                onClick={() => {
                                  setApproveTarget({
                                    request_id: r.request_id,
                                    quantity: r.quantity,
                                    product_id: r.product_id,
                                  });
                                  setShowApproveModal(true);
                                }}
                              >
                                อนุมัติ
                              </Button>

                              <Button
                                variant="outline-danger"
                                className="w-100 my-1"
                                onClick={() => handleOpenCancelModal(r)} // ✅ เรียกฟังก์ชันนี้แทน
                              >
                                ยกเลิก
                              </Button>
                            </>
                          )}

                          {r.status_name?.trim() === "อนุมัติแล้ว" && (
                            <Button
                              variant="warning"
                              className="w-100 my-1"
                              onClick={() => {
                                updateStatus(
                                  r.request_id,
                                  "ผู้ยืมได้รับของแล้ว",
                                  r.quantity,
                                  r.product_id
                                );
                              }}
                            >
                              ยืนยันการรับของ
                            </Button>
                          )}

                          {r.status_name === "ผู้ยืมได้รับของแล้ว" && (
                            <Button
                              variant={
                                r.status_name === "คืนไม่ครบ"
                                  ? "warning"
                                  : "warning"
                              }
                              className="w-100 my-1"
                              onClick={() => {
                                setCurrentReturn(r);
                                setShowReturnModal(true);
                              }}
                            >
                              ตรวจรับของคืน
                            </Button>
                          )}
                          {r.status_name === "คืนไม่ครบ" &&
                            r.quantity !== r.total_return && (
                              <Button
                                variant="warning"
                                className="w-100 my-1"
                                onClick={() => {
                                  setCurrentReturn(r);
                                  setShowReturnModal(true);
                                }}
                              >
                                ตรวจรับของคืน
                              </Button>
                          )}
                          {r.status_name === "คืนไม่ครบ/มีของชำรุด" &&
                            r.quantity !== r.total_return && (
                              <Button
                                variant="warning"
                                className="w-100 my-1"
                                onClick={() => {
                                  setCurrentReturn(r);
                                  setShowReturnModal(true);
                                }}
                              >
                                ตรวจรับของคืน
                              </Button>
                          )}

                          {r.status_name === "คืนของแล้ว" && (
                            <Button
                              variant={
                                r.status_name === "คืนไม่ครบ"
                                  ? "warning"
                                  : "secondary"
                              }
                              className="w-100 my-1"
                              onClick={() => {
                                setCurrentReturn(r);
                                setShowReturnModal(true);
                              }}
                              disabled={r.status_name === "คืนของแล้ว"}
                            >
                              {r.status_name === "คืนของแล้ว"
                                ? "คืนทั้งหมดแล้ว"
                                : "ตรวจรับของคืน"}
                            </Button>
                          )}
                          {r.status_name === "เลยกำหนดคืน" && (
                            <Button
                              variant={
                                r.status_name === "คืนไม่ครบ"
                                  ? "warning"
                                  : "warning"
                              }
                              className="w-100 my-1"
                              onClick={() => {
                                setCurrentReturn(r);
                                setShowReturnModal(true);
                              }}
                            >
                              {r.status_name === "เลยกำหนดคืน"
                                ? "ตรวจรับของคืน"
                                : "ตรวจรับของคืน"}
                            </Button>
                          )}

                          {r.status_name === "ถูกยกเลิก" && (
                            <Button
                              variant="danger"
                              className="w-100 my-1"
                              disabled={true}
                            >
                              ถูกยกเลิก
                            </Button>
                          )}
                          {/* {(r.status_name === "รับของแล้ว" || r.status_name === "คืนไม่ครบ") && (
                            <Button
                              variant={r.status_name === "คืนไม่ครบ" ? "warning" : "secondary"}
                              className="w-100 my-1"
                              onClick={() => {
                                setCurrentReturn(r);
                                setShowReturnModal(true);
                              }}
                              disabled={r.status_name === "รับของแล้ว"}
                            >
                              {r.status_name === "รับของแล้ว" ? "คืนทั้งหมดแล้ว" : "ตรวจรับของคืน"}
                            </Button>
                          )} */}
                        </td>
                      )}
                      {role === 2 && (
                        <td>
                          {r.status_name === "รอการอนุมัติ" && (
                            <>
                              <Button
                                variant="outline-danger"
                                className="w-100 my-1"
                                onClick={() => handleOpenCancelModal(r)} // ✅ เรียกฟังก์ชันนี้แทน
                              >
                                ยกเลิก
                              </Button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        <Modal
          show={showReturnModal}
          onHide={() => setShowReturnModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>ตรวจรับของคืน</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {currentReturn && (
              <>
                <p>
                  จำนวนที่คืน{" "}
                  <strong>
                    (รวมไม่เกิน{" "}
                    {currentReturn.quantity - (currentReturn.total_return || 0)}{" "}
                    ชิ้น)
                  </strong>
                </p>
                <Row className="mb-3">
                  <Col>
                    <Form.Label>สมบูรณ์</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={returnGoodQty}
                      onChange={(e) => handleQtyChange("good", e.target.value)}
                    />
                  </Col>
                  <Col>
                    <Form.Label>ชำรุด</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={returnDamagedQty}
                      onChange={(e) =>
                        handleQtyChange("damaged", e.target.value)
                      }
                    />
                  </Col>
                  <Col>
                    <Form.Label>สูญหาย</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={returnLostQty}
                      onChange={(e) => handleQtyChange("lost", e.target.value)}
                    />
                  </Col>
                </Row>

                {/* <Form.Group className="mb-3">
                  <Form.Label>หมายเหตุ (ถ้ามี)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={returnComment}
                    onChange={(e) => setReturnComment(e.target.value)}
                  />
                </Form.Group> */}

                <Form.Group className="mb-3">
                  <Form.Label>ชื่อผู้รับคืน</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="กรอกชื่อผู้รับคืน"
                    value={user.username}
                    readOnly
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>ชื่อผู้คืน</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="กรอกชื่อผู้คืน"
                    value={currentReturn.full_name}
                    readOnly
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>หมายเหตุ (เลือกเหตุผล)</Form.Label>
                  <Form.Select
                    value={selectedReasonId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setSelectedReasonId(selectedId);

                      const selected = reasonOptions.find(
                        (r) => r.id.toString() === selectedId
                      );

                      if (selectedId !== "8") {
                        // ถ้าไม่ใช่อื่นๆ เซ็ต returnComment ทันที
                        setReturnComment(selected ? selected.description : "");
                      } else {
                        // ถ้าเป็น "อื่นๆ" เคลียร์ ให้ user พิมพ์เอง
                        setReturnComment("");
                      }
                    }}
                  >
                    <option value="">-- กรุณาเลือกเหตุผล --</option>
                    {reasonOptions.map((reason) => (
                      <option key={reason.id} value={reason.id}>
                        {reason.description}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {selectedReasonId === "8" && (
                  <Form.Group className="mb-3">
                    <Form.Label>กรุณากรอกหมายเหตุเพิ่มเติม</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="ระบุหมายเหตุ"
                      value={returnComment}
                      onChange={(e) => setReturnComment(e.target.value)}
                    />
                  </Form.Group>
                )}

                <p>
                  💸 ค่าปรับ: <span id="ratefine"><strong >{calculateFine()}</strong></span>
                </p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseModalReturn}
          >
            ปิด
          </Button>
            <Button
              variant="success"
              onClick={handleConfirmReturn}
              disabled={!isReturnValid()}
            >
              ยืนยันการคืน
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showCancelModal} onHide={handleCloseCancel}>
          <Modal.Header closeButton>
            <Modal.Title>ยกเลิกคำขอยืม</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>รหัสคำขอ:</strong> {selectedRequest?.request_id || "-"}
            </p>
            <p>
              <strong>ผู้ยืม:</strong>{" "}
              {selectedRequest?.full_name &&
              selectedRequest.full_name.trim() !== ""
                ? selectedRequest.full_name
                : `${selectedRequest?.frist_name || ""} ${
                    selectedRequest?.last_name || ""
                  }`}{" "}
              ({selectedRequest?.team || "-"})
            </p>

            <p>
              <strong>ทรัพย์สิน:</strong> {selectedRequest?.product_name || "-"}
            </p>
            <p>
              <strong>จำนวน:</strong> {selectedRequest?.quantity || 0} ชิ้น
            </p>
            <p>
              <strong>วันที่ยืม:</strong>{" "}
              <DateComponent dateString={selectedRequest?.request_date} />
            </p>
            <p>
              <strong>วัตถุประสงค์:</strong> {selectedRequest?.note || "-"}
            </p>

            <Form.Group className="mt-3">
              <Form.Label>
                <strong>เหตุผลในการยกเลิก</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="กรุณาระบุเหตุผล"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mt-2">
              <Form.Label>
                <strong>ชื่อผู้ยกเลิก</strong>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="ระบุชื่อ-นามสกุลของผู้ยกเลิก"
                value={user.username}
                readOnly
              />
            </Form.Group>

            <p className="mt-3">
              <strong>วันที่ยกเลิก:</strong>{" "}
              <DateComponent dateString={new Date().toISOString()} />
            </p>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseCancel}>
              ปิด
            </Button>
            <Button
              variant="danger"
              onClick={() => confirmCancel(selectedRequest.request_id)}
              disabled={!cancelReason.trim()}
            >
              ยืนยันการยกเลิก
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showApproveModal}
          onHide={() => setShowApproveModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>ยืนยันการอนุมัติ</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>หมายเหตุ / เหตุผลในการอนุมัติ</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowApproveModal(false);
                setApproveNote("");
                setApproveTarget(null);
              }}
            >
              ยกเลิก
            </Button>
            <Button
              variant="success"
              disabled={!approveNote.trim()}
              onClick={() => {
                updateStatus(
                  approveTarget.request_id,
                  "อนุมัติแล้ว",
                  approveTarget.quantity,
                  approveTarget.product_id
                );
                setShowApproveModal(false);
                setApproveNote("");
                setApproveTarget(null);
              }}
            >
              ยืนยันการอนุมัติ
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default History;
