// src/server/routes.js
const express = require("express");
const router = express.Router();
const pool = require("./db");
const { parse } = require('date-fns');

// Store company data
router.post("/companies", async (req, res) => {
  const {
    companyName,
    customerName,
    address,
    state,
    stateCode,
    contact,
    email,
    gstNo,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO companies (company_name, customer_name, address, state, state_code, contact, email, gst_no)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        companyName,
        customerName,
        address,
        state,
        stateCode === "" ? null : Number(stateCode),
        contact === "" ? null : contact,
        email,
        gstNo === "" ? null : gstNo
      ]
    );    
    res.status(200).json({ message: "Company added successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to insert company data" });
  }
});

// Fetch company data
router.get("/companies", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM companies ORDER BY id ASC");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch company data" });
    }
  });

  // Store Order data
  router.post("/orders", async (req, res) => {
    const client = await pool.connect();
  
    // 🔧 Helper function to handle numeric conversion
    const safeNum = (value) => {
      return value === "" || value === null || value === undefined
        ? null
        : Number(value);
    };
  
    try {
      const {
        invoiceNo, invoiceDate, invoiceMonth,
        companyName, customerName, jobWorkSupplier, date,
        transport, transportPrice, finalTotal, grandTotal,
        salesAmount, gst, cgst, sgst, igst,
        paymentStatus, amountPaid,
        paymentType, bankName, checkNo, transactionId,
        products
      } = req.body;
  
      await client.query("BEGIN");
  
      // 🧾 Insert order and get the generated ID
      const orderResult = await client.query(
        `INSERT INTO orders (
          invoice_no, invoice_date, invoice_month,
          company_name, customer_name, job_work_supplier, date,
          transport, transport_price, final_total, grand_total,
          sales_amount, gst, cgst, sgst, igst,
          payment_status, amount_paid,
          payment_type, bank_name, check_no, transaction_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
                  $12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
        RETURNING id`,
        [
          invoiceNo, invoiceDate, invoiceMonth,
          companyName, customerName, jobWorkSupplier, date,
          transport, safeNum(transportPrice), safeNum(finalTotal), safeNum(grandTotal),
          safeNum(salesAmount), gst, safeNum(cgst), safeNum(sgst), safeNum(igst),
          paymentStatus, safeNum(amountPaid),
          paymentType, bankName, checkNo, transactionId
        ]
      );
  
      const orderId = orderResult.rows[0].id;
  
      // 🧾 Insert each product linked to the order
      for (const p of products) {
        await client.query(
          `INSERT INTO order_products (
            order_id, product_details, quantity, unit, price, total
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            orderId,
            p.productDetails,
            safeNum(p.quantity),
            p.unit,
            safeNum(p.price),
            safeNum(p.total)
          ]
        );
      }
  
      await client.query("COMMIT");
      res.status(200).json({ message: "Order added successfully!" });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Failed to insert order:", err);
      res.status(500).json({ message: "Failed to insert order" });
    } finally {
      client.release();
    }
  });  

  // Fetch Order Data
  router.get("/orders", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          o.*, 
          json_agg(
            json_build_object(
              'productDetails', p.product_details,
              'quantity', p.quantity,
              'unit', p.unit,
              'price', p.price,
              'total', p.total
            )
          ) AS products
        FROM orders o
        LEFT JOIN order_products p ON o.id = p.order_id
        GROUP BY o.id
        ORDER BY o.id ASC
      `);
      res.json(result.rows);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Fetch Order Data for particular Company
  router.get("/orders/company/:companyName", async (req, res) => {
    const { companyName } = req.params;
  
    try {
      const result = await pool.query(
        `
        SELECT 
          o.*, 
          json_agg(
            json_build_object(
              'productDetails', p.product_details,
              'quantity', p.quantity,
              'unit', p.unit,
              'price', p.price,
              'total', p.total
            )
          ) AS products
        FROM orders o
        LEFT JOIN order_products p ON o.id = p.order_id
        WHERE o.company_name = $1
        GROUP BY o.id
        ORDER BY o.id ASC
        `,
        [companyName]
      );
  
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching orders by company:", err);
      res.status(500).json({ message: "Failed to fetch orders for company" });
    }
  });

  // Update order and products
router.put("/orders/:id", async (req, res) => {
  const safeNum = (v) => v === "" || v === undefined || v === null ? null : Number(v);
  const client = await pool.connect();
  try {
    const orderId = req.params.id;
    const {
      invoice_date, payment_status, amount_paid,
      payment_type, bank_name, check_no, transaction_id,
      transport, transport_price, final_total, grand_total,
      sales_amount, gst, cgst, sgst, igst, products
    } = req.body;

    await client.query("BEGIN");

    // Update orders table
    await client.query(
      `UPDATE orders SET 
        invoice_date = $1,
        payment_status = $2,
        amount_paid = $3,
        payment_type = $4,
        bank_name = $5,
        check_no = $6,
        transaction_id = $7,
        transport = $8,
        transport_price = $9,
        final_total = $10,
        grand_total = $11,
        sales_amount = $12,
        gst = $13,
        cgst = $14,
        sgst = $15,
        igst = $16
      WHERE id = $17`,
      [
        invoice_date,
        payment_status,
        safeNum(amount_paid),
        payment_type,
        bank_name,
        check_no,
        transaction_id,
        transport,
        safeNum(transport_price),
        safeNum(final_total),
        safeNum(grand_total),
        safeNum(sales_amount),
        gst,
        safeNum(cgst),
        safeNum(sgst),
        safeNum(igst),
        orderId
      ]
    );

    // Delete old product rows
    await client.query("DELETE FROM order_products WHERE order_id = $1", [orderId]);

    // Re-insert updated products
    for (const p of products) {
      await client.query(
        `INSERT INTO order_products (order_id, product_details, quantity, unit, price, total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
         [
          orderId,
          p.productDetails,
          safeNum(p.quantity),
          p.unit,
          safeNum(p.price),
          safeNum(p.total)
        ]
      );
    }

    await client.query("COMMIT");
    res.status(200).json({ message: "Order updated successfully!" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update Error:", err);
    res.status(500).json({ message: "Failed to update order" });
  } finally {
    client.release();
  }
});

// Delete an order and its products
router.delete("/orders/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const orderId = req.params.id;

    await client.query("BEGIN");

    await client.query("DELETE FROM order_products WHERE order_id = $1", [orderId]);
    await client.query("DELETE FROM orders WHERE id = $1", [orderId]);

    await client.query("COMMIT");

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Failed to delete order" });
  } finally {
    client.release();
  }
});

// Store Purchasae Data
router.post("/purchases", async (req, res) => {
  const client = await pool.connect();
  const sanitizeNumeric = (val) => {
    return val === "" || val === undefined || val === null ? null : Number(val);
  };
  const sanitizeDate = (val) => {
    return !val || val === "" ? null : val;
  };  
  try {
    const {
      companyName, state, stateCode, typeOfPurchase, productCode, productName,
      invoiceNo, invoiceMonth, invoiceDate, discount, transport, lrNo, transporter,
      transportCharge, gst, cgst, sgst, igst, tcs, freight, finalTotal, grandTotal,
      salesAmount, grossAmount, paymentStatus, amountPaid, paymentType, bankName,
      checkNo, transactionId, dateOfPayment, products
    } = req.body;

    const sanitizedValues = [
      companyName,
      state,
      stateCode,
      typeOfPurchase,
      productCode,
      productName,
      invoiceNo,
      invoiceMonth,
      invoiceDate,
      sanitizeNumeric(discount),
      transport,
      lrNo,
      transporter,
      sanitizeNumeric(transportCharge),
      gst,
      sanitizeNumeric(cgst),
      sanitizeNumeric(sgst),
      sanitizeNumeric(igst),
      sanitizeNumeric(tcs),
      sanitizeNumeric(freight),
      sanitizeNumeric(finalTotal),
      sanitizeNumeric(grandTotal),
      sanitizeNumeric(salesAmount),
      sanitizeNumeric(grossAmount),
      paymentStatus,
      sanitizeNumeric(amountPaid),
      paymentType,
      bankName,
      checkNo,
      transactionId,
      sanitizeDate(dateOfPayment),
      new Date()
    ];

    await client.query("BEGIN");

    const result = await client.query(`
      INSERT INTO purchases (
        company_name, state, state_code, type_of_purchase, product_code, product_name,
        invoice_no, invoice_month, invoice_date, discount, transport, lr_no, transporter,
        transport_charge, gst, cgst, sgst, igst, tcs, freight, final_total, grand_total,
        sales_amount, gross_amount, payment_status, amount_paid, payment_type, bank_name,
        check_no, transaction_id, date_of_payment, created_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
        $14,$15,$16,$17,$18,$19,$20,$21,$22,
        $23,$24,$25,$26,$27,$28,
        $29,$30,$31,$32
      )
      RETURNING id
    `, sanitizedValues);    

    const purchaseId = result.rows[0].id;

    for (const product of products) {
      await client.query(`
        INSERT INTO purchase_products (
          purchase_id, product_name, product_code, hsn_no, product_description,
          quantity, price, total, unit
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `, [
        purchaseId, product.productName, product.productCode, product.hsnNo,
        product.productDescription, product.quantity, product.price, product.total, product.unit
      ]);
    }

    await client.query("COMMIT");
    res.status(200).json({ message: "Purchase saved successfully!" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed to save purchase:", err);
    res.status(500).json({ message: "Failed to save purchase" });
  } finally {
    client.release();
  }
});

// Fetch Purchase Details
router.get("/purchases", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        TO_CHAR(p.invoice_date, 'DD-MM-YYYY') AS invoice_date,
        TO_CHAR(p.date_of_payment, 'DD-MM-YYYY') AS date_of_payment,
        TO_CHAR(p.created_at, 'DD-MM-YYYY') AS created_at,
        json_agg(
          json_build_object(
            'productName', pp.product_name,
            'productCode', pp.product_code,
            'hsnNo', pp.hsn_no,
            'productDescription', pp.product_description,
            'quantity', pp.quantity,
            'price', pp.price,
            'total', pp.total,
            'unit', pp.unit
          )
        ) AS products
      FROM purchases p
      LEFT JOIN purchase_products pp ON p.id = pp.purchase_id
      GROUP BY p.id
      ORDER BY p.id ASC;
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching purchases:", err);
    res.status(500).json({ message: "Failed to fetch purchases" });
  }
});

// Update Purchase Details
router.put("/purchases/:id", async (req, res) => {
  const client = await pool.connect();
  const safeNum = (val) => (val === "" || val === undefined || val === null ? null : Number(val));
  const safeStr = (val) => (val === undefined || val === null ? "" : val);

  try {
    const purchaseId = req.params.id;
    const {
      companyName, state, stateCode, typeOfPurchase, productCode, productName,
      invoiceNo, invoiceMonth, invoiceDate, discount, transport, lrNo, transporter,
      transportCharge, gst, cgst, sgst, igst, tcs, freight, finalTotal, grandTotal,
      salesAmount, grossAmount, paymentStatus, amountPaid, paymentType, bankName,
      checkNo, transactionId, dateOfPayment, products
    } = req.body;

    await client.query("BEGIN");

    // Update purchases table
    await client.query(`
      UPDATE purchases SET
        company_name = $1, state = $2, state_code = $3, type_of_purchase = $4,
        product_code = $5, product_name = $6, invoice_no = $7, invoice_month = $8,
        invoice_date = $9, discount = $10, transport = $11, lr_no = $12, transporter = $13,
        transport_charge = $14, gst = $15, cgst = $16, sgst = $17, igst = $18,
        tcs = $19, freight = $20, final_total = $21, grand_total = $22,
        sales_amount = $23, gross_amount = $24, payment_status = $25,
        amount_paid = $26, payment_type = $27, bank_name = $28,
        check_no = $29, transaction_id = $30, date_of_payment = $31
      WHERE id = $32
    `, [
      companyName, state, stateCode, typeOfPurchase, productCode, productName,
      invoiceNo, invoiceMonth, invoiceDate, safeNum(discount), transport, lrNo, transporter,
      safeNum(transportCharge), gst, safeNum(cgst), safeNum(sgst), safeNum(igst),
      safeNum(tcs), safeNum(freight), safeNum(finalTotal), safeNum(grandTotal),
      safeNum(salesAmount), safeNum(grossAmount), paymentStatus, safeNum(amountPaid),
      paymentType, bankName, checkNo, transactionId, dateOfPayment, purchaseId
    ]);

    // Delete existing products
    await client.query("DELETE FROM purchase_products WHERE purchase_id = $1", [purchaseId]);

    // Insert updated products
    for (const p of products) {
      await client.query(`
        INSERT INTO purchase_products (
          purchase_id, product_name, product_code, hsn_no, product_description,
          quantity, price, total, unit
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `, [
        purchaseId, p.productName, p.productCode, p.hsnNo,
        p.productDescription, p.quantity, p.price, p.total, p.unit
      ]);
    }

    await client.query("COMMIT");
    res.status(200).json({ message: "Purchase updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating purchase:", err);
    res.status(500).json({ message: "Failed to update purchase" });
  } finally {
    client.release();
  }
});

module.exports = router;
