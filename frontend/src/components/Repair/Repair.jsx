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
import Swal from "sweetalert2";
const apiUrl = import.meta.env.VITE_API_URL;

function Repair() {
  const { token } = useContext(AuthContext);
  const [returnList, setReturnList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [repairQuantity, setRepairQuantity] = useState(0);
  const [repairComment, setRepairComment] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const fetchReturnDetail = () => {
    const url = `${apiUrl}/return-detail`;
    // console.log("ข้อมูลที่ได้:", url);
    axios
      .get(url, {
        headers: { Authorization: token },
      })
      .then((res) => setReturnList(res.data))
      .catch((err) => console.error("เกิดข้อผิดพลาด:", err));
  };
  useEffect(() => {
    fetchReturnDetail();
  }, []);
  const damagedReturns = returnList
    .filter((item) => item.returned_damaged > 0 || item.returned_lost > 0 || item.repaired_quantity !== 0)
    .sort((a, b) => {
      if (a.returned_damaged === 0 && b.returned_damaged !== 0) return 1;
      if (a.returned_damaged !== 0 && b.returned_damaged === 0) return -1;
      const dateA = new Date(a.return_date);
      const dateB = new Date(b.return_date);
      return dateB - dateA;
    });

    const updatedDamagedReturn = damagedReturns.map(item => {
      if (item.returned_damaged >= 1 && item.returned_lost === 0 || item.returned_damaged >= 1 && item.returned_lost >= 1 && item.repaired_quantity !== null) {
        return {
          ...item,
          status_show: "รอซ่อมแซม",
        };
      } else if(item.returned_damaged === 0 && item.returned_lost === 0 || item.returned_damaged === 0 && item.returned_lost > 0 && item.repaired_quantity !== 0) {
        return {
          ...item,
          status_show: "ซ่อมแซมแล้ว",
        };
      } else if(item.returned_damaged === 0 && item.returned_lost >= 1 && item.repaired_quantity === 0 || item.returned_damaged >= 1 && item.returned_lost >= 1 && item.repaired_quantity !== null || item.returned_damaged === 0 && item.returned_lost > 0 && item.repaired_quantity !== 0) {
        return {
          ...item,
          status_show: "สูญหาย",
        };
      }
    });
    
  // const updatedDamagedReturn = damagedReturns.map(item => {
  //   if (item.returned_damaged >= 1 && item.returned_lost === 0) {
  //     return {
  //       ...item,
  //       status_show: "รอซ่อมแซม",
  //     };
  //   } else if(item.returned_damaged === 0 && item.returned_lost === 0) {
  //     return {
  //       ...item,
  //       status_show: "ซ่อมแซมแล้ว",
  //     };
  //   } else if(item.returned_damaged >= 1 && item.returned_lost >= 1 && item.repaired_quantity !== null) {
  //     return {
  //       ...item,
  //       status_show: "ชำรุด/สูญหาย",
  //     };
  //   } else if(item.returned_damaged === 0 && item.returned_lost >= 1 && item.repaired_quantity === 0) {
  //     return {
  //       ...item,
  //       status_show: "สูญหาย",
  //     };
  //   }else if(item.returned_damaged === 0 && item.returned_lost > 0 && item.repaired_quantity !== 0) {
  //     return {
  //       ...item,
  //       status_show: "สูญหาย/ซ่อมแล้ว",
  //     };
  //   }
  // });
  const repaired = updatedDamagedReturn.filter((rep) => {
    console.log(rep); // ✅ ตรวจสอบว่าข้อมูลมาครบไหม
    const allowedStatuses = [
      "รอซ่อมแซม",
      "ซ่อมแซมแล้ว",
      "ชำรุด/สูญหาย",
      "สูญหาย/ซ่อมแล้ว",
      "สูญหาย",
    ];
    // const allowedStatuses = ["รอการอนุมัติ", "อนุมัติแล้ว", "ผู้ยืมได้รับของแล้ว", "รับของแล้ว" , "คืนไม่ครบ", "คืนของแล้ว"];
    const matchStatus = allowedStatuses.includes(rep.status_show);

    const matchFilter = !filter || rep.status_show === filter;

    const matchSearch =
      rep.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      rep.received_by_name?.toLowerCase().includes(search.toLowerCase()) ||
      rep.member_name?.toLowerCase().includes(search.toLowerCase()) ||
      rep.returned_by_name?.toLowerCase().includes(search.toLowerCase()) ||
      rep.status_show?.toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchFilter && matchSearch;
  });
  const handleShowModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };
  const CloseModal = () => {
    setShowModal(false);
    setRepairQuantity(0);
    setRepairComment("");
  }
  const formatDDate = (dateStr) => {
    if (!dateStr) return '-';
  
    const date = new Date(dateStr);
    if (isNaN(date)) return '-'; // ตรวจสอบว่าไม่ใช่วันที่
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear() + 543;
  
    return `${day}/${month}/${year}`;
  };
  const handleUpdateRepair = async () => {
    if (!selectedItem) return;
    if (!repairQuantity || !repairComment) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกข้อมูลให้ครบทุกช่องก่อนส่งคำร้อง",
        confirmButtonColor: "#2e7d32",
      });
      return;
    }
    try {
      await axios.put(`${apiUrl}/repair/${selectedItem.return_id}`, {
        repaired_quantity: repairQuantity,
        repair_note: repairComment,
        product_id: selectedItem.product_id,
      });

      Swal.fire("สำเร็จ!", "อัปเดตรายการซ่อมเรียบร้อย", "success");
      setShowModal(false);
      setRepairQuantity(0);
      setRepairComment("");
      fetchReturnDetail(); // รีโหลดข้อมูลหลังอัปเดต
    } catch (err) {
      Swal.fire("ผิดพลาด", err.message, "error");
    }
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
              จัดการรายการชำรุด/สูญหาย
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
                    <option value="">ทั้งหมด</option>
                    <option value="รอซ่อมแซม">รอซ่อมแซม</option>
                    <option value="ซ่อมแซมแล้ว">ซ่อมแซมแล้ว</option>
                    {/* <option value="ชำรุด/สูญหาย">ชำรุด/สูญหาย</option>
                    <option value="สูญหาย/ซ่อมแล้ว">สูญหาย/ซ่อมแล้ว</option> */}
                    <option value="สูญหาย">สูญหาย</option>
                  </Form.Select>
                </Col>
              </Row>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>ชื่อทรัพย์สิน</th>
                  <th>จำนวนชำรุด</th>
                  <th>จำนวนสูญหาย</th>
                  <th>จำนวนที่ซ่อมเสร็จ</th>
                  <th>หมายเหตุ</th>
                  <th>รายละเอียดการซ่อม</th>
                  <th>คืนโดย</th>
                  <th>รับโดย</th>
                  <th>สถานะ</th>
                  <th>วันที่ส่งซ่อม</th>
                  <th>วันที่ซ่อมเสร็จ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {repaired.map((item, index) => (
                  <tr key={item.return_id}>
                    <td>{index + 1}</td>
                    <td>{item.product_name}</td>
                    <td>{item.returned_damaged}</td>
                    <td>{item.returned_lost}</td>
                    <td>{item.repaired_quantity || "-"}</td>
                    <td>{item.note || "-"}</td>
                    <td>{item.repair_note || "-"}</td>
                    <td>{item.member_name}</td>
                    <td>{item.returned_by_name}</td>
                    {item.returned_damaged >= 1 && item.returned_lost === 0 && (
                      <>
                        {/* <td>
                          <div className="text-center bg-warning" style={{ color: "warning" , borderRadius: "100px"}}>
                            รอซ่อมแซม
                          </div>
                        </td> */}
                        <td
                        style={{
                          fontWeight: "500",
                          color:
                            "#ffc107",
                        }}
                      >
                        รอซ่อมแซม
                      </td>
                        <td>{formatDDate(item.return_date)}</td>
                        <td>{formatDDate(item.repair_date)}</td>
                        <td>
                          <Button
                            variant="warning"
                            onClick={() => handleShowModal(item)}
                          >
                            อัปเดตสถานะ
                          </Button>
                        </td>
                      </>
                    )}
                    {item.returned_damaged === 0 && item.returned_lost === 0 && (
                      <>
                        {/* <td>
                          <div className="text-center bg-success" style={{ color: "white" , borderRadius: "100px"}}>
                            ซ่อมแซมแล้ว
                          </div>
                        </td> */}
                        <td
                        style={{
                          fontWeight: "500",
                          color:
                            "#198754",
                        }}
                      >
                        ซ่อมแซมแล้ว
                      </td>
                        <td>{formatDDate(item.return_date)}</td>
                        <td>{formatDDate(item.repair_date)}</td>
                        <td>
                          <Button
                            variant="warning"
                            disabled
                            onClick={() => handleShowModal(item)}
                          >
                            อัปเดตสถานะ
                          </Button>
                        </td>
                      </>
                    )}
                    {item.returned_damaged >= 1 && item.returned_lost >= 1 && item.repaired_quantity !== null   && (
                      <>
                        {/* <td>
                          <div className="text-center bg-danger" style={{ color: "white" , borderRadius: "100px"}}>
                            ชำรุด/สูญหาย
                          </div>
                        </td> */}
                        <td
                        style={{
                          fontWeight: "500",
                          color:
                            "#dc3545",
                        }}
                      >
                        ชำรุด/สูญหาย
                      </td>
                        <td>{formatDDate(item.return_date)}</td>
                        <td>{formatDDate(item.repair_date)}</td>
                        <td>
                          <Button
                            variant="warning"
                            onClick={() => handleShowModal(item)}
                          >
                            อัปเดตสถานะ
                          </Button>
                        </td>
                      </>
                    )}
                    {item.returned_damaged === 0 && item.returned_lost >= 1 && item.repaired_quantity === 0 && (
                      <>
                        {/* <td>
                          <div className="text-center bg-warning" style={{ color: "white" , borderRadius: "100px"}}>
                            สูญหาย
                          </div>
                        </td> */}
                        <td
                        style={{
                          fontWeight: "500",
                          color:
                            "#0d6efd",
                        }}
                      >
                        สูญหาย
                      </td>
                        <td>{formatDDate(item.return_date)}</td>
                        <td>{formatDDate(item.repair_date)}</td>
                        <td>
                          <Button
                            variant="danger"
                            disabled
                          >
                            ของสูญหาย
                          </Button>
                        </td>
                      </>
                    )}
                    { item.returned_damaged === 0 && item.returned_lost > 0 && item.repaired_quantity !== 0 && (
                      <>
                        {/* <td>
                          <div className="text-center bg-warning" style={{ color: "white" , borderRadius: "100px"}}>
                            สูญหาย/ซ่อมแล้ว
                          </div>
                        </td> */}
                        <td
                        style={{
                          fontWeight: "500",
                          color:
                            "#fd7e14",
                        }}
                      >
                        สูญหาย/ซ่อมแล้ว
                      </td>
                        <td>{formatDDate(item.return_date)}</td>
                        <td>{formatDDate(item.repair_date)}</td>
                        <td>
                          <Button
                            variant="danger"
                            disabled
                          >
                            ของสูญหาย
                          </Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>รายละเอียดการซ่อมแซม</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <p>
                <strong>ชื่อทรัพย์สิน:</strong> {selectedItem.product_name}
              </p>
              <p>
                <strong>จำนวนชำรุด:</strong> {selectedItem.returned_damaged}
              </p>
              <p>
                <strong>หมายเหตุ:</strong> {selectedItem.note || "-"}
              </p>
              <p>
                <strong>คืนโดย:</strong> {selectedItem.returned_by_name}
              </p>
              <p>
                <strong>รับโดย:</strong> {selectedItem.received_by_name}
              </p>
              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>จำนวนที่ซ่อมเสร็จ</strong>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  min="1"
                  max={selectedItem.returned_damaged || 1}
                  value={repairQuantity}
                  onChange={(e) => {
                    // ตรวจสอบให้ไม่เกิน max และ min
                    let value = e.target.value;
                    if (value < 1) value = 1;
                    if (value > (selectedItem.returned_damaged || 1))
                      value = selectedItem.returned_damaged || 1;

                    setRepairQuantity(value); // อัปเดตค่าที่ถูกต้อง
                  }}
                />
                <Form.Text muted>
                  มีทั้งหมด {selectedItem.returned_damaged || 0} รายการ
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>รายละเอียดการซ่อมแซม</strong>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="ระบุรายละเอียดการซ่อมแซม"
                  required
                  onChange={(e) => setRepairComment(e.target.value)}
                />
              </Form.Group>
              {/* เพิ่มฟอร์มอัปเดตสถานะหากต้องการ */}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => CloseModal()}>
            ปิด
          </Button>
          <Button variant="success" onClick={handleUpdateRepair}>
            บันทึก
          </Button>
          {/* ปุ่มบันทึกสถานะหรืออื่น ๆ */}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Repair;
