import React, { useState, useEffect, useContext, useRef } from "react";
import { Container, Card, Form, Button, Row, Col, Modal } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";

const paginate = (items, currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
};

// const renderSizeOptions = (category_id) => {
//   if (!category_id) {
//     return <option value="">กรุณาเลือกประเภทก่อน</option>;
//   }

//   if (["1", "2", "3"].includes(category_id)) {
//     return (
//       <>
//         <option value="">เลือกขนาด</option>
//         <option value="S">S</option>
//         <option value="M">M</option>
//         <option value="L">L</option>
//         <option value="XL">XL</option>
//         <option value="Free Size">Free Size</option>
//       </>
//     );
//   } else if (category_id === "4") {
//     return (
//       <>
//         <option value="">เลือกความยาว</option>
//         <option value="สั้น">สั้น</option>
//         <option value="ยาว">ยาว</option>
//       </>
//     );
//   } else {
//     return (
//       <>
//         <option value="ไม่ระบุ">ไม่ระบุ</option>
//       </>
//     );
//   }
// };

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPageByCategory, setCurrentPageByCategory] = useState({});
  const itemsPerPage = 6;
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [showBorrow, setShowBorrow] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(null);
  const [qta, setQta] = useState(0);
  const [size, setSize] = useState(null);
  const [price, setPrice] = useState(0);
  const [category_id, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [image, setImage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [formBorrow, setFormBorrow] = useState({
    member_id: "",
    product_id: "",
    quantity: 0,
    request_date: "",
    due_return_date: "",
    note: "",
  });
  const [formMaintenance, setFormMaintenance] = useState({
    member_id: "",
    product_id: "",
    quantity: 0,
    maintenance_date: "",
    description: "",
  });

  const handleChangeBorrow = (e) => {
    if (e.target.name === "quantity") {
      if (e.target.value > selectedProduct.quantity) {
        e.target.value = selectedProduct.quantity;
      }
    }
    if (e.target.name === "request_date") {
      const selectedDate = new Date(e.target.value);
      if (!isNaN(selectedDate)) {
        // เพิ่ม 7 วัน
        const newEndDate = new Date(selectedDate);
        newEndDate.setDate(newEndDate.getDate() + 7);
        setFormBorrow((prev) => ({
          ...prev,
          request_date: e.target.value,
          due_return_date: newEndDate.toISOString().split("T")[0],
        }));
      }
    } else {
      setFormBorrow({ ...formBorrow, [e.target.name]: e.target.value });
    }
  };
  const handleChangeMaintenance = (e) => {
    if (e.target.name === "quantity") {
      if (e.target.value > selectedProduct.quantity) {
        e.target.value = selectedProduct.quantity;
      }
    }
    setFormMaintenance({ ...formMaintenance, [e.target.name]: e.target.value });
  };
  const [productSize, setProductSize] = useState([]);

  // โหลดขนาดจาก API แค่ครั้งเดียว
  useEffect(() => {
    axios
      .get("http://localhost:3001/product_sizes")
      .then((res) => setProductSize(res.data))
      .catch((err) => console.error("โหลดขนาดไม่สำเร็จ", err));
  }, []);

  const renderSizeOptions = (category_id) => {
    if (!category_id) {
      return <option value="">กรุณาเลือกประเภทก่อน</option>;
    }

    if (["1", "2", "3"].includes(category_id)) {
      return (
        <>
          <option value="">เลือกขนาด</option>
          {productSize.map((item) => (
            <option key={item.size_id} value={item.size_label}>
              {item.size_label}
            </option>
          ))}
        </>
      );
    } else if (category_id === "4") {
      return (
        <>
          <option value="">เลือกความยาว</option>
          <option value="สั้น">สั้น</option>
          <option value="ยาว">ยาว</option>
        </>
      );
    } else {
      return (
        <>
          <option value="ไม่ระบุ">ไม่ระบุ</option>
        </>
      );
    }
  };

  const navigate = useNavigate();

  const auth = useContext(AuthContext);

  const { user } = auth;

  const [role, setRole] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    color: "",
    qta: 0,
    size: "",
    price_per_item: 0,
    category_id: "",
    status: "พร้อมใช้งาน",
    image: "",
    imageFile: "",
  });

  const resetNewProduct = () => {
    setNewProduct({
      name: "",
      color: "",
      qta: 0,
      size: "",
      price_per_item: 0,
      category_id: "",
      status: "พร้อมใช้งาน",
      image: "",
      imageFile: "",
    });
    setPreviewImage(null);
  };

  

  const handleAddProduct = () => {
    const { name, color, qta, size, price, category_id, status, image, imageFile } = newProduct;
  
    // ตรวจสอบข้อมูล
    const missing = [];
    if (!name) missing.push("ชื่อ");
    if (!color) missing.push("สี");
    if (!qta) missing.push("จำนวน");
    if (!size) missing.push("ขนาด");
    if (!price) missing.push("ราคาต่อชิ้น");
    if (!category_id) missing.push("ประเภท");
    if (!status) missing.push("สถานะ");
    if (!image && !imageFile) missing.push("รูปภาพ (URL หรือ ไฟล์)");
  
    if (missing.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ!",
        text: `กรุณากรอก: ${missing.join(", ")}`,
        confirmButtonColor: "#2e7d32",
      });
      return;
    }
  
    // ใช้ FormData เพื่อรองรับไฟล์
    const formData = new FormData();
          formData.append("name", name);
          formData.append("color", color);
          formData.append("qta", qta);
          formData.append("size", size);
          formData.append("price_per_item", parseFloat(price));
          formData.append("category_id", category_id);
          formData.append("status", status);
  
    if (imageFile) {
      formData.append("imageFile", imageFile); // ส่งไฟล์
    } else {
      formData.append("image", image); // ส่ง URL
    }
  
    axios
      .post("http://localhost:3001/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        fetchProducts();
        resetNewProduct();
        setShowAdd(false);
  
        Swal.fire({
          icon: "success",
          title: "เพิ่มทรัพย์สินสำเร็จ",
          confirmButtonColor: "#2e7d32",
        });
      })
      .catch((error) => {
        console.error("Error adding product:", error);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถเพิ่มทรัพย์สินได้",
          confirmButtonColor: "#d33",
        });
      });
  };
  
  const handleImageChange = (e) => {
    const value = e.target.value;
    setImage(value);
    setPreviewImage(value);  // ตั้งค่าภาพ preview เมื่อมีการเปลี่ยนแปลง URL
  };

  useEffect(() => {
    try {
      fetchProducts();
      setRole(user.role);
    } catch (error) {
      navigate("/Home");
    }
  }, []);

  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
      fetchBorrow();
      setFormBorrow((prev) => ({ ...prev, member_id: user.id }));
      setFormMaintenance((prev) => ({ ...prev, member_id: user.id }));
    }
  }, [user]);

  const hasNotified = useRef(false);

  const fetchBorrow = () => {
    axios.get("http://localhost:3001/borrow").then((response) => {
      const pendingBorrows = response.data.filter((item) => item.status_name === "รอการอนุมัติ");

      // ดึงค่าจาก sessionStorage
      const lastNotifiedCount = sessionStorage.getItem("notifiedCount");

      if (user.role === 1) {
        if (pendingBorrows.length > 0 && pendingBorrows.length !== Number(lastNotifiedCount)) {
          // อัปเดตค่าใหม่ใน sessionStorage
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
      }
    });
  };

  const fetchProducts = () => {
    axios.get("http://localhost:3001/products").then((response) => {
      setProducts(response.data);
    });
    axios.get("http://localhost:3001/categories").then((response) => {
      setCategories(response.data);
    });
    axios.get("http://localhost:3001/product_sizes").then((response) => {
      setProductSize(response.data);
    });
  };

  const deleteProduct = (id) => {
    axios.delete(`http://localhost:3001/products/${id}`).then(() => {
      fetchProducts();
    });
  };
  // const handleChangeNewProduct = (e) => {
  //   setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  // };
  const handleChangeNewProduct = (e) => {
    const { name, value, files } = e.target;
    // ถ้าเป็นการอัปโหลดไฟล์
    if (e.target.type === "file") {
      const file = files[0];
      if (file) {
        setNewProduct((prev) => ({
          ...prev,
          imageFile: file,
          image: "",
        }));

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      // สำหรับ input อื่น ๆ
      setNewProduct((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
  };
  // const updateProduct = (id) => {
  //   const { name, color, qta, size, price, category_id, status, image, previewImage } = newProduct;

  //   const missing = [];
  //   if (!name) missing.push("ชื่อ");
  //   if (!color) missing.push("สี");
  //   if (!qta) missing.push("จำนวน");
  //   if (!size) missing.push("ขนาด");
  //   if (!price) missing.push("ราคาต่อชิ้น");
  //   if (!category_id) missing.push("ประเภท");
  //   if (!status) missing.push("สถานะ");
  //   if (!image && !imageFile) missing.push("รูปภาพ (URL หรือ ไฟล์)");
  
  //   if (missing.length > 0) {
  //     Swal.fire({
  //       icon: "warning",
  //       title: "ข้อมูลไม่ครบ!",
  //       text: `กรุณากรอก: ${missing.join(", ")}`,
  //       confirmButtonColor: "#2e7d32",
  //     });
  //     return;
  //   }
  //   console.log("📦 ข้อมูลที่กำลังจะส่ง:", name);
  //   console.log("📦 ข้อมูลที่กำลังจะส่ง:", color)
  //   console.log("📦 ข้อมูลที่กำลังจะส่ง:", qta)
  //   console.log("📦 ข้อมูลที่กำลังจะส่ง:", size);
  //   console.log("📦 ข้อมูลที่กำลังจะส่ง:", price);
  //   console.log("📦 ข้อมูลที่กำลังจะส่ง:", category_id);
  //   console.log("📦 ข้อมูลที่กำลังจะส่ง:", status);
  //   console.log("📦 ข้อมูลที่กำลังจะส่ง:", image);
  //   console.log("📦 ข้อมูลที่กำลังจะส่ง:", imageFile);
  //   console.log("📦 ข้อมูลที่กำลังจะส่ง:", formData);
  //   // axios
  //   //   .put(`http://localhost:3001/products/${id}`, formData, {
  //   //     headers: {
  //   //       "Content-Type": "multipart/form-data",
  //   //     },
  //   //   })
  //   //   .then((res) => {
  //   //     Swal.fire("สำเร็จ", res.data.message, "success");
  //   //     fetchProducts();
  //   //     setShow(false);
  //   //   })
  //   //   .catch((err) => {
  //   //     console.error(err);
  //   //     Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตข้อมูลได้", "error");
  //   //   });
  // };
  
  // const updateProduct = (id) => {
  //   const missing = [];
  //   if (!name) missing.push("ชื่อ");
  //   if (!color) missing.push("สี");
  //   if (!qta) missing.push("จำนวน");
  //   if (!size) missing.push("ขนาด");
  //   if (!price) missing.push("ราคาต่อชิ้น");
  //   if (!category_id) missing.push("ประเภท");
  //   if (!status) missing.push("สถานะ");
  //   if (!image && !newProduct.imageFile) missing.push("รูปภาพ");
  
  //   if (missing.length > 0) {
  //     Swal.fire({
  //       icon: "warning",
  //       title: "ข้อมูลไม่ครบ!",
  //       text: `กรุณากรอก: ${missing.join(", ")}`,
  //       confirmButtonColor: "#2e7d32",
  //     });
  //     return;
  //   }
  
  //   const formData = new FormData();
  //   formData.append("name", name);
  //   formData.append("color", color);
  //   formData.append("qta", qta);
  //   formData.append("size", size);
  //   formData.append("price_per_item", parseFloat(price));
  //   formData.append("category_id", category_id);
  //   formData.append("status", status);
  
  //   if (newProduct.imageFile) {
  //     formData.append("imageFile", newProduct.imageFile);
  //   } else {
  //     formData.append("image", newProduct.image);
  //   }
  
  //   axios
  //     .post(`http://localhost:3001/products/update/${id}`, formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     })
  //     .then(() => {
  //       fetchProducts();
  //       setShow(false);
  //       Swal.fire({
  //         icon: "success",
  //         title: "อัปเดตทรัพย์สินสำเร็จ",
  //         confirmButtonColor: "#2e7d32",
  //       });
  //     })
  //     .catch((error) => {
  //       console.error("Error updating product:", error);
  //       Swal.fire({
  //         icon: "error",
  //         title: "เกิดข้อผิดพลาด",
  //         text: "ไม่สามารถอัปเดตทรัพย์สินได้",
  //         confirmButtonColor: "#d33",
  //       });
  //     });
  
  //   // if(!name || !color || !qta || !size || !price || !category_id || !status || !image || !previewImage) {
  //   //   axios
  //   //   .put(`http://localhost:3001/products/${id}`, {
  //   //     name,
  //   //     color,
  //   //     qta,
  //   //     size,
  //   //     price,
  //   //     category_id,
  //   //     status,
  //   //     image,
  //   //   })
  //   //   .then(() => {
  //   //     fetchProducts();
  //   //     setShow(false);
  //   //   });
  //   // }
  // };

  const updateProduct = (id) => {
    const {imageFile } = newProduct;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("color", color);
    formData.append("qta", qta);
    formData.append("size", size);
    formData.append("price_per_item", parseFloat(price)); // ต้องเป็นค่าตัวเลข
    formData.append("category_id", category_id);
    formData.append("status", status);
    formData.append("image", image);
    formData.append("imageFile", imageFile);

  
    axios
      .put(`http://localhost:3001/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        fetchProducts(); // อัปเดตรายการสินค้าทั้งหมด
        setShow(false);
        resetNewProduct();
        Swal.fire({
          icon: "success",
          title: "อัปเดตทรัพย์สินสำเร็จ",
          confirmButtonColor: "#2e7d32",
        });
      })
      .catch((error) => {
        console.error("Error updating product:", error);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถอัปเดตทรัพย์สินได้",
          confirmButtonColor: "#d33",
        });
      });
  };
  
  const borrowProduct = () => {
    const { quantity, request_date, due_return_date, note } = formBorrow;

    if (!quantity || !request_date || !due_return_date || !note.trim()) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกข้อมูลให้ครบทุกช่องก่อนส่งคำร้อง",
        confirmButtonColor: "#2e7d32",
      });
      return;
    }

    axios
      .post("http://localhost:3001/borrow", formBorrow)
      .then(() => {
        setShowBorrow(false); // ปิด Modal
        Swal.fire({
          icon: "success",
          title: "ส่งคำร้องสำเร็จ",
          confirmButtonColor: "#2e7d32",
        });
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถส่งคำร้องได้",
          confirmButtonColor: "#d33",
        });
      });
  };

  const MaintenanceProduct = () => {
    const { quantity, maintenance_date, description } = formMaintenance;

    if (!quantity || !maintenance_date || !description) {
      Swal.fire({
        icon: "error",
        title: "ข้อมูลไม่ครบ!",
        text: "กรุณากรอกข้อมูลแจ้งซ่อมให้ครบถ้วน",
        confirmButtonColor: "#2e7d32",
      });
      return;
    }

    axios.post(`http://localhost:3001/maintenance`, formMaintenance).then(() => {
      setShowMaintenance(false);
      Swal.fire({
        icon: "success",
        title: "แจ้งซ่อมสำเร็จ",
        text: "ระบบได้รับการแจ้งซ่อมแล้ว",
        confirmButtonColor: "#2e7d32",
      });
    });
  };

  const handleClose = () => setShow(false);
  const handleShow = (product) => {
    setSelectedProduct(product); // ← ต้องใส่กลับมา!
    setName(product.name || "");
    setColor(product.color || "");
    setQta(product.quantity || 0);
    setSize(product.size || "");
    setPrice(product.price_per_item || 0);
    setCategoryId(product.category_id || "");
    setStatus(product.status || "พร้อมใช้งาน");
    setImage(product.image || "");
    setPreviewImage(product.imageFile || "");
    setShow(true);
  };

  const handleCloseBorrow = () => {
    setShowBorrow(false);
    setFormBorrow({
      member_id: user.id,
      product_id: "",
      quantity: 0,
      request_date: "",
      due_return_date: "",
      note: "",
    });
  };

  const handleShowBorrow = (product) => {
    setSelectedProduct(product);

    // เคลียร์ค่าทุกช่องก่อนเปิด Modal
    setFormBorrow({
      member_id: user.id, // หรือใช้ user?.id ก็ได้
      product_id: product.product_id,
      quantity: 0,
      request_date: "",
      due_return_date: "",
      note: "",
    });

    setShowBorrow(true);
  };

  const handleCloseMaintenance = () => setShowMaintenance(false);
  const handleShowMaintenance = (product) => {
    // setSelectedProduct(product);
    setFormMaintenance({ ...formMaintenance, product_id: product.product_id });
    setShowMaintenance(true);
  };

  const filteredProducts = products.filter((product) => {
    const name = product.name?.toLowerCase() || "";
    const color = product.color?.toLowerCase() || "";

    return name.includes(search.toLowerCase()) || color.includes(search.toLowerCase());
  });

  const today = new Date().toISOString().split("T")[0];

  const displayName = user?.full_name && user.full_name.trim() !== "" ? user.full_name : user?.email || "";
  const displayRole = user?.role === 1 ? "ผู้ดูแลระบบ" : "ผู้ใช้งานทั่วไป";

  return (
    <>
      <Navbar />
      <div className="d-flex flex-column flex-lg-row">
        <Container className="py-4" style={{ backgroundColor: "#F5F5F5", minHeight: "100vh", marginTop: "80px" }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 mx-4">
            <div className="d-flex align-items-center flex-wrap gap-3">
              <Form.Group controlId="search" style={{ maxWidth: "400px" }}>
                <Form.Control
                  type="text"
                  placeholder="🔍 ค้นหาทรัพย์สิน..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    borderRadius: "8px",
                    padding: "10px 16px",
                    border: "1px solid #ced4da",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                    fontSize: "16px",
                  }}
                />
              </Form.Group>

              {role === 1 && (
                <Button
                  className="d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: "#2e7d32",
                    border: "none",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontWeight: "500",
                    fontSize: "16px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    transition: "0.3s",
                  }}
                  onClick={() => {
                    resetNewProduct();
                    setShowAdd(true);
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#27682a")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2e7d32")}
                >
                  <i className="bi bi-plus-circle" style={{ fontSize: "20px" }}></i>
                  เพิ่มทรัพย์สิน
                </Button>
              )}
            </div>

            {/* คอลัมน์ขวา: ข้อมูลบัญชีผู้ใช้ */}
            <div className="d-flex align-items-center gap-2 user-info-box">
              <i className="bi bi-person-circle" style={{ fontSize: "24px", color: "#2e7d32" }}></i>
              <div>
                <strong style={{ fontSize: "16px" }}>{displayName}</strong>
                <div style={{ fontSize: "14px", color: "#666" }}>{displayRole}</div>
              </div>
            </div>
          </div>

          {categories.map((category) => {
            const filteredByCategory = filteredProducts.filter((product) => product.category_id === category.category_id);

            const totalPages = Math.ceil(filteredByCategory.length / itemsPerPage);
            const currentPage = currentPageByCategory[category.category_id] || 1;
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedProducts = filteredByCategory.slice(startIndex, startIndex + itemsPerPage);
            console.log("paginatedProducts:", paginatedProducts);
            return (
              <div key={category.category_id} className="mt-4 mx-4">
                <div className="category-header">
                  <div className="category-label-bar" />
                  <div className="category-label-text">
                    <h4>{category.name}</h4>
                    <span>({filteredProducts.filter((p) => p.category_id === category.category_id).length} รายการ)</span>
                  </div>
                </div>

                <Row>
                  {paginatedProducts.map((product) => (
                    <Col key={product.product_id} md={4} className="mb-3">
                      <Card
                        className="text-center"
                        style={{
                          borderRadius: "10px",
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <Card.Img
                          variant="top"
                          src={product.image || "https://placehold.co/300x280?text=No+Image"}
                          style={{ height: "280px" }}
                          onError={(e) => {
                            if (e.target.src !== "https://placehold.co/300x280?text=No+Image") {
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/300x280?text=No+Image";
                            }
                          }}
                        />

                        <Card.Body>
                          <Card.Title>{product.name}</Card.Title>
                          <Card.Text>
                            มูลค่า/ชิ้น: {product.price_per_item} บาท, จำนวน: {product.quantity}
                            <br />
                            สี: {product.color || "-"}, ขนาด: {product.size || "-"}
                          </Card.Text>

                          <Card.Text className={product.status === "พร้อมใช้งาน" ? "text-success" : product.status === "รอซัก" ? "text-warning" : "text-danger"}>{product.status}</Card.Text>

                          {role === 2 ? (
                            <Col className="d-flex justify-content-center">
                              <Button className="mx-1" variant={product.status === "พร้อมใช้งาน" ? "success" : "secondary"} disabled={product.status !== "พร้อมใช้งาน"} onClick={() => handleShowBorrow(product)}>
                                ยืมทรัพย์สิน
                              </Button>
                            </Col>
                          ) : role === 1 ? (
                            <Col className="d-flex justify-content-center">
                              <Button className="mx-1" variant="info" onClick={() => handleShow(product)}>
                                แก้ไข
                              </Button>
                              <Button
                                className="mx-1"
                                variant="danger"
                                onClick={() =>
                                  Swal.fire({
                                    title: "คุณแน่ใจหรือไม่?",
                                    text: "หากลบแล้วจะไม่สามารถกู้คืนได้",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#d33",
                                    cancelButtonColor: "#3085d6",
                                    confirmButtonText: "ลบ",
                                    cancelButtonText: "ยกเลิก",
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      deleteProduct(product.product_id);
                                      Swal.fire({
                                        icon: "success",
                                        title: "ลบสำเร็จ",
                                        text: "ทรัพย์สินถูกลบแล้ว",
                                        confirmButtonColor: "#2e7d32",
                                      });
                                    }
                                  })
                                }
                              >
                                ลบ
                              </Button>
                            </Col>
                          ) : (
                            <p>Loading...</p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Pagination แบบตัวเลข */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center align-items-center mt-3">
                    {/* Previous */}
                    <Button
                      variant="outline-secondary"
                      className="mx-1"
                      onClick={() =>
                        setCurrentPageByCategory((prev) => ({
                          ...prev,
                          [category.category_id]: Math.max(currentPage - 1, 1),
                        }))
                      }
                      disabled={currentPage === 1}
                    >
                      &laquo;
                    </Button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                      })
                      .reduce((acc, page, idx, arr) => {
                        if (idx > 0 && page - arr[idx - 1] > 1) {
                          acc.push("ellipsis");
                        }
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item, index) =>
                        item === "ellipsis" ? (
                          <span key={`ellipsis-${index}`} className="mx-1">
                            ...
                          </span>
                        ) : (
                          <Button
                            key={item}
                            variant={currentPage === item ? "primary" : "outline-secondary"}
                            className="mx-1"
                            onClick={() =>
                              setCurrentPageByCategory((prev) => ({
                                ...prev,
                                [category.category_id]: item,
                              }))
                            }
                          >
                            {item}
                          </Button>
                        )
                      )}

                    {/* Next */}
                    <Button
                      variant="outline-secondary"
                      className="mx-1"
                      onClick={() =>
                        setCurrentPageByCategory((prev) => ({
                          ...prev,
                          [category.category_id]: Math.min(currentPage + 1, totalPages),
                        }))
                      }
                      disabled={currentPage === totalPages}
                    >
                      &raquo;
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          {selectedProduct && (
            <Modal show={show} onHide={handleClose} centered size="lg">
              <Modal.Header closeButton>
                <Modal.Title>แก้ไขทรัพย์สิน</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <div className="row">
                    <Form.Group className="col-12 col-lg-6 mb-3">
                      <Form.Label>ชื่อ</Form.Label>
                      <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="col-12 col-lg-6 mb-3">
                      <Form.Label>ประเภท</Form.Label>
                      <Form.Select
                        value={category_id}
                        onChange={(e) => setCategoryId(e.target.value)}
                      >
                        <option value="">เลือกประเภท</option>
                        <option value="1">ชุดเดรสหรือชุด</option>
                        <option value="2">เสื้อ</option>
                        <option value="3">กระโปรง</option>
                        <option value="4">ชุดคลุม / ผ้าคลุม และ เสื้อคลุม</option>
                        <option value="5">อุปกรณ์ตกแต่งเสริม (นักร้อง)</option>
                        <option value="6">อุปกรณ์ตกแต่งเสริม (ร่ายรำ)</option>
                        <option value="7">ครุภัณฑ์</option>
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="row">
                    <Form.Group className="col-12 col-lg-6 mb-3">
                      <Form.Label>ขนาด</Form.Label>
                      <Form.Select value={size} onChange={(e) => setSize(e.target.value)}>
                        {renderSizeOptions(category_id)}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="col-12 col-lg-6 mb-3">
                      <Form.Label>สี</Form.Label>
                      <Form.Control
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                      />
                    </Form.Group>
                  </div>

                  <div className="row">
                    <Form.Group className="col-12 col-lg-6 mb-3">
                      <Form.Label>ราคาต่อชิ้น</Form.Label>
                      <Form.Control
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="col-12 col-lg-6 mb-3">
                      <Form.Label>จำนวน</Form.Label>
                      <Form.Control
                        type="number"
                        value={qta}
                        onChange={(e) => setQta(e.target.value)}
                      />
                    </Form.Group>
                  </div>

                  <div className="row">
                    <Form.Group className="col-12 col-lg-6 mb-3">
                      <Form.Label>สถานะ</Form.Label>
                      <Form.Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="พร้อมใช้งาน">พร้อมใช้งาน</option>
                        <option value="ไม่พร้อมใช้งาน">ไม่พร้อมใช้งาน</option>
                        <option value="รอซ่อมเเซม">รอซ่อมเเซม</option>
                        <option value="รอซัก">รอซัก</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="col-12 col-lg-6 mb-3">
                      <Form.Label>รูป (url)</Form.Label>
                      <Form.Control
                        type="text"
                        value={image}
                        onChange={handleImageChange}
                      />
                    </Form.Group>
                  </div>
                  <Form.Group className="col-12 col-lg-12 mb-3">
                  <Form.Label>แนบรูปภาพ (ถ้ามี)</Form.Label>
                  <Form.Control type="file" name="imageFile" accept="image/*" onChange={handleChangeNewProduct} />
                  {(previewImage || image) && (
                    <div className="mt-4 d-flex justify-content-center">
                      <img
                        src={previewImage ? previewImage : image}
                        alt="Preview"
                        name="preview"
                        className="img-fluid rounded"
                        style={{ maxHeight: "150px" }}
                      />
                    </div>
                  )}

                  </Form.Group>
                  
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="success"
                  onClick={() => {
                    Swal.fire({
                      title: "คุณแน่ใจหรือไม่?",
                      text: "คุณต้องการบันทึกการเปลี่ยนแปลงใช่หรือไม่",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#2e7d32",
                      cancelButtonColor: "#d33",
                      confirmButtonText: "บันทึก",
                      cancelButtonText: "ยกเลิก",
                    }).then((result) => {
                      if (result.isConfirmed) {
                        updateProduct(selectedProduct.product_id); // เรียกฟังก์ชันที่คุณเขียนไว้แล้ว
                      }
                    });
                  }}
                >
                  บันทึกการเปลี่ยนแปลง
                </Button>
              </Modal.Footer>
            </Modal>
          )}

          <Modal show={showBorrow} onHide={handleCloseBorrow}  centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title>ส่งคำร้องขอยืมทรัพย์สิน</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                {/* ชื่อทรัพย์สิน (แสดงอย่างเดียว) */}
                <Form.Group className="mb-3">
                  <Form.Label>ชื่อทรัพย์สิน</Form.Label>
                  <Form.Control type="text" value={selectedProduct?.name || "-"} readOnly />
                </Form.Group>

                {/* จำนวนที่ต้องการยืม */}
                <Form.Group className="mb-3">
                  <Form.Label>จำนวนที่ต้องการยืม</Form.Label>
                  <Form.Control type="number" name="quantity" min="1" max={selectedProduct?.quantity || 1} value={formBorrow.quantity} onChange={handleChangeBorrow} />
                  <Form.Text muted>มีทั้งหมด {selectedProduct?.quantity || 0} รายการ</Form.Text>
                </Form.Group>

                {/* วันที่ยืม */}
                <Form.Group className="mb-3">
                  <Form.Label>วันที่ยืม</Form.Label>
                  <Form.Control type="date" name="request_date" min={new Date().toISOString().split("T")[0]} value={formBorrow.request_date} onChange={handleChangeBorrow} />
                </Form.Group>

                {/* กำหนดคืน (คำนวณอัตโนมัติจาก request_date + 7 วัน) */}
                <Form.Group className="mb-3">
                  <Form.Label>กำหนดคืน</Form.Label>
                  <Form.Control type="date" name="due_return_date" value={formBorrow.due_return_date} readOnly />
                  <Form.Text muted>ระบบจะคำนวณกำหนดคืนให้อัตโนมัติ (7 วันหลังยืม)</Form.Text>
                </Form.Group>

                {/* วัตถุประสงค์ในการยืม */}
                <Form.Group className="mb-3">
                  <Form.Label>วัตถุประสงค์การยืม</Form.Label>
                  <Form.Control as="textarea" rows={2} name="note" placeholder="ระบุวัตถุประสงค์ เช่น ใช้ในกิจกรรม A, ซ้อมการแสดง ฯลฯ" value={formBorrow.note} onChange={handleChangeBorrow} />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseBorrow}>
                ยกเลิก
              </Button>
              <Button variant="success" onClick={borrowProduct}>
                ส่งคำร้อง
              </Button>
            </Modal.Footer>
          </Modal>

          {selectedProduct && (
            <Modal show={showMaintenance} onHide={handleCloseMaintenance}>
              <Modal.Header closeButton>
                <Modal.Title>แจ้งซ่อม</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>จำนวน</Form.Label>
                    <Form.Control type="number" name="quantity" min="1" max={selectedProduct.quantity} onChange={handleChangeMaintenance} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>วันที่แจ้ง</Form.Label>
                    <Form.Control type="date" name="maintenance_date" min={today} onChange={handleChangeMaintenance} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>รายละเอียด</Form.Label>
                    <Form.Control type="text" name="description" onChange={handleChangeMaintenance} />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseMaintenance}>
                  ปิด
                </Button>
                <Button variant="success" onClick={() => MaintenanceProduct()}>
                  แจ้ง
                </Button>
              </Modal.Footer>
            </Modal>
          )}

          <Modal show={showAdd} onHide={() => setShowAdd(false)} centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title>เพิ่มทรัพย์สิน</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <div className="row">
                  <Form.Group className="col-12 col-lg-6 mb-3">
                    <Form.Label>ชื่อทรัพย์สิน</Form.Label>
                    <Form.Control type="text" name="name" value={newProduct.name} onChange={handleChangeNewProduct} />
                  </Form.Group>

                  <Form.Group className="col-12 col-lg-6 mb-3">
                    <Form.Label>ประเภท</Form.Label>
                    <Form.Select name="category_id" value={newProduct.category_id} onChange={handleChangeNewProduct}>
                      <option value="">เลือกประเภท</option>
                      {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="row">
                  <Form.Group className="col-12 col-lg-6 mb-3">
                    <Form.Label>ขนาด</Form.Label>
                    <Form.Select name="size" value={newProduct.size} onChange={handleChangeNewProduct}>
                      {renderSizeOptions(newProduct.category_id)}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="col-12 col-lg-6 mb-3">
                    <Form.Label>สี</Form.Label>
                    <Form.Control type="text" name="color" value={newProduct.color} onChange={handleChangeNewProduct} />
                  </Form.Group>
                </div>

                <div className="row">
                  <Form.Group className="col-12 col-lg-6 mb-3">
                    <Form.Label>จำนวน</Form.Label>
                    <Form.Control
                      type="number"
                      name="qta"
                      min="0"
                      inputMode="numeric"
                      value={newProduct.qta}
                      onKeyDown={(e) => {
                        const allowedKeys = ["ArrowUp", "ArrowDown", "Tab"];
                        if (!allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        setNewProduct((prev) => ({
                          ...prev,
                          qta: isNaN(value) ? 0 : value,
                        }));
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="col-12 col-lg-6 mb-3">
                    <Form.Label>ราคาต่อชิ้น</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      inputMode="numeric"
                      value={newProduct.price}
                      onChange={(e) => {
                        const raw = e.target.value;

                        if (/^[1-9]\d*$/.test(raw)) {
                          setNewProduct((prev) => ({
                            ...prev,
                            price: raw,
                          }));
                        } else if (raw === "") {
                          setNewProduct((prev) => ({
                            ...prev,
                            price: "",
                          }));
                        }
                      }}
                    />
                  </Form.Group>
                </div>

                <div className="row">
                  <Form.Group className="col-12 col-lg-6 mb-3">
                    <Form.Label>สถานะ</Form.Label>
                    <Form.Select name="status" value={newProduct.status} onChange={handleChangeNewProduct}>
                      <option value="พร้อมใช้งาน">พร้อมใช้งาน</option>
                      <option value="ไม่พร้อมใช้งาน">ไม่พร้อมใช้งาน</option>
                      <option value="รอซ่อมเเซม">รอซ่อมเเซม</option>
                      <option value="รอซัก">รอซัก</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="col-12 col-lg-6 mb-3">
                    <Form.Label>URL รูปภาพ</Form.Label>
                    <Form.Control type="text" name="image" value={newProduct.image} onChange={handleChangeNewProduct} />
                  </Form.Group>
                </div>
                <Form.Group className="col-12 col-lg-12 mb-3">
                  <Form.Label>แนบรูปภาพ (ถ้ามี)</Form.Label>
                  <Form.Control type="file" name="imageFile" accept="image/*" onChange={handleChangeNewProduct} />
                  {previewImage && (
                    <div className="mt-4 d-flex justify-content-center">
                      <img src={previewImage} alt="Preview" name="preview" className="img-fluid rounded" style={{ maxHeight: "150px" }} />
                    </div>
                  )}
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAdd(false)}>
                ปิด
              </Button>
              <Button variant="success" onClick={handleAddProduct}>
                บันทึก
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </>
  );
}

export default Home;
