const { query, transaction } = require('../config/database');

class Customer {
  // Create new customer
  static async create(customerData) {
    const { name, email, phone, qatarId, address } = customerData;
    
    const sql = `
      INSERT INTO customers (name, email, phone, qatar_id, address)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [name, email, phone, qatarId, address]);
    
    return {
      id: result.insertId,
      name,
      email,
      phone,
      qatarId,
      address,
      createdAt: new Date()
    };
  }

  // Find customer by ID
  static async findById(id) {
    const sql = 'SELECT * FROM customers WHERE id = ?';
    const rows = await query(sql, [id]);
    
    if (rows.length === 0) return null;
    
    return this.mapRow(rows[0]);
  }

  // Find customer by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM customers WHERE email = ?';
    const rows = await query(sql, [email]);
    
    if (rows.length === 0) return null;
    
    return this.mapRow(rows[0]);
  }

  // Find customer by phone
  static async findByPhone(phone) {
    const sql = 'SELECT * FROM customers WHERE phone = ?';
    const rows = await query(sql, [phone]);
    
    if (rows.length === 0) return null;
    
    return this.mapRow(rows[0]);
  }

  // Find customer by Qatar ID
  static async findByQatarId(qatarId) {
    const sql = 'SELECT * FROM customers WHERE qatar_id = ?';
    const rows = await query(sql, [qatarId]);
    
    if (rows.length === 0) return null;
    
    return this.mapRow(rows[0]);
  }

  // Get all customers with pagination
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT * FROM customers 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const rows = await query(sql, [limit, offset]);
    
    // Get total count
    const countSql = 'SELECT COUNT(*) as total FROM customers';
    const countResult = await query(countSql);
    const total = countResult[0].total;
    
    return {
      customers: rows.map(row => this.mapRow(row)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Update customer
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    if (updateData.name) {
      fields.push('name = ?');
      values.push(updateData.name);
    }
    if (updateData.email) {
      fields.push('email = ?');
      values.push(updateData.email);
    }
    if (updateData.phone) {
      fields.push('phone = ?');
      values.push(updateData.phone);
    }
    if (updateData.address) {
      fields.push('address = ?');
      values.push(updateData.address);
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(id);
    
    const sql = `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    
    return this.findById(id);
  }

  // Delete customer
  static async delete(id) {
    const sql = 'DELETE FROM customers WHERE id = ?';
    const result = await query(sql, [id]);
    
    return result.affectedRows > 0;
  }

  // Get customer with their vehicles
  static async findWithVehicles(id) {
    const customer = await this.findById(id);
    if (!customer) return null;
    
    const vehiclesSql = 'SELECT * FROM vehicles WHERE customer_id = ?';
    const vehicles = await query(vehiclesSql, [id]);
    
    return {
      ...customer,
      vehicles
    };
  }

  // Get customer with their policies
  static async findWithPolicies(id) {
    const customer = await this.findById(id);
    if (!customer) return null;
    
    const policiesSql = `
      SELECT p.*, v.plate_number, v.make, v.model, v.year
      FROM policies p
      JOIN vehicles v ON p.vehicle_id = v.id
      WHERE p.customer_id = ?
      ORDER BY p.created_at DESC
    `;
    const policies = await query(policiesSql, [id]);
    
    return {
      ...customer,
      policies
    };
  }

  // Search customers
  static async search(searchTerm) {
    const sql = `
      SELECT * FROM customers 
      WHERE name LIKE ? 
         OR email LIKE ? 
         OR phone LIKE ? 
         OR qatar_id LIKE ?
      ORDER BY created_at DESC
      LIMIT 50
    `;
    
    const term = `%${searchTerm}%`;
    const rows = await query(sql, [term, term, term, term]);
    
    return rows.map(row => this.mapRow(row));
  }

  // Map database row to customer object
  static mapRow(row) {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      qatarId: row.qatar_id,
      address: row.address,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = Customer;
