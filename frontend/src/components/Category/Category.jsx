import { useState, useContext, useEffect } from "react";
import { Container, Card, Table, Button, Form, Modal, OverlayTrigger, Tooltip, Row, Col } from "react-bootstrap";
import { AuthContext } from "../../context/authContext";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Category() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  const fetchCategories = async () => {
    const response = await axios.get("http://localhost:3001/categories");
    setCategories(response.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!name.trim()) return;
    try {
      await axios.post("http://localhost:3001/categories", { name });
      setName(""); // เคลียร์ช่องกรอก
      fetchCategories(); // รีเฟรชรายการ
      Swal.fire("เพิ่มสำเร็จ!", "ประเภทถูกเพิ่มแล้ว", "success");
    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด", err.message, "error");
    }
  };
  const editCategory = async (cat) => {
    const { value: newName } = await Swal.fire({
      title: "แก้ไขชื่อประเภท",
      input: "text",
      inputLabel: "ชื่อใหม่",
      inputValue: cat.name,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      inputValidator: (value) => {
        if (!value) {
          return "กรุณากรอกชื่อใหม่";
        }
      },
    });
  
    if (newName && newName !== cat.name) {
      try {
        await axios.put(`http://localhost:3001/categories/${cat.category_id}`, {
          name: newName,
        });
        fetchCategories(); // รีโหลดรายการ
        Swal.fire("สำเร็จ!", "ชื่อประเภทถูกอัปเดตแล้ว", "success");
      } catch (err) {
        Swal.fire("เกิดข้อผิดพลาด", err.message, "error");
      }
    }
  };
  
  
  const deleteCategory = async (id) => {
    const confirm = await Swal.fire({
      title: "คุณแน่ใจไหม?",
      text: "การลบนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก"
    });
  
    if (confirm.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3001/categories/${id}`);
        fetchCategories(); // รีเฟรชรายการ
        Swal.fire("ลบแล้ว!", "ประเภทถูกลบเรียบร้อย", "success");
      } catch (err) {
        Swal.fire("เกิดข้อผิดพลาด", err.message, "error");
      }
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
              จัดการประเภทผลิตภัณฑ์
            </h4>
            <div className="d-flex align-items-center flex-wrap gap-3 mb-3">
              <Form.Group controlId="search" style={{ maxWidth: "400px" }}>
                <Form.Control
                  type="text"
                  placeholder="ชื่อประเภท"
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    borderRadius: "8px",
                    padding: "10px 16px",
                    border: "1px solid #ced4da",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                    fontSize: "16px",
                  }}
                />
              </Form.Group>
              {/* <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อประเภท" /> */}
              <Button variant="success" onClick={addCategory}>
                เพิ่ม
              </Button>
              </div>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>category_id</th>
                  <th>name</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.category_id}>
                    <td>{cat.category_id}</td>
                    <td>{cat.name}</td>
                    <td>
                      <Button variant="warning" onClick={() => editCategory(cat)}>
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => deleteCategory(cat.category_id)} style={{ marginLeft: "10px" }}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Category;
