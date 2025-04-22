const express = require("express");
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
  db.query("SELECT * FROM categories", (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});


// เพิ่มข้อมูล product
app.post("/products", (req, res) => {
  const { name, color, qta, size, price_per_item, category_id, status_for_admin, status_for_user, image } = req.body;

  db.query(
    "INSERT INTO product (name, color, quantity, size, price_per_item, category_id, status_for_admin, status_for_user, image) VALUES (?,?,?,?,?,?,?,?,?)",
    [name, color, qta, size, price_per_item, category_id, status_for_admin, status_for_user, image],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({ message: "เพิ่มทรัพย์สินสำเร็จ!!!", id: results.insertId });
      }
    }
  );
});



// อัปเดตข้อมูล product
app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, color, qta, size, price, category_id, status, image } = req.body;
  db.query("UPDATE product SET name = ?, color = ?, quantity = ?, size = ?, price_per_item = ?, category_id = ?, status = ?, image = ? WHERE product_id = ?", [name, color, qta, size, price, category_id, status, image, id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ message: "อัปเดตทรัพย์สินสำเร็จ!!!" });
    }
  });
});

// ลบข้อมูล product
app.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM product WHERE product_id = ?", [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ message: "ลบทรัพย์สินสำเร็จ!!!", id: results.insertId });
    }
  });
});

// ฟังก์ชันสร้าง ID ใหม่
const generateNewId = (team, callback) => {
  db.query("SELECT CAST(REGEXP_REPLACE(member_id, '[^0-9]', '') AS UNSIGNED) AS numeric_part FROM members WHERE member_id LIKE ? AND role_id = 2 ORDER BY numeric_part DESC LIMIT 1", [`${team}%`], (err, results) => {
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
  });
};

// เพิ่มข้อมูล user
app.post("/users", async (req, res) => {
  try {
    const { first_name, last_name, prefix_name, email, team, phone, birthDate, username, password, role_id } = req.body;

    db.query(
      "SELECT * FROM members WHERE email = ? OR username = ?",
      [email, username], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) return res.status(400).json({ message: "อีเมลหรือชื่อผู้ใช้งานนี้ถูกใช้แล้ว" });
      }
    );

    generateNewId(team, (err, newId) => {
      if (err) {
        return res.status(500).send(err);
      }

      db.query(
        "INSERT INTO members (member_id, first_name, last_name, prefix_name, email, team, phone_number, brithday, username, password, role_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        [newId, first_name, last_name, prefix_name, email, team, phone, birthDate, username, password, role_id], (err, results) => {
          if (err) {
            return res.status(500).send(err);
          }
          res.json({ message: "เพิ่มสมาชิกสำเร็จ!!!", id: newId });
        }
      );
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
});

// เข้าสู่ระบบ (Login)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM members WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).send(err);
    if (!results || results.length === 0) return res.status(401).json({ message: "Invalid email or password" });

    const user = results[0];

    // ตรวจสอบรหัสผ่าน
    if (password === user.password) {
      const token = jwt.sign({ id: user.member_id, email: user.email, team: user.team, role: user.role_id }, "mysecretkey123", { expiresIn: "1h" });
      res.json({ message: "Login successful", token, user });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  });
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

  if (userRole === 2) { // ✅ ผู้ใช้งานทั่วไป
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
    b.quantity,
    b.note, 
    p.price_per_item, 
    IFNULL(s.status_name, 'รอการอนุมัติ') AS status_name, 
    rd.return_date AS latest_return_date, 
    rd.returned_good, 
    rd.returned_damaged, 
    rd.returned_lost, 
    rd.note AS return_note FROM borrow_request b LEFT JOIN members m ON 
    b.member_id = m.member_id LEFT JOIN product p ON 
    b.product_id = p.product_id LEFT JOIN borrow_request_status s ON 
    b.request_id = s.request_id LEFT JOIN return_detail rd ON 
    b.request_id = rd.request_id 
    ORDER BY b.request_id DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching borrow requests:", err);
      return res.status(500).json({ error: "Server error" });
    }
    res.json(results);
  });
});




// ดึงข้อมูล borrow ของ member
app.get("/borrow/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT b.request_id, b.quantity , b.product_id, b.request_date, b.due_return_date, b.return_date, bs.status_name, p.name, p.price_per_item FROM borrow_request b LEFT JOIN borrow_request_status bs ON b.request_id = bs.request_id LEFT JOIN product p ON b.product_id = p.product_id WHERE b.member_id = ?", [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
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
  const { status_name, qta, product_id } = req.body;

  if (status_name === "ส่งคืนแล้ว") {
    db.query("UPDATE borrow_request SET return_date = NOW() WHERE request_id = ?", [id], (err, results) => {
      if (err) {
        res.status(500).send
      }
    })
    db.query("UPDATE borrow_request_status SET status_name = ? WHERE request_id = ?", [status_name, id], (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        db.query("UPDATE product SET quantity = quantity + ? WHERE product_id = ?", [qta, product_id], (err, results_status) => {
          if (err) {
            res.status(500).send(err);
          }
        });
        db.query("UPDATE product SET status = ? WHERE product_id = ? AND quantity > 0", ["พร้อมใช้งาน", product_id], (err, results_status) => {
          if (err) {
            res.status(500).send(err);
          }
        });
        res.json({ message: "อับเดตสำเร็จ!!!" });
      }
    });

  } else {
    db.query("UPDATE borrow_request_status SET status_name = ? WHERE request_id = ?", [status_name, id], (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        db.query("UPDATE product SET quantity = quantity - ? WHERE product_id = ?", [qta, product_id], (err, results_status) => {
          if (err) {
            res.status(500).send(err);
          }
        });
        db.query("UPDATE product SET status = ? WHERE product_id = ? AND quantity = 0", ["ไม่พร้อมใช้งาน", product_id], (err, results_status) => {
          if (err) {
            res.status(500).send(err);
          }
        });
        res.json({ message: "อัปเดตสำเร็จ!!!" });
      }
    });
  }

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

  db.query(sql, ["ถูกยกเลิก", cancel_reason, canceled_by, id], (err, result) => {
    if (err) {
      console.error("Cancel error:", err);
      res.status(500).send("เกิดข้อผิดพลาดในการยกเลิก");
    } else {
      res.json({ message: "ยกเลิกคำร้องสำเร็จ" });
    }
  });
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
        return res.status(404).json({ message: "ไม่พบคำร้องหรือเกิดข้อผิดพลาด" });
      }
      const { quantity: borrowed, return_quantity: alreadyReturned = 0, due_return_date, request_date, price_per_item } = results[0];
      const totalAfterReturn = alreadyReturned + return_quantity;

      if (totalAfterReturn > borrowed) {
        return res.status(400).json({ message: "คืนเกินจำนวนที่ยืม" });
      }

      const status = totalAfterReturn === borrowed ? "ส่งคืนแล้ว" : "คืนไม่ครบ";

      // คำนวณค่าปรับ (ถ้าเลยกำหนด)
      const now = new Date();
      const dueDate = new Date(due_return_date);
      const isLate = now > dueDate;
      const lateFine = isLate ? (Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24)) * 0.25 * price_per_item) : 0;

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

      const borrowParams = [totalAfterReturn, note || null, return_condition, totalFine, id];

      db.query(updateBorrow, borrowParams, (err2) => {
        if (err2) return res.status(500).json({ message: "อัปเดตข้อมูลคืนล้มเหลว" });

        db.query("UPDATE borrow_request_status SET status_name = ?, updated_date = NOW() WHERE request_id = ?", [status, id], (err3) => {
          if (err3) return res.status(500).json({ message: "อัปเดตสถานะล้มเหลว" });

          if (return_condition !== "สูญหาย") {
            db.query("UPDATE product SET quantity = quantity + ? WHERE product_id = ?", [return_quantity, product_id], (err4) => {
              if (err4) return res.status(500).json({ message: "อัปเดตคลังล้มเหลว" });
              return res.json({ message: "คืนสำเร็จ", status, fine: totalFine });
            });
          } else {
            return res.json({ message: "คืนสำเร็จ (สูญหาย)", status, fine: totalFine });
          }
        });
      });
    }
  );
});


app.get("/return-detail/user/:id", (req, res) => {
  const userId = req.params.id;
  const sql = `
      SELECT rd.*, 
        br.product_id, 
        p.name AS product_name, 
        u.full_name AS returned_by, 
        m.full_name AS member_name
      FROM return_detail rd
      JOIN borrow_request br ON rd.request_id = br.request_id
      JOIN product p ON br.product_id = p.product_id
      JOIN members m ON br.member_id = m.member_id
      LEFT JOIN users u ON rd.returned_by = u.id
      WHERE br.member_id = ?
      ORDER BY rd.return_date DESC
    `;
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// ✅ ดึงข้อมูล return ทั้งหมด (สำหรับผู้ดูแล)
app.get("/return-detail", (req, res) => {
  const sql = `
      SELECT rd.*, 
        br.product_id, 
        p.name AS product_name, 
        CASE
          WHEN m.full_name IS NOT NULL AND m.full_name != ''
            THEN m.full_name
          ELSE CONCAT(m.first_name, ' ', m.last_name)
        END AS member_name
      FROM return_detail rd
      JOIN borrow_request br ON rd.request_id = br.request_id
      JOIN product p ON br.product_id = p.product_id
      JOIN members m ON br.member_id = m.member_id
      ORDER BY rd.return_date DESC
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
        b.purpose,
        IFNULL(s.status_name, 'รอการอนุมัติ') AS status_name
      FROM borrow_request b
      LEFT JOIN members m ON b.member_id = m.member_id
      LEFT JOIN product p ON b.product_id = p.product_id
      LEFT JOIN borrow_request_status s ON b.request_id = s.request_id
      WHERE NOT EXISTS (
        SELECT 1 FROM return_detail r
        WHERE r.request_id = b.request_id
      )
      AND s.status_name IN ('รับของแล้ว', 'คืนไม่ครบ')  -- ต้องเป็นคำขอที่เคยได้รับของ
      ORDER BY b.request_id DESC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching unreturned requests:", err);
      return res.status(500).json({ error: "Failed to fetch unreturned requests" });
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
      SELECT rd.*, 
        br.product_id, 
        p.name AS product_name, 
        CASE
          WHEN m.full_name IS NOT NULL AND m.full_name != ''
            THEN m.full_name
          ELSE CONCAT(m.first_name, ' ', m.last_name)
        END AS member_name,
        u.full_name AS returned_by
      FROM return_detail rd
      JOIN borrow_request br ON rd.request_id = br.request_id
      JOIN product p ON br.product_id = p.product_id
      JOIN members m ON br.member_id = m.member_id
      LEFT JOIN users u ON rd.returned_by = u.id
    `;

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
  db.query(checksql, [returnedSearch, returnedSearch, returnedSearch], (err, result1) => {
    if (err || result1.length === 0) {
      console.error("ค้นหา returned_by ไม่สำเร็จ:", err);
      console.error("returned_by:", returnedSearch);
      console.error("checksql result:", checksql);
      return res.status(400).send("ไม่พบผู้ส่งคืน");
    }

    const returned_id = result1[0].member_id;

    // ค้นหา received_by
    db.query(checksql, [receivedSearch, receivedSearch, receivedSearch], (err2, result2) => {
      if (err2 || result2.length === 0) {
        return res.status(400).send("ไม่พบผู้รับของคืน");
      }
    
      const received_id = result2[0].member_id;
    
      const insertsql = `
        INSERT INTO return_detail (
          request_id,
          returned_good,
          returned_damaged,
          returned_lost,
          fine_amount,
          note,
          received_by,
          returned_by,
          return_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
    
      db.query(
        insertsql,
        [
          request_id,
          good_qty,
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
            return res.status(500).send("เกิดข้อผิดพลาดในการบันทึกการคืนของ");
          }
      
          const updatesql = `
            UPDATE borrow_request_status
            SET status_name = 'รับของแล้ว'
            WHERE request_id = ?
          `;
      
          db.query(updatesql, [request_id], (err4, result4) => {
            console.log(result4);
            if (err4) {
              return res.status(500).send("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
            }
            // db.query("UPDATE product SET quantity = quantity + ? WHERE product_id = ?", [qta, product_id], (err, results_status) => {
            //   if (err) {
            //     res.status(500).send(err);
            //   }
            // });
            return res.status(200).send("บันทึกการคืนของและอัปเดตสถานะเรียบร้อยแล้ว");
          });
        }
      );
    });
    
  });
});


// ✅ ส่วนเสริมใหม่ใน server.js (Backend) สำหรับ "บันทึกการซ่อม"
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
    [request_id, member_id, quantity, cost, description, repaired_by, completed_date],
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
  const {
    status_name,
    actual_finish_date,
    cost,
    assigned_to,
  } = req.body;

  const sql = `
    UPDATE maintenance_record
    SET status_name = ?,
        actual_finish_date = ?,
        cost = ?,
        assigned_to = ?
    WHERE record_id = ?
  `;

  db.query(sql, [status_name, actual_finish_date, cost, assigned_to, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "อัปเดตสถานะซ่อมสำเร็จ" });
  });
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
