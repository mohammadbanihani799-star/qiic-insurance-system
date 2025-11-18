const { query } = require('../config/database');

class Vehicle {
  // Create new vehicle
  static async create(vehicleData) {
    const { customerId, plateNumber, make, model, year, chassisNumber, engineNumber } = vehicleData;
    
    const sql = `
      INSERT INTO vehicles (customer_id, plate_number, make, model, year, chassis_number, engine_number)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
      customerId,
      plateNumber,
      make,
      model,
      year,
      chassisNumber,
      engineNumber
    ]);
    
    return {
      id: result.insertId,
      customerId,
      plateNumber,
      make,
      model,
      year,
      chassisNumber,
      engineNumber,
      createdAt: new Date()
    };
  }

  // Find vehicle by ID
  static async findById(id) {
    const sql = 'SELECT * FROM vehicles WHERE id = ?';
    const rows = await query(sql, [id]);
    
    if (rows.length === 0) return null;
    
    return this.mapRow(rows[0]);
  }

  // Find vehicle by plate number
  static async findByPlateNumber(plateNumber) {
    const sql = 'SELECT * FROM vehicles WHERE plate_number = ?';
    const rows = await query(sql, [plateNumber]);
    
    if (rows.length === 0) return null;
    
    return this.mapRow(rows[0]);
  }

  // Find vehicle by chassis number
  static async findByChassisNumber(chassisNumber) {
    const sql = 'SELECT * FROM vehicles WHERE chassis_number = ?';
    const rows = await query(sql, [chassisNumber]);
    
    if (rows.length === 0) return null;
    
    return this.mapRow(rows[0]);
  }

  // Get all vehicles for a customer
  static async findByCustomerId(customerId) {
    const sql = 'SELECT * FROM vehicles WHERE customer_id = ? ORDER BY created_at DESC';
    const rows = await query(sql, [customerId]);
    
    return rows.map(row => this.mapRow(row));
  }

  // Get all vehicles with pagination
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT v.*, c.name as customer_name, c.email as customer_email
      FROM vehicles v
      JOIN customers c ON v.customer_id = c.id
      ORDER BY v.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const rows = await query(sql, [limit, offset]);
    
    // Get total count
    const countSql = 'SELECT COUNT(*) as total FROM vehicles';
    const countResult = await query(countSql);
    const total = countResult[0].total;
    
    return {
      vehicles: rows.map(row => ({
        ...this.mapRow(row),
        customer: {
          name: row.customer_name,
          email: row.customer_email
        }
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Update vehicle
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    if (updateData.plateNumber) {
      fields.push('plate_number = ?');
      values.push(updateData.plateNumber);
    }
    if (updateData.make) {
      fields.push('make = ?');
      values.push(updateData.make);
    }
    if (updateData.model) {
      fields.push('model = ?');
      values.push(updateData.model);
    }
    if (updateData.year) {
      fields.push('year = ?');
      values.push(updateData.year);
    }
    if (updateData.engineNumber) {
      fields.push('engine_number = ?');
      values.push(updateData.engineNumber);
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(id);
    
    const sql = `UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    
    return this.findById(id);
  }

  // Delete vehicle
  static async delete(id) {
    const sql = 'DELETE FROM vehicles WHERE id = ?';
    const result = await query(sql, [id]);
    
    return result.affectedRows > 0;
  }

  // Get vehicle with customer details
  static async findWithCustomer(id) {
    const sql = `
      SELECT v.*, c.name as customer_name, c.email as customer_email, 
             c.phone as customer_phone, c.qatar_id
      FROM vehicles v
      JOIN customers c ON v.customer_id = c.id
      WHERE v.id = ?
    `;
    
    const rows = await query(sql, [id]);
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    
    return {
      ...this.mapRow(row),
      customer: {
        id: row.customer_id,
        name: row.customer_name,
        email: row.customer_email,
        phone: row.customer_phone,
        qatarId: row.qatar_id
      }
    };
  }

  // Search vehicles
  static async search(searchTerm) {
    const sql = `
      SELECT v.*, c.name as customer_name
      FROM vehicles v
      JOIN customers c ON v.customer_id = c.id
      WHERE v.plate_number LIKE ? 
         OR v.make LIKE ? 
         OR v.model LIKE ? 
         OR v.chassis_number LIKE ?
         OR c.name LIKE ?
      ORDER BY v.created_at DESC
      LIMIT 50
    `;
    
    const term = `%${searchTerm}%`;
    const rows = await query(sql, [term, term, term, term, term]);
    
    return rows.map(row => ({
      ...this.mapRow(row),
      customerName: row.customer_name
    }));
  }

  // Map database row to vehicle object
  static mapRow(row) {
    return {
      id: row.id,
      customerId: row.customer_id,
      plateNumber: row.plate_number,
      make: row.make,
      model: row.model,
      year: row.year,
      chassisNumber: row.chassis_number,
      engineNumber: row.engine_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = Vehicle;
