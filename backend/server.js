const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "church_property_db",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL Database");
});

// ดึงข้อมูล product
app.get("/products", (req, res) => {
  db.query("SELECT * FROM product", (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// ดึงข้อมูล category
app.get("/categories", (req, res) => {
  db.query("SELECT * FROM categories WHERE status = 1", (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

app.post("/categories", (req, res) => {
  const { name } = req.body;
  db.query("INSERT INTO categories (name) VALUES (?)", [name], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ message: "Category added", id: result.insertId });
  });
});

app.put("/delete-categories/:id", (req, res) => {
  const { id } = req.params;
  db.query("UPDATE categories SET status = 0 WHERE category_id = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Category deleted" });
  });
});
// app.delete("/categories/:id", (req, res) => {
//   const { id } = req.params;
//   db.query("DELETE FROM categories WHERE category_id = ?", [id], (err, result) => {
//     if (err) return res.status(500).send(err);
//     res.json({ message: "Category deleted" });
//   });
// });

app.put("/categories/:id", (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  db.query("UPDATE categories SET name = ? WHERE category_id = ?", [name, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send("Updated successfully");
  });
});
app.get("/reasons", (req, res) => {
  db.query("SELECT * FROM `reasons`", (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// อัพโหลดไฟล์ภาพ
// path ที่ชี้ไปยัง public/uploads ของ React
const uploadPath = path.join(__dirname, "../frontend/src/assets/uploads");

// ถ้ายังไม่มีโฟลเดอร์ uploads ให้สร้าง
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// อัพโหลดไฟล์ภาพ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // ✅ เปลี่ยน path
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../frontend/src/assets/uploads"))
); // ✅ ให้ Express เสิร์ฟรูป
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// เพิ่มข้อมูล product
app.post("/products", upload.single("imageFile"), (req, res) => {
  const { name, color, qta, size, price_per_item, category_id, status, image } =
    req.body;

  // ถ้าอัพโหลดไฟล์ → ใช้ path ของไฟล์ที่อัพโหลด
  const imagePath = req.file
    ? `src/assets/uploads/${req.file.filename}`
    : image;

  db.query(
    "INSERT INTO product (name, color, quantity, size, price_per_item, category_id, status, image) VALUES (?,?,?,?,?,?,?,?)",
    [name, color, qta, size, price_per_item, category_id, status, imagePath],
    (err, results) => {
      if (err) {
        console.error("DB Insert Error:", err);
        res.status(500).send(err);
      } else {
        res.json({ message: "เพิ่มทรัพย์สินสำเร็จ!!!", id: results.insertId });
      }
    }
  );
});

// อัปเดตข้อมูล product

app.put("/products/:id", upload.single("imageFile"), (req, res) => {
  const { id } = req.params;
  const {
    name,
    color,
    qta,
    size,
    price_per_item,
    category_id,
    status,
    image, // รูปเดิม
  } = req.body;

  // ถ้าอัปโหลดไฟล์ใหม่ → ใช้ path ใหม่
  // ถ้าไม่ → ใช้ image เดิม (ที่เป็น URL)
  let imagePath = image;

  if (req.file) {
    imagePath = `src/assets/uploads/${req.file.filename}`;
  }

  // ถ้าไม่มีทั้ง imageFile และ image เดิม
  if (!req.file && (!image || image.trim() === "")) {
    return res
      .status(400)
      .json({ message: "กรุณาแนบรูปภาพหรือใส่ URL รูปเดิม" });
  }

  db.query(
    "UPDATE product SET name = ?, color = ?, quantity = ?, size = ?, price_per_item = ?, category_id = ?, status = ?, image = ? WHERE product_id = ?",
    [
      name,
      color,
      qta,
      size,
      price_per_item,
      category_id,
      status,
      imagePath,
      id,
    ],
    (err, results) => {
      if (err) {
        console.error("DB Update Error:", err);
        return res.status(500).send(err);
      }
      res.json({ message: "อัปเดตทรัพย์สินสำเร็จ!!!" });
    }
  );
});

// app.put("/products/:id", upload.single("imageFile"), (req, res) => {
//   const { id } = req.params;
//   const {
//     name,
//     color,
//     qta,
//     size,
//     price,
//     category_id,
//     status,
//     image // อันนี้ไว้กรณีไม่ได้แนบไฟล์
//   } = req.body;

//   // ถ้ามีไฟล์ใหม่ ให้ใช้ path ใหม่ ไม่งั้นใช้ path เดิม
//   const imagePath = req.file ? `src/assets/uploads/${req.file.filename}` : image;

//   db.query(
//     "UPDATE product SET name = ?, color = ?, quantity = ?, size = ?, price_per_item = ?, category_id = ?, status = ?, image = ? WHERE product_id = ?",
//     [name, color, qta, size, price, category_id, status, imagePath, id],
//     (err, results) => {
//       if (err) {
//         res.status(500).send(err);
//       } else {
//         res.json({ message: "อัปเดตทรัพย์สินสำเร็จ!!!" });
//       }
//     }
//   );
// });

// ลบข้อมูล product
app.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE product SET status = 'รายการนี้ถูกลบแล้ว' WHERE product_id = ?",
    [id],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({ message: "ลบทรัพย์สินสำเร็จ!!!", id: results.insertId });
      }
    }
  );
});

app.get("/product_sizes", (req, res) => {
  db.query("SELECT * FROM sizes", (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});
// ฟังก์ชันสร้าง ID ใหม่
const generateNewId = (team, callback) => {
  db.query(
    "SELECT CAST(REGEXP_REPLACE(member_id, '[^0-9]', '') AS UNSIGNED) AS numeric_part FROM members WHERE member_id LIKE ?  ORDER BY numeric_part DESC LIMIT 1",
    [`${team}%`],
    (err, results) => {
      if (err) {
        callback(err, null);
        return;
      }

      if (!results || results.length === 0 || !results[0].numeric_part) {
        // ถ้ายังไม่มี id ของทีมนี้ ให้เริ่มจาก 1
        callback(null, `${team}1`);
      } else {
        // ดึงเลขท้ายสุดมา +1
        const lastId = results[0].numeric_part;
        const lastNumber = parseInt(lastId) + 1;
        const newId = `${team}${String(lastNumber)}`;
        callback(null, newId);
      }
    }
  );
};

// เพิ่มข้อมูล user
app.post("/users", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      prefix_name,
      email,
      phone,
      team,
      birthDate,
      username,
      password,
      role_id,
    } = req.body;
    const fullName = `${first_name} ${last_name}`;
    db.query(
      "SELECT * FROM members WHERE email = ? OR username = ?",
      [email, username],
      (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0)
          return res
            .status(400)
            .json({ message: "อีเมลหรือชื่อผู้ใช้งานนี้ถูกใช้แล้ว" });
      }
    );

    generateNewId("M00", (err, newId) => {
      if (err) {
        return res.status(500).send(err);
      }

      db.query(
        "INSERT INTO members (member_id, first_name, last_name, full_name , prefix, email ,team , phone_number, birthday, username, password, role_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          newId,
          first_name,
          last_name,
          fullName,
          prefix_name,
          email,
          team,
          phone,
          birthDate,
          username,
          password,
          role_id,
        ],
        (err, results) => {
          if (err) {
            return res.status(500).send(err);
          }
          res.json({ message: "เพิ่มสมาชิกสำเร็จ!!!", id: newId });
        }
      );
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

// เข้าสู่ระบบ (Login)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM members WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).send(err);
    if (!results || results.length === 0)
      return res.status(401).json({ message: "Invalid email or password" });

    const user = results[0];

    // ตรวจสอบรหัสผ่าน
    if (password === user.password) {
      const token = jwt.sign(
        {
          id: user.member_id,
          email: user.email,
          team: user.team,
          role: user.role_id,
          username: user.full_name,
        },
        "mysecretkey123",
        { expiresIn: "1h" }
      );
      res.json({ message: "Login successful", token, user });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  });
});

app.post("/forgot-password", (req, res) => {
  const { email, password, Cpassword } = req.body;
  if (!email || !password || !Cpassword) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
  }

  // ตรวจสอบว่าอีเมลมีอยู่ในระบบหรือไม่
  const query = "SELECT * FROM members WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "อีเมลไม่ถูกต้อง หรือไม่มีในระบบ" });
    }

    // อัปเดตรหัสผ่านใหม่
    const updateQuery = "UPDATE members SET password = ? WHERE email = ?";
    db.query(updateQuery, [Cpassword, email], (err, updateResult) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Password update failed", error: err });

      return res
        .status(200)
        .json({ message: "Password has been updated successfully" });
    });
  });
});

app.get("/users-list", (req, res) => {
  db.query(
    "SELECT mb.*,roles.role_name FROM members mb LEFT JOIN roles ON mb.role_id = roles.role_id",
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

// ✅ ฟังก์ชัน verifyToken (มีอันเดียวพอ)
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, "mysecretkey123", (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.user = decoded;
    next();
  });
};

// ดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่
app.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// เพิ่มข้อมูล borrow
app.get("/cancel-history", verifyToken, (req, res) => {
  const userRole = req.user.role;
  const userId = req.user.id;

  let sql = `
    SELECT 
      br.request_id,
      m.full_name,
      m.first_name, 
      m.last_name,
      m.team,
      p.name,
      br.quantity,
      br.request_date,
      br.note AS purpose,
      bs.cancel_reason,
      bs.canceled_by,
      bs.updated_date AS cancel_timestamp
    FROM borrow_request br
    JOIN borrow_request_status bs ON br.request_id = bs.request_id
    JOIN members m ON br.member_id = m.member_id
    JOIN product p ON br.product_id = p.product_id
    WHERE bs.status_name = 'ถูกยกเลิก'
  `;

  const params = [];

  if (userRole === 2) {
    // ✅ ผู้ใช้งานทั่วไป
    sql += ` AND br.member_id = ?`;
    params.push(userId);
  }

  sql += ` ORDER BY bs.updated_date DESC`;

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาด:", err);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
    res.json(result);
  });
});

// ดึงข้อมูล borrow
app.get("/borrow", verifyToken, (req, res) => {
  const sql = `
    SELECT
        b.request_id,
        b.member_id,
        m.full_name,
        m.first_name,
        m.last_name,
        m.team,
        p.product_id,
        p.name AS product_name,
        b.quantity,
        b.request_date,
        b.due_return_date,
        b.return_date,
        b.receive_date,
        b.note,
        p.price_per_item,
        IFNULL(s.status_name, 'รอการอนุมัติ') AS status_name,
        rd.latest_return_date,
        rd.returned_good,
        rd.returned_damaged,
        rd.returned_lost,
        rd.return_note,
        (
          b.quantity - (
            IFNULL(rd.returned_good, 0) + IFNULL(rd.returned_damaged, 0) + IFNULL(rd.returned_lost, 0)
          )
        ) AS total,
        (
          IFNULL(rd.returned_good, 0) + IFNULL(rd.returned_damaged, 0) + IFNULL(rd.returned_lost, 0)
        ) AS total_return
      FROM
        borrow_request b
        LEFT JOIN members m ON b.member_id = m.member_id
        LEFT JOIN product p ON b.product_id = p.product_id
        LEFT JOIN borrow_request_status s ON b.request_id = s.request_id
        LEFT JOIN (
          SELECT 
            request_id,
            MAX(return_date) AS latest_return_date,
            SUM(IFNULL(returned_good, 0)) AS returned_good,
            SUM(IFNULL(returned_damaged, 0)) AS returned_damaged,
            SUM(IFNULL(returned_lost, 0)) AS returned_lost,
            GROUP_CONCAT(note SEPARATOR ', ') AS return_note
          FROM return_detail
          GROUP BY request_id
        ) rd ON b.request_id = rd.request_id;
  `;

  db.query(sql, (err, results) => {
    // console.log("Raw results:", results);

    if (err) {
      console.error("Error fetching borrow requests:", err);
      return res.status(500).json({ error: "Server error" });
    }

    function getDateOnlyUTC(date) {
      const d = new Date(date);
      return new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
      );
    }

    const localDate = getDateOnlyUTC(new Date());
    // console.log("📆 Current date (UTC-only):", localDate.toISOString());

    const notReturnedRequests = results.filter((r) => {
      const dueDate = getDateOnlyUTC(r.due_return_date);
      return (
        dueDate < localDate &&
        (r.return_id === null || (r.total_return || 0) === 0)
      );
    });

    const partiallyReturnedOverdueRequests = results.filter((r) => {
      const dueDate = getDateOnlyUTC(r.due_return_date);
      return (
        dueDate < localDate &&
        (r.total_return || 0) > 0 &&
        (r.total_return || 0) < r.quantity
      );
    });

    const overReturnedRequests = results.filter((r) => {
      const dueDate = getDateOnlyUTC(r.due_return_date);
      return dueDate < localDate && (r.total_return || 0) === r.quantity;
    });

    // console.log("notReturnedRequests:", notReturnedRequests);
    // console.log(
    //   "partiallyReturnedOverdueRequests:",
    //   partiallyReturnedOverdueRequests
    // );
    // console.log("overReturnedRequests:", overReturnedRequests);
    // return res.json(results);
    if (notReturnedRequests.length > 0) {
      // อัปเดตสถานะเป็น 'เกินกำหนด' สำหรับรายการที่เกินกำหนด
      const overdueDateQuery = `UPDATE borrow_request_status SET status_name = 'เลยกำหนดคืน' WHERE request_id IN (${notReturnedRequests
        .map((r) => r.request_id)
        .join(",")})`;
      db.query(overdueDateQuery, (err) => {
        if (err) {
          console.error("Error updating overdue status:", err);
          return res.status(500).json({ error: "Server error" });
        }

        // ถ้ามีการอัปเดตให้แสดงผลข้อมูลทั้งหมดที่เกี่ยวข้อง
        const sql = `
          SELECT
        b.request_id,
        b.member_id,
        m.full_name,
        m.first_name,
        m.last_name,
        m.team,
        p.product_id,
        p.name AS product_name,
        b.quantity,
        b.request_date,
        b.due_return_date,
        b.return_date,
        b.receive_date,
        b.note,
        p.price_per_item,
        IFNULL(s.status_name, 'รอการอนุมัติ') AS status_name,
        rd.latest_return_date,
        rd.returned_good,
        rd.returned_damaged,
        rd.returned_lost,
        rd.return_note,
        (
          b.quantity - (
            IFNULL(rd.returned_good, 0) + IFNULL(rd.returned_damaged, 0) + IFNULL(rd.returned_lost, 0)
          )
        ) AS total,
        (
          IFNULL(rd.returned_good, 0) + IFNULL(rd.returned_damaged, 0) + IFNULL(rd.returned_lost, 0)
        ) AS total_return
      FROM
        borrow_request b
        LEFT JOIN members m ON b.member_id = m.member_id
        LEFT JOIN product p ON b.product_id = p.product_id
        LEFT JOIN borrow_request_status s ON b.request_id = s.request_id
        LEFT JOIN (
          SELECT 
            request_id,
            MAX(return_date) AS latest_return_date,
            SUM(IFNULL(returned_good, 0)) AS returned_good,
            SUM(IFNULL(returned_damaged, 0)) AS returned_damaged,
            SUM(IFNULL(returned_lost, 0)) AS returned_lost,
            GROUP_CONCAT(note SEPARATOR ', ') AS return_note
          FROM return_detail
          GROUP BY request_id
        ) rd ON b.request_id = rd.request_id;
        `;

        // ดำเนินการ select ข้อมูล
        db.query(sql, (err, data) => {
          if (err) {
            console.error("Error fetching updated borrow request data:", err);
            return res.status(500).json({ error: "Server error" });
          }

          // ส่งข้อมูลกลับไปใน response
          return res.json(data);
        });
      });
    } else if (partiallyReturnedOverdueRequests.length > 0) {
      // อัปเดตสถานะเป็น 'เกินกำหนด' สำหรับรายการที่เกินกำหนด
      const overdueDateQuery = `UPDATE borrow_request_status SET status_name = 'คืนไม่ครบและเลยกำหนด' WHERE request_id IN (${partiallyReturnedOverdueRequests
        .map((r) => r.request_id)
        .join(",")})`;
      db.query(overdueDateQuery, (err) => {
        if (err) {
          console.error("Error updating overdue status:", err);
          return res.status(500).json({ error: "Server error" });
        }

        // ถ้ามีการอัปเดตให้แสดงผลข้อมูลทั้งหมดที่เกี่ยวข้อง
        const sql = `
          SELECT
        b.request_id,
        b.member_id,
        m.full_name,
        m.first_name,
        m.last_name,
        m.team,
        p.product_id,
        p.name AS product_name,
        b.quantity,
        b.request_date,
        b.due_return_date,
        b.return_date,
        b.receive_date,
        b.note,
        p.price_per_item,
        IFNULL(s.status_name, 'รอการอนุมัติ') AS status_name,
        rd.latest_return_date,
        rd.returned_good,
        rd.returned_damaged,
        rd.returned_lost,
        rd.return_note,
        (
          b.quantity - (
            IFNULL(rd.returned_good, 0) + IFNULL(rd.returned_damaged, 0) + IFNULL(rd.returned_lost, 0)
          )
        ) AS total,
        (
          IFNULL(rd.returned_good, 0) + IFNULL(rd.returned_damaged, 0) + IFNULL(rd.returned_lost, 0)
        ) AS total_return
      FROM
        borrow_request b
        LEFT JOIN members m ON b.member_id = m.member_id
        LEFT JOIN product p ON b.product_id = p.product_id
        LEFT JOIN borrow_request_status s ON b.request_id = s.request_id
        LEFT JOIN (
          SELECT 
            request_id,
            MAX(return_date) AS latest_return_date,
            SUM(IFNULL(returned_good, 0)) AS returned_good,
            SUM(IFNULL(returned_damaged, 0)) AS returned_damaged,
            SUM(IFNULL(returned_lost, 0)) AS returned_lost,
            GROUP_CONCAT(note SEPARATOR ', ') AS return_note
          FROM return_detail
          GROUP BY request_id
        ) rd ON b.request_id = rd.request_id;
        `;

        // ดำเนินการ select ข้อมูล
        db.query(sql, (err, data) => {
          if (err) {
            console.error("Error fetching updated borrow request data:", err);
            return res.status(500).json({ error: "Server error" });
          }

          // ส่งข้อมูลกลับไปใน response
          return res.json(data);
        });
      });
    } else if (overReturnedRequests.length > 0) {
      // อัปเดตสถานะเป็น 'เกินกำหนด' สำหรับรายการที่เกินกำหนด
      const overdueDateQuery = `UPDATE borrow_request_status SET status_name = 'คืนครบแล้วแต่เลยกำหนดคืน' WHERE request_id IN (${overReturnedRequests
        .map((r) => r.request_id)
        .join(",")})`;
      db.query(overdueDateQuery, (err) => {
        if (err) {
          console.error("Error updating overdue status:", err);
          return res.status(500).json({ error: "Server error" });
        }

        // ถ้ามีการอัปเดตให้แสดงผลข้อมูลทั้งหมดที่เกี่ยวข้อง
        const sql = `
          SELECT
        b.request_id,
        b.member_id,
        m.full_name,
        m.first_name,
        m.last_name,
        m.team,
        p.product_id,
        p.name AS product_name,
        b.quantity,
        b.request_date,
        b.due_return_date,
        b.return_date,
        b.receive_date,
        b.note,
        p.price_per_item,
        IFNULL(s.status_name, 'รอการอนุมัติ') AS status_name,
        rd.latest_return_date,
        rd.returned_good,
        rd.returned_damaged,
        rd.returned_lost,
        rd.return_note,
        (
          b.quantity - (
            IFNULL(rd.returned_good, 0) + IFNULL(rd.returned_damaged, 0) + IFNULL(rd.returned_lost, 0)
          )
        ) AS total,
        (
          IFNULL(rd.returned_good, 0) + IFNULL(rd.returned_damaged, 0) + IFNULL(rd.returned_lost, 0)
        ) AS total_return
      FROM
        borrow_request b
        LEFT JOIN members m ON b.member_id = m.member_id
        LEFT JOIN product p ON b.product_id = p.product_id
        LEFT JOIN borrow_request_status s ON b.request_id = s.request_id
        LEFT JOIN (
          SELECT 
            request_id,
            MAX(return_date) AS latest_return_date,
            SUM(IFNULL(returned_good, 0)) AS returned_good,
            SUM(IFNULL(returned_damaged, 0)) AS returned_damaged,
            SUM(IFNULL(returned_lost, 0)) AS returned_lost,
            GROUP_CONCAT(note SEPARATOR ', ') AS return_note
          FROM return_detail
          GROUP BY request_id
        ) rd ON b.request_id = rd.request_id;
        `;

        // ดำเนินการ select ข้อมูล
        db.query(sql, (err, data) => {
          if (err) {
            console.error("Error fetching updated borrow request data:", err);
            return res.status(500).json({ error: "Server error" });
          }

          // ส่งข้อมูลกลับไปใน response
          return res.json(data);
        });
      });
    } else {
      // หากไม่มีข้อมูลที่เกินกำหนด ให้แสดงข้อมูลที่มีอยู่
      const sql = `
        SELECT
        b.request_id,
        b.member_id,
        m.full_name,
        m.first_name,
        m.last_name,
        m.team,
        p.product_id,
        p.name AS product_name,
        b.quantity,
        b.request_date,
        b.due_return_date,
        b.return_date,
        b.receive_date,
        b.note,
        p.price_per_item,
        IFNULL(s.status_name, 'รอการอนุมัติ') AS status_name,
        rd.latest_return_date,
        rd.returned_good,
        rd.returned_damaged,
        rd.returned_lost,
        rd.return_note,
        (
          b.quantity - (
            IFNULL(rd.returned_good, 0) + IFNULL(rd.returned_damaged, 0) + IFNULL(rd.returned_lost, 0)
          )
        ) AS total,
        (
          IFNULL(rd.returned_good, 0) + IFNULL(rd.returned_damaged, 0) + IFNULL(rd.returned_lost, 0)
        ) AS total_return
      FROM
        borrow_request b
        LEFT JOIN members m ON b.member_id = m.member_id
        LEFT JOIN product p ON b.product_id = p.product_id
        LEFT JOIN borrow_request_status s ON b.request_id = s.request_id
        LEFT JOIN (
          SELECT 
            request_id,
            MAX(return_date) AS latest_return_date,
            SUM(IFNULL(returned_good, 0)) AS returned_good,
            SUM(IFNULL(returned_damaged, 0)) AS returned_damaged,
            SUM(IFNULL(returned_lost, 0)) AS returned_lost,
            GROUP_CONCAT(note SEPARATOR ', ') AS return_note
          FROM return_detail
          GROUP BY request_id
        ) rd ON b.request_id = rd.request_id;
      `;

      // ดำเนินการ select ข้อมูล
      db.query(sql, (err, data) => {
        if (err) {
          console.error("Error fetching borrow request data:", err);
          return res.status(500).json({ error: "Server error" });
        }

        // ส่งข้อมูลกลับไปใน response
        return res.json(data);
      });
    }
  });
});

// ดึงข้อมูล borrow ของ member
app.get("/borrow/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT
        b.request_id,
        b.member_id,
        m.full_name,
        m.first_name,
        m.last_name,
        m.team,
        p.product_id,
        p.name AS product_name,
        b.quantity,
        b.request_date,
        b.due_return_date,
        b.return_date,
        b.receive_date,
        b.note,
        p.price_per_item,
        IFNULL(s.status_name, 'รอการอนุมัติ') AS status_name,
        rd.latest_return_date,
        rd.returned_good,
        rd.returned_damaged,
        rd.returned_lost,
        rd.return_note,
        (
          b.quantity - (
            IFNULL(rd.returned_good, 0) + IFNULL(rd.returned_damaged, 0) + IFNULL(rd.returned_lost, 0)
          )
        ) AS total,
        (
          IFNULL(rd.returned_good, 0) + IFNULL(rd.returned_damaged, 0) + IFNULL(rd.returned_lost, 0)
        ) AS total_return
      FROM
        borrow_request b
        LEFT JOIN members m ON b.member_id = m.member_id
        LEFT JOIN product p ON b.product_id = p.product_id
        LEFT JOIN borrow_request_status s ON b.request_id = s.request_id
        LEFT JOIN (
          SELECT 
            request_id,
            MAX(return_date) AS latest_return_date,
            SUM(IFNULL(returned_good, 0)) AS returned_good,
            SUM(IFNULL(returned_damaged, 0)) AS returned_damaged,
            SUM(IFNULL(returned_lost, 0)) AS returned_lost,
            GROUP_CONCAT(note SEPARATOR ', ') AS return_note
          FROM return_detail
          GROUP BY request_id
        ) rd ON b.request_id = rd.request_id
      WHERE
      b.member_id = ?`,
    [id],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(results);
      }
    }
  );
});

app.get("/cancel-history", verifyToken, (req, res) => {
  const userRole = req.user.role;
  const userId = req.user.id;

  const baseSQL = `
    SELECT 
      br.request_id,
      m.full_name,
      m.first_name, 
      m.last_name,
      m.team,
      p.name,
      br.quantity,
      br.request_date,
      br.note AS purpose,
      bs.cancel_reason,
      bs.canceled_by,
      bs.updated_date AS cancel_timestamp
    FROM borrow_request br
    JOIN borrow_request_status bs ON br.request_id = bs.request_id
    JOIN members m ON br.member_id = m.member_id
    JOIN product p ON br.product_id = p.product_id
    WHERE bs.status_name = 'ถูกยกเลิก'
  `;

  const condition = userRole === 1 ? "" : ` AND br.member_id = ${userId}`;
  const finalSQL = baseSQL + condition + " ORDER BY bs.updated_date DESC";

  db.query(finalSQL, (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาดในการดึงคำขอยกเลิก:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(result);
  });
});

app.post("/borrow", (req, res) => {
  const {
    member_id,
    product_id,
    quantity,
    request_date,
    due_return_date,
    note,
  } = req.body;

  const insertBorrowSQL = `
    INSERT INTO borrow_request (
      member_id, product_id, quantity, request_date, due_return_date, note
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertBorrowSQL,
    [member_id, product_id, quantity, request_date, due_return_date, note],
    (err, result) => {
      if (err) {
        console.error("Insert borrow_request error:", err);
        return res.status(500).send("ไม่สามารถบันทึกคำขอได้");
      }

      const requestId = result.insertId;

      const insertStatusSQL = `
        INSERT INTO borrow_request_status (request_id, status_name)
        VALUES (?, 'รอการอนุมัติ')
      `;

      db.query(insertStatusSQL, [requestId], (err2) => {
        if (err2) {
          console.error("Insert status error:", err2);
          return res.status(500).send("ไม่สามารถบันทึกสถานะได้");
        }

        res.status(200).json({ message: "ส่งคำขอสำเร็จ!" });
      });
    }
  );
});

// อัปเดตข้อมูล status borrow
app.put("/borrow/:id", (req, res) => {
  const { id } = req.params;
  const { status_name, qty, product_id } = req.body;

  if (status_name === "อนุมัติแล้ว") {
    const getProductSQL = `SELECT quantity FROM product WHERE product_id = ?`;
    db.query(getProductSQL, [product_id], (err, result) => {
      if (err) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  
      if (result.length === 0) {
        return res.status(404).json({ error: "ไม่พบสินค้า" });
      }
  
      const availableQty = result[0].quantity;
  
      if (availableQty >= qty) {
        // มีสินค้าเพียงพอ
        const updateBorrowSQL = `
          UPDATE borrow_request_status 
          SET status_name = ?
          WHERE request_id = ?
        `;
        db.query(updateBorrowSQL, [status_name, id], (err) => {
          if (err) {
            console.error("เกิดข้อผิดพลาดในการอัปเดตสถานะการขอยืม:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
  
          // ลดจำนวนสินค้า
          const updateProductQtySQL = `
            UPDATE product 
            SET quantity = quantity - ? 
            WHERE product_id = ?
          `;
          db.query(updateProductQtySQL, [qty, product_id], (err) => {
            if (err) {
              console.error("เกิดข้อผิดพลาดในการอัปเดตจำนวนสินค้า:", err);
              return res.status(500).json({ error: "Internal Server Error" });
            }
  
            // ถ้า quantity เหลือ 0 ให้เปลี่ยนสถานะเป็น "ไม่พร้อมใช้งาน"
            const updateProductStatusSQL = `
              UPDATE product 
              SET status = ? 
              WHERE product_id = ? AND quantity = 0
            `;
            db.query(updateProductStatusSQL, ["ไม่พร้อมใช้งาน", product_id], (err) => {
              if (err) {
                console.error("เกิดข้อผิดพลาดในการอัปเดตสถานะสินค้า:", err);
                return res.status(500).json({ error: "Internal Server Error" });
              }
  
              // ✅ ทุกอย่างสำเร็จ
              return res.json({ message: "อัปเดตสำเร็จ!!!" });
            });
          });
        });
  
      } else {
        // สินค้าไม่เพียงพอ
        return res.status(400).json({ error: "จำนวนสินค้าไม่เพียงพอ ไม่สามารถอนุมัติได้" });
      }
    });
  }else if (status_name === "ส่งคืนแล้ว") {
    db.query(
      "UPDATE borrow_request SET return_date = NOW()  WHERE request_id = ?",
      [id],
      (err, results) => {
        if (err) {
          res.status(500).send;
        }
      }
    );
    db.query(
      "UPDATE borrow_request_status SET status_name = ? WHERE request_id = ?",
      [status_name, id],
      (err, results) => {
        if (err) {
          res.status(500).send(err);
        } else {
          db.query(
            "UPDATE product SET quantity = quantity + ? WHERE product_id = ?",
            [qty, product_id],
            (err, results_status) => {
              if (err) {
                res.status(500).send(err);
              }
            }
          );
          db.query(
            "UPDATE product SET status = ? WHERE product_id = ? AND quantity > 0",
            ["พร้อมใช้งาน", product_id],
            (err, results_status) => {
              if (err) {
                res.status(500).send(err);
              }
            }
          );
          res.json({ message: "อับเดตสำเร็จ!!!" });
        }
      }
    );
  } else if (status_name === "ผู้ยืมได้รับของแล้ว") {
    // อัปเดต receive_date ก่อน
    // console.log("ผู้ยืมได้รับของแล้ว--->", status_name, qty, product_id);
    db.query(
      "UPDATE borrow_request SET receive_date = NOW() WHERE request_id = ?",
      [id],
      (err1, results1) => {
        if (err1) {
          return res.status(500).send(err1);
        }

        // อัปเดตสถานะหลังจากสำเร็จแล้ว
        db.query(
          "UPDATE borrow_request_status SET status_name = ? WHERE request_id = ?",
          [status_name, id],
          (err2, results2) => {
            if (err2) {
              return res.status(500).send(err2);
            }

            // ตอบกลับเมื่อทั้งสอง query สำเร็จ
            res.json({ message: "อัปเดตสำเร็จ!!!" });
          }
        );
      }
    );
  }
  // else {
  //   db.query(
  //     "UPDATE borrow_request_status SET status_name = ? WHERE request_id = ?",
  //     [status_name, id],
  //     (err, results) => {
  //       if (err) {
  //         res.status(500).send(err);
  //       } else {
  //         db.query(
  //           "UPDATE product SET quantity = quantity - ? WHERE product_id = ?",
  //           [qty, product_id],
  //           (err, results_status) => {
  //             if (err) {
  //               res.status(500).send(err);
  //             }
  //           }
  //         );
  //         db.query(
  //           "UPDATE product SET status = ? WHERE product_id = ? AND quantity = 0",
  //           ["ไม่พร้อมใช้งาน", product_id],
  //           (err, results_status) => {
  //             if (err) {
  //               res.status(500).send(err);
  //             }
  //           }
  //         );
  //         res.json({ message: "อัปเดตสำเร็จ!!!" });
  //       }
  //     }
  //   );
  // }
});

// ยกเลิกคำร้อง borrow
app.put("/borrow/:id/cancel", (req, res) => {
  const { id } = req.params;
  const { cancel_reason, canceled_by } = req.body;

  const sql = `
    UPDATE borrow_request_status 
    SET status_name = ?, cancel_reason = ?, canceled_by = ?, updated_date = NOW()
    WHERE request_id = ?
  `;

  db.query(
    sql,
    ["ถูกยกเลิก", cancel_reason, canceled_by, id],
    (err, result) => {
      if (err) {
        console.error("Cancel error:", err);
        res.status(500).send("เกิดข้อผิดพลาดในการยกเลิก");
      } else {
        res.json({ message: "ยกเลิกคำร้องสำเร็จ" });
      }
    }
  );
});

app.put("/borrow/:id/return", (req, res) => {
  const { id } = req.params;
  const { return_quantity, note, product_id, return_condition } = req.body;

  if (!return_quantity || return_quantity <= 0 || !return_condition) {
    return res.status(400).json({ message: "ข้อมูลไม่ครบหรือไม่ถูกต้อง" });
  }

  db.query(
    `SELECT 
         b.request_id,
         b.quantity,
         b.return_quantity,
         b.request_date,
         b.due_return_date,
         b.note,
         m.full_name,
         m.first_name, 
         m.last_name,
         m.team,
         p.name AS product_name
       FROM borrow_request b
       JOIN members m ON b.member_id = m.member_id
       JOIN product p ON b.product_id = p.product_id
       WHERE b.request_id = ?`,
    [id],
    (err, results) => {
      if (err || results.length === 0) {
        return res
          .status(404)
          .json({ message: "ไม่พบคำร้องหรือเกิดข้อผิดพลาด" });
      }
      const {
        quantity: borrowed,
        return_quantity: alreadyReturned = 0,
        due_return_date,
        request_date,
        price_per_item,
      } = results[0];
      const totalAfterReturn = alreadyReturned + return_quantity;

      if (totalAfterReturn > borrowed) {
        return res.status(400).json({ message: "คืนเกินจำนวนที่ยืม" });
      }

      const status = totalAfterReturn === borrowed ? "ส่งคืนแล้ว" : "คืนไม่ครบ";

      // คำนวณค่าปรับ (ถ้าเลยกำหนด)
      const now = new Date();
      const dueDate = new Date(due_return_date);
      const isLate = now > dueDate;
      const lateFine = isLate
        ? Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24)) *
          0.25 *
          price_per_item
        : 0;

      let damageFine = 0;
      if (return_condition === "ชำรุด") damageFine = 0.5 * price_per_item;
      else if (return_condition === "สูญหาย") damageFine = 1 * price_per_item;

      const totalFine = lateFine + damageFine;

      const updateBorrow = `
          UPDATE borrow_request 
          SET return_quantity = ?, return_note = ?, return_condition = ?, fine = ?
          ${status === "ส่งคืนแล้ว" ? ", return_date = NOW()" : ""}"
          WHERE request_id = ?
        `;

      const borrowParams = [
        totalAfterReturn,
        note || null,
        return_condition,
        totalFine,
        id,
      ];

      db.query(updateBorrow, borrowParams, (err2) => {
        if (err2)
          return res.status(500).json({ message: "อัปเดตข้อมูลคืนล้มเหลว" });

        db.query(
          "UPDATE borrow_request_status SET status_name = ?, updated_date = NOW() WHERE request_id = ?",
          [status, id],
          (err3) => {
            if (err3)
              return res.status(500).json({ message: "อัปเดตสถานะล้มเหลว" });

            if (return_condition !== "สูญหาย") {
              db.query(
                "UPDATE product SET quantity = quantity + ? WHERE product_id = ?",
                [return_quantity, product_id],
                (err4) => {
                  if (err4)
                    return res
                      .status(500)
                      .json({ message: "อัปเดตคลังล้มเหลว" });
                  return res.json({
                    message: "คืนสำเร็จ",
                    status,
                    fine: totalFine,
                  });
                }
              );
            } else {
              return res.json({
                message: "คืนสำเร็จ (สูญหาย)",
                status,
                fine: totalFine,
              });
            }
          }
        );
      });
    }
  );
});

app.get("/return-detail/user/:id", (req, res) => {
  const userId = req.params.id;

  const sql = `
      SELECT
          rd.*,
          br.product_id,
          p.name AS product_name,
          m.team,
          br.quantity,
          br.receive_date,
          CASE
              WHEN m.full_name IS NOT NULL AND m.full_name != ''
                  THEN m.full_name
              ELSE CONCAT(m.first_name, ' ', m.last_name)
          END AS member_name,
          CASE
              WHEN rcv.full_name IS NOT NULL AND rcv.full_name != ''
                  THEN rcv.full_name
              ELSE CONCAT(rcv.first_name, ' ', rcv.last_name)
          END AS received_by_name,
          CASE
              WHEN rtn.full_name IS NOT NULL AND rtn.full_name != ''
                  THEN rtn.full_name
              ELSE CONCAT(rtn.first_name, ' ', rtn.last_name)
          END AS returned_by_name,
          s.status_name
      FROM return_detail rd
      LEFT JOIN borrow_request br ON rd.request_id = br.request_id
      LEFT JOIN product p ON br.product_id = p.product_id
      LEFT JOIN members m ON br.member_id = m.member_id
      LEFT JOIN members rcv ON rd.received_by = rcv.member_id
      LEFT JOIN members rtn ON rd.returned_by = rtn.member_id
      LEFT JOIN borrow_request_status s ON br.request_id = s.request_id
      WHERE br.member_id = ?
      ORDER BY rd.return_date DESC;
    `;
  // const sql = `
  //     SELECT rd.*,
  //       br.product_id,
  //       p.name AS product_name,
  //       u.full_name AS returned_by,
  //       m.full_name AS member_name
  //     FROM return_detail rd
  //     JOIN borrow_request br ON rd.request_id = br.request_id
  //     JOIN product p ON br.product_id = p.product_id
  //     JOIN members m ON br.member_id = m.member_id
  //     LEFT JOIN users u ON rd.returned_by = u.id
  //     WHERE br.member_id = ?
  //     ORDER BY rd.return_date DESC
  //   `;
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    // console.log("result", result);
    res.json(result);
  });
});

// ✅ ดึงข้อมูล return ทั้งหมด (สำหรับผู้ดูแล)
app.get("/return-detail", (req, res) => {
  const sql = `
      SELECT
          rd.*,
          br.product_id,
          p.name AS product_name,
          m.team,
          br.quantity,
          br.receive_date,
          CASE
              WHEN m.full_name IS NOT NULL AND m.full_name != ''
                  THEN m.full_name
              ELSE CONCAT(m.first_name, ' ', m.last_name)
          END AS member_name,
          CASE
              WHEN rcv.full_name IS NOT NULL AND rcv.full_name != ''
                  THEN rcv.full_name
              ELSE CONCAT(rcv.first_name, ' ', rcv.last_name)
          END AS received_by_name,
          CASE
              WHEN rtn.full_name IS NOT NULL AND rtn.full_name != ''
                  THEN rtn.full_name
              ELSE CONCAT(rtn.first_name, ' ', rtn.last_name)
          END AS returned_by_name,
          s.status_name
      FROM return_detail rd
      LEFT JOIN borrow_request br ON rd.request_id = br.request_id
      LEFT JOIN product p ON br.product_id = p.product_id
      LEFT JOIN members m ON br.member_id = m.member_id
      LEFT JOIN members rcv ON rd.received_by = rcv.member_id
      LEFT JOIN members rtn ON rd.returned_by = rtn.member_id
      LEFT JOIN borrow_request_status s ON br.request_id = s.request_id
      ORDER BY rd.return_date DESC;
    `;
  // const sql = `
  //     SELECT rd.*,
  //       br.product_id,
  //       p.name AS product_name,
  //       CASE
  //         WHEN m.full_name IS NOT NULL AND m.full_name != ''
  //           THEN m.full_name
  //         ELSE CONCAT(m.first_name, ' ', m.last_name)
  //       END AS member_name,
  //       u.full_name AS returned_by
  //     FROM return_detail rd
  //     JOIN borrow_request br ON rd.request_id = br.request_id
  //     JOIN product p ON br.product_id = p.product_id
  //     JOIN members m ON br.member_id = m.member_id
  //     LEFT JOIN users u ON rd.returned_by = u.id
  //     ORDER BY rd.return_date DESC
  //   `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    // console.log("result", result);
    res.json(result);
  });
});

app.get("/borrow/unreturned", (req, res) => {
  const sql = `
      SELECT 
        b.request_id,
        b.member_id,
        m.full_name,
        m.first_name, 
        m.last_name,
        m.team,
        p.name AS product_name,
        b.quantity,
        b.request_date,
        b.due_return_date,
        b.note AS purpose,
      IFNULL(s.status_name, 'รอการอนุมัติ') AS status_name,
      CASE 
          WHEN r.request_id IS NULL AND b.due_return_date < CURDATE() THEN 'เลยกำหนดและยังไม่คืน'
          WHEN r.return_date > b.due_return_date THEN 'คืนแล้วแต่เลยกำหนด'
          ELSE 'ปกติ'
      END AS return_status
      FROM borrow_request b
      LEFT JOIN members m ON b.member_id = m.member_id
      LEFT JOIN product p ON b.product_id = p.product_id
      LEFT JOIN borrow_request_status s ON b.request_id = s.request_id
      LEFT JOIN (
          SELECT request_id, MIN(return_date) AS return_date
          FROM return_detail
          GROUP BY request_id
      ) r ON b.request_id = r.request_id
      WHERE s.status_name IN ('รับของแล้ว', 'คืนไม่ครบ')  -- ต้องเป็นคำขอที่เคยได้รับของ
        AND (
              (r.request_id IS NULL AND b.due_return_date < CURDATE())  -- เลยกำหนดแล้วยังไม่คืน
              OR
              (r.return_date > b.due_return_date)  -- คืนแล้วแต่เลยกำหนด
          )
      ORDER BY b.request_id DESC;

          `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching unreturned requests:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch unreturned requests" });
    }
    res.json(results);
  });
});

app.get("/check-duplicate", (req, res) => {
  const { email, username } = req.query;
  const sql = `SELECT email, username FROM members WHERE email = ? OR username = ?`;
  db.query(sql, [email, username], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    const emailExists = result.some((row) => row.email === email);
    const usernameExists = result.some((row) => row.username === username);

    res.json({ emailExists, usernameExists });
  });
});

app.get("/return-detail", verifyToken, (req, res) => {
  const userRole = req.user.role;
  const userId = req.user.id;

  let sql = `
    SELECT 
    br.request_id,
    br.member_id,
    p.name AS product_name,
    br.quantity,
    br.request_date,
    br.due_return_date,
    br.return_date,
    br.note,
    m.team,
    IFNULL(s.status_name, 'รอการอนุมัติ') AS status_name,
    CASE 
        WHEN m.full_name IS NOT NULL AND m.full_name != '' 
            THEN m.full_name 
        ELSE CONCAT(m.first_name, ' ', m.last_name) 
    END AS member_name,
    rd.request_id AS return_detail_request_id, -- ถ้าไม่มี return_detail จะเป็น NULL
    rd.returned_good,
    rd.returned_damaged,
    rd.returned_lost,
    rd.note AS return_note
FROM borrow_request br
JOIN product p ON br.product_id = p.product_id
JOIN members m ON br.member_id = m.member_id
LEFT JOIN borrow_request_status s ON br.request_id = s.request_id
LEFT JOIN return_detail rd ON br.request_id = rd.request_id
    `;
  // let sql = `
  //     SELECT rd.*,
  //       br.product_id,
  //       p.name AS product_name,
  //       CASE
  //         WHEN m.full_name IS NOT NULL AND m.full_name != ''
  //           THEN m.full_name
  //         ELSE CONCAT(m.first_name, ' ', m.last_name)
  //       END AS member_name,
  //       u.full_name AS returned_by
  //     FROM return_detail rd
  //     JOIN borrow_request br ON rd.request_id = br.request_id
  //     JOIN product p ON br.product_id = p.product_id
  //     JOIN members m ON br.member_id = m.member_id
  //     LEFT JOIN users u ON rd.returned_by = u.id
  //   `;

  const params = [];

  if (userRole === 2) {
    // ถ้าเป็นผู้ใช้ทั่วไป ให้กรองเฉพาะของตัวเอง
    sql += ` WHERE br.member_id = ?`;
    params.push(userId);
  }

  sql += ` ORDER BY rd.return_date DESC`;

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลการคืน:", err);
      return res.status(500).json({ error: "ดึงข้อมูลล้มเหลว" });
    }
    res.json(result);
  });
});

// app.post("/return-detail", verifyToken, (req, res) => {
//   const {
//     request_id,
//     good_qty,
//     damaged_qty,
//     lost_qty,
//     fine_amount,
//     note,
//     returned_by,
//     received_by,
//     qty,
//     product_id,
//   } = req.body;

//   const checksql = `
//       SELECT member_id, first_name, last_name, full_name
//       FROM members
//       WHERE 
//         full_name LIKE ? OR
//         first_name LIKE ? OR
//         last_name LIKE ?
//       LIMIT 1
//     `;

//   const returnedSearch = `%${returned_by}%`;
//   const receivedSearch = `%${received_by}%`;

//   // ค้นหา returned_by
//   db.query(
//     checksql,
//     [returnedSearch, returnedSearch, returnedSearch],
//     (err, result1) => {
//       if (err || result1.length === 0) {
//         console.error("ค้นหา returned_by ไม่สำเร็จ:", err);
//         console.error("returned_by:", returnedSearch);
//         console.error("checksql result:", checksql);
//         return res.status(400).send("ไม่พบผู้ส่งคืน");
//       }

//       const returned_id = result1[0].member_id;

//       // ค้นหา received_by
//       db.query(
//         checksql,
//         [receivedSearch, receivedSearch, receivedSearch],
//         (err2, result2) => {
//           if (err2 || result2.length === 0) {
//             return res.status(400).send("ไม่พบผู้รับของคืน");
//           }

//           const received_id = result2[0].member_id;

//           const insertsql = `
//             INSERT INTO return_detail (
//               request_id,
//               returned_good,
//               returned_damaged,
//               returned_lost,
//               fine_amount,
//               note,
//               received_by,
//               returned_by,
//               return_date
//             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
//           `;

//           db.query(
//             insertsql,
//             [
//               request_id,
//               good_qty,
//               damaged_qty,
//               lost_qty,
//               fine_amount,
//               note,
//               returned_id,
//               received_id,
//             ],
//             (err3, result3) => {
//               console.error("Insert return_detail error:", err3);
//               if (err3) {
//                 return res.status(500).send("เกิดข้อผิดพลาดในการบันทึกการคืนของ");
//               }
//               // อัปเดตสถานะการคืนของ
//               var total_return = good_qty + damaged_qty + lost_qty;
//               var total_product = good_qty + damaged_qty;
//               if (good_qty === qty) {
//                 const updatesql = `
//                 UPDATE borrow_request_status
//                 SET status_name = 'คืนของแล้ว'
//                 WHERE request_id = ?
//               `;
//                 db.query(updatesql, [request_id], (err4, result4) => {
//                   // console.log(result4);
//                   if (err4) {
//                     return res
//                       .status(500)
//                       .send("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
//                   }

//                   db.query(
//                     "UPDATE product SET quantity = quantity + ? , status = ? WHERE product_id = ?",
//                     [good_qty, "พร้อมใช้งาน", product_id],
//                     (err, results_status) => {
//                       if (err) {
//                         res.status(500).send(err);
//                       }
//                     }
//                   );
//                   return res
//                     .status(200)
//                     .send("บันทึกการคืนของและอัปเดตสถานะเรียบร้อยแล้ว");
//                 });
//               } else if (total_return < qty) {
//                 const updatesql = `
//                 UPDATE borrow_request_status
//                 SET status_name = 'คืนไม่ครบ'
//                 WHERE request_id = ?
//               `;
//                 db.query(updatesql, [request_id], (err4, result4) => {
//                   // console.log(result4);
//                   if (err4) {
//                     return res
//                       .status(500)
//                       .send("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
//                   }
//                   db.query(
//                     "UPDATE product SET quantity = quantity + ? , status = ? WHERE product_id = ?",
//                     [total_product, "พร้อมใช้งาน", product_id],
//                     (err, results_status) => {
//                       if (err) {
//                         res.status(500).send(err);
//                       }
//                     }
//                   );
//                   return res
//                     .status(200)
//                     .send("บันทึกการคืนของและอัปเดตสถานะเรียบร้อยแล้ว");
//                 });
//               }
//             }
//           );
//         }
//       );
//     }
//   );
// });

// ✅ ส่วนเสริมใหม่ใน server.js (Backend) สำหรับ "บันทึกการซ่อม"

// แก้ใหม่
app.post("/return-detail", verifyToken, (req, res) => {
  const {
    request_id,
    good_qty,
    damaged_qty,
    lost_qty,
    fine_amount,
    note,
    returned_by,
    received_by,
    qty,
    product_id,
  } = req.body;

  const checksql = `
      SELECT member_id, first_name, last_name, full_name
      FROM members
      WHERE 
        full_name LIKE ? OR
        first_name LIKE ? OR
        last_name LIKE ?
      LIMIT 1
    `;

  const returnedSearch = `%${returned_by}%`;
  const receivedSearch = `%${received_by}%`;

  // ค้นหา returned_by
  db.query(
    checksql,
    [returnedSearch, returnedSearch, returnedSearch],
    (err, result1) => {
      if (err || result1.length === 0) {
        console.error("ค้นหา returned_by ไม่สำเร็จ:", err);
        console.error("returned_by:", returnedSearch);
        console.error("checksql result:", checksql);
        return res.status(400).send("ไม่พบผู้ส่งคืน");
      }

      const returned_id = result1[0].member_id;

      // ค้นหา received_by
      db.query(
        checksql,
        [receivedSearch, receivedSearch, receivedSearch],
        (err2, result2) => {
          if (err2 || result2.length === 0) {
            return res.status(400).send("ไม่พบผู้รับของคืน");
          }

          const received_id = result2[0].member_id;

          const insertsql = `
            INSERT INTO return_detail (
              request_id,
              returned_good,
              returned_damaged,
              returned_damaged_old,
              returned_lost,
              fine_amount,
              note,
              received_by,
              returned_by,
              return_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `;

          db.query(
            insertsql,
            [
              request_id,
              good_qty,
              damaged_qty,
              damaged_qty,
              lost_qty,
              fine_amount,
              note,
              returned_id,
              received_id,
            ],
            (err3, result3) => {
              console.error("Insert return_detail error:", err3);
              if (err3) {
                return res
                  .status(500)
                  .send("เกิดข้อผิดพลาดในการบันทึกการคืนของ");
              }
              // อัปเดตสถานะการคืนของ
              var total_return = good_qty + damaged_qty + lost_qty;
              var total_product = good_qty;
              if (total_return === qty) {
                if(damaged_qty > 0){
                  const updatesql = `
                    UPDATE borrow_request_status
                    SET status_name = 'คืนของแล้ว/มีของชำรุด'
                    WHERE request_id = ?
                  `;
                  db.query(updatesql, [request_id], (err4, result4) => {
                    // console.log(result4);
                    if (err4) {
                      return res
                        .status(500)
                        .send("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
                    }

                    db.query(
                      "UPDATE product SET quantity = quantity + ? , status = ? WHERE product_id = ?",
                      [total_product, "พร้อมใช้งาน", product_id],
                      (err, results_status) => {
                        if (err) {
                          res.status(500).send(err);
                        }
                      }
                    );
                    return res
                      .status(200)
                      .send("บันทึกการคืนของและอัปเดตสถานะเรียบร้อยแล้ว");
                  });
                }else{
                  const updatesql = `
                    UPDATE borrow_request_status
                    SET status_name = 'คืนของแล้ว'
                    WHERE request_id = ?
                  `;
                  db.query(updatesql, [request_id], (err4, result4) => {
                    // console.log(result4);
                    if (err4) {
                      return res
                        .status(500)
                        .send("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
                    }

                    db.query(
                      "UPDATE product SET quantity = quantity + ? , status = ? WHERE product_id = ?",
                      [total_product, "พร้อมใช้งาน", product_id],
                      (err, results_status) => {
                        if (err) {
                          res.status(500).send(err);
                        }
                      }
                    );
                    return res
                      .status(200)
                      .send("บันทึกการคืนของและอัปเดตสถานะเรียบร้อยแล้ว");
                  });
                }
              } else if (total_return < qty) {
                if(damaged_qty > 0){
                  const updatesql = `
                    UPDATE borrow_request_status
                    SET status_name = 'คืนไม่ครบ/มีของชำรุด'
                    WHERE request_id = ?
                  `;
                  db.query(updatesql, [request_id], (err4, result4) => {
                    // console.log(result4);
                    if (err4) {
                      return res
                        .status(500)
                        .send("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
                    }
                    db.query(
                      "UPDATE product SET quantity = quantity + ? , status = ? WHERE product_id = ?",
                      [total_product, "พร้อมใช้งาน", product_id],
                      (err, results_status) => {
                        if (err) {
                          res.status(500).send(err);
                        }
                      }
                    );
                    return res
                      .status(200)
                      .send("บันทึกการคืนของและอัปเดตสถานะเรียบร้อยแล้ว");
                  });
                }else{
                  const updatesql = `
                    UPDATE borrow_request_status
                    SET status_name = 'คืนไม่ครบ'
                    WHERE request_id = ?
                  `;
                  db.query(updatesql, [request_id], (err4, result4) => {
                    // console.log(result4);
                    if (err4) {
                      return res
                        .status(500)
                        .send("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
                    }
                    db.query(
                      "UPDATE product SET quantity = quantity + ? , status = ? WHERE product_id = ?",
                      [total_product, "พร้อมใช้งาน", product_id],
                      (err, results_status) => {
                        if (err) {
                          res.status(500).send(err);
                        }
                      }
                    );
                    return res
                      .status(200)
                      .send("บันทึกการคืนของและอัปเดตสถานะเรียบร้อยแล้ว");
                  });
                }
              }
            }
          );
        }
      );
    }
  );
});

app.use(cors());
app.use(express.json());

// ✅ เพิ่มรายการซ่อมใหม่ (โดยผู้ดูแลเท่านั้น)
app.post("/maintenance-record", (req, res) => {
  const {
    request_id,
    member_id,
    quantity,
    cost,
    description,
    repaired_by,
    completed_date,
  } = req.body;

  const sql = `
    INSERT INTO maintenance_record
    (request_id, member_id, quantity, repair_cost, description, responsible_person, completed_timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      request_id,
      member_id,
      quantity,
      cost,
      description,
      repaired_by,
      completed_date,
    ],
    (err, result) => {
      if (err) return res.status(500).send(err);

      // หลัง insert สำเร็จ → บันทึกสถานะเริ่มต้นเป็น "กำลังซ่อม"
      const insertId = result.insertId;
      const statusSql = `INSERT INTO maintenance_status (record_id, status_name) VALUES (?, 'กำลังซ่อม')`;
      db.query(statusSql, [insertId], (err2) => {
        if (err2) return res.status(500).send(err2);
        res.status(200).send("เพิ่มรายการซ่อมและสถานะเรียบร้อยแล้ว");
      });
    }
  );
});

// ✅ GET: ดึงข้อมูลการซ่อมทั้งหมด
app.get("/maintenance-record", (req, res) => {
  const sql = `
    SELECT mr.*, p.name AS product_name, u.full_name AS member_name
    FROM maintenance_record mr
    JOIN product p ON mr.product_id = p.product_id
    JOIN users u ON mr.member_id = u.id
    ORDER BY mr.record_id DESC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// ✅ GET: ดึงประวัติการซ่อมเฉพาะของสินค้า
app.get("/maintenance-record/:product_id", (req, res) => {
  const { product_id } = req.params;
  const sql = `
    SELECT * FROM maintenance_record
    WHERE product_id = ?
    ORDER BY maintenance_date DESC
  `;
  db.query(sql, [product_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ✅ ดึงสถานะย้อนหลังของรายการซ่อมแต่ละชิ้น
app.get("/maintenance-status/:record_id", (req, res) => {
  const recordId = req.params.record_id;
  const sql = `
    SELECT * FROM maintenance_status
    WHERE record_id = ?
    ORDER BY updated_date ASC
  `;
  db.query(sql, [recordId], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// ✅ PUT: อัปเดตสถานะการซ่อม (หรือกรอกวันที่เสร็จ)
app.put("/maintenance-record/:id", (req, res) => {
  const { id } = req.params;
  const { status_name, actual_finish_date, cost, assigned_to } = req.body;

  const sql = `
    UPDATE maintenance_record
    SET status_name = ?,
        actual_finish_date = ?,
        cost = ?,
        assigned_to = ?
    WHERE record_id = ?
  `;

  db.query(
    sql,
    [status_name, actual_finish_date, cost, assigned_to, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "อัปเดตสถานะซ่อมสำเร็จ" });
    }
  );
});

app.put("/maintenance/update-repair/:id", (req, res) => {
  const recordId = req.params.id;
  const { repair_by, cost, repair_date } = req.body;

  const sql = `
    UPDATE maintenance_record 
    SET repair_by = ?, cost = ?, repair_date = ? 
    WHERE record_id = ?
  `;

  db.query(sql, [repair_by, cost, repair_date, recordId], (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตผลซ่อม:", err);
      return res.status(500).send("ไม่สามารถบันทึกผลซ่อมได้");
    }
    return res.status(200).send("อัปเดตผลซ่อมสำเร็จ");
  });
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

// ดึงข้อมูล members ทั้งหมด role = 0
app.get("/listmembers", (req, res) => {
  const sql = `SELECT mb.*,roles.role_name FROM members mb LEFT JOIN roles ON mb.role_id = roles.role_id ORDER BY mb.role_id ASC`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาด:", err);
      return res.status(500).send("ไม่สามารถดึงข้อมูลได้");
    }
    res.json(result);
  });
});

app.put("/users/approve/:id", (req, res) => {
  const { id } = req.params;
  const { role_id } = req.body;

  db.query(
    "UPDATE members SET role_id = ? WHERE member_id = ?",
    [role_id, id],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).send(err);
      }
      res.json({ message: "อัปเดตผู้ใช้สำเร็จ" });
    }
  );
});
app.put("/repair/:id", (req, res) => {
  const { id } = req.params;
  const { repair_note, repaired_quantity, product_id } = req.body;

  // แปลง repaired_quantity เป็นตัวเลข
  const repaired_quantity_number = +repaired_quantity;  // ใช้ + เพื่อแปลงจาก string เป็น number

  console.log("repaired_quantity_number", repaired_quantity_number);
  // ตรวจสอบว่าค่าที่แปลงแล้วเป็นเลขจริง
  if (isNaN(repaired_quantity_number) || repaired_quantity_number <= 0) {
    return res.status(400).json({ message: "จำนวนซ่อมแซมไม่ถูกต้อง" });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.error("Begin transaction error:", err);
      return res.status(500).json({ message: err });
    }

    const updateReturnDetailQuery = `
      UPDATE return_detail
      SET repair_note = ?, 
          repaired_quantity = repaired_quantity + ?,
          returned_damaged = returned_damaged - ?,
          repair_date = NOW()
      WHERE return_id = ?
    `;

    db.query(updateReturnDetailQuery, [repair_note, repaired_quantity_number, repaired_quantity_number, id], (err, result1) => {
      console.log("db", db);
      if (err) {
        return db.rollback(() => {
          console.error("Error updating return_detail:", err);
          res.status(500).json({ message: "อัปเดต return_detail ล้มเหลว" });
        });
      }

      if (result1.affectedRows === 0) {
        return db.rollback(() => {
          res.status(404).json({ message: "ไม่พบรายการที่ต้องการอัปเดต" });
        });
      }

      const updateProductQuery = `
        UPDATE product
        SET quantity = quantity + ?
        WHERE product_id = ?
      `;

      db.query(updateProductQuery, [repaired_quantity_number, product_id], (err, result2) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error updating product:", err);
            res.status(500).json({ message: "อัปเดต product ล้มเหลว" });
          });
        }

        if (result2.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({ message: "ไม่พบสินค้าเพื่ออัปเดตสถานะ" });
          });
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Commit error:", err);
              res.status(500).json({ message: "ยืนยันล้มเหลว" });
            });
          }

          res.json({ message: "อัปเดตข้อมูลเรียบร้อยแล้ว" });
        });
      });
    });
  });
});

