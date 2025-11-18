const { query, transaction } = require('../config/database');

class Policy {
  // Generate policy number
  static async generatePolicyNumber() {
    const sql = 'CALL generate_policy_number(@policy_number)';
    await query(sql);
    
    const result = await query('SELECT @policy_number as policy_number');
    return result[0].policy_number;
  }

  // Create new policy
  static async create(policyData) {
    const { customerId, vehicleId, type, premium, startDate, endDate, status = 'active' } = policyData;
    
    // Generate policy number
    const policyNumber = await this.generatePolicyNumber();
    
    // Calculate coins based on type
    const coinsEarned = type === 'comprehensive' ? 100 : 50;
    
    return transaction(async (connection) => {
      // Insert policy
      const policySql = `
        INSERT INTO policies 
        (customer_id, vehicle_id, policy_number, type, premium, start_date, end_date, status, coins_earned)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [policyResult] = await connection.execute(policySql, [
        customerId,
        vehicleId,
        policyNumber,
        type,
        premium,
        startDate,
        endDate,
        status,
        coinsEarned
      ]);
      
      // Add coins transaction
      const coinsSql = `
        INSERT INTO coins_transactions 
        (customer_id, policy_id, amount, type, description, balance_after)
        SELECT ?, ?, ?, 'earned', ?, COALESCE(SUM(CASE WHEN type = 'earned' THEN amount ELSE -amount END), 0) + ?
        FROM coins_transactions
        WHERE customer_id = ?
      `;
      
      await connection.execute(coinsSql, [
        customerId,
        policyResult.insertId,
        coinsEarned,
        type === 'comprehensive' ? 'مكافأة شراء وثيقة تأمين شامل' : 'مكافأة شراء وثيقة تأمين ضد الغير',
        coinsEarned,
        customerId
      ]);
      
      return {
        id: policyResult.insertId,
        policyNumber,
        customerId,
        vehicleId,
        type,
        premium,
        startDate,
        endDate,
        status,
        coinsEarned,
        createdAt: new Date()
      };
    });
  }

  // Find policy by ID
  static async findById(id) {
    const sql = 'SELECT * FROM policies WHERE id = ?';
    const rows = await query(sql, [id]);
    
    if (rows.length === 0) return null;
    
    return this.mapRow(rows[0]);
  }

  // Find policy by policy number
  static async findByPolicyNumber(policyNumber) {
    const sql = 'SELECT * FROM policies WHERE policy_number = ?';
    const rows = await query(sql, [policyNumber]);
    
    if (rows.length === 0) return null;
    
    return this.mapRow(rows[0]);
  }

  // Get all policies for a customer
  static async findByCustomerId(customerId) {
    const sql = `
      SELECT p.*, v.plate_number, v.make, v.model, v.year
      FROM policies p
      JOIN vehicles v ON p.vehicle_id = v.id
      WHERE p.customer_id = ?
      ORDER BY p.created_at DESC
    `;
    
    const rows = await query(sql, [customerId]);
    
    return rows.map(row => ({
      ...this.mapRow(row),
      vehicle: {
        plateNumber: row.plate_number,
        make: row.make,
        model: row.model,
        year: row.year
      }
    }));
  }

  // Get all active policies
  static async findActive() {
    const sql = 'SELECT * FROM active_policies_view ORDER BY start_date DESC';
    const rows = await query(sql);
    
    return rows.map(row => ({
      id: row.id,
      policyNumber: row.policy_number,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      plateNumber: row.plate_number,
      vehicleInfo: row.vehicle_info,
      type: row.type,
      premium: parseFloat(row.premium),
      startDate: row.start_date,
      endDate: row.end_date,
      coinsEarned: row.coins_earned,
      status: row.status
    }));
  }

  // Get all policies with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClauses = [];
    let params = [];
    
    if (filters.status) {
      whereClauses.push('p.status = ?');
      params.push(filters.status);
    }
    
    if (filters.type) {
      whereClauses.push('p.type = ?');
      params.push(filters.type);
    }
    
    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
    
    const sql = `
      SELECT p.*, c.name as customer_name, c.email as customer_email,
             v.plate_number, v.make, v.model, v.year
      FROM policies p
      JOIN customers c ON p.customer_id = c.id
      JOIN vehicles v ON p.vehicle_id = v.id
      ${whereClause}
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);
    const rows = await query(sql, params);
    
    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM policies p ${whereClause}`;
    const countResult = await query(countSql, whereClauses.length > 0 ? params.slice(0, -2) : []);
    const total = countResult[0].total;
    
    return {
      policies: rows.map(row => ({
        ...this.mapRow(row),
        customer: {
          name: row.customer_name,
          email: row.customer_email
        },
        vehicle: {
          plateNumber: row.plate_number,
          make: row.make,
          model: row.model,
          year: row.year
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

  // Update policy status
  static async updateStatus(id, status) {
    const sql = 'UPDATE policies SET status = ? WHERE id = ?';
    await query(sql, [status, id]);
    
    return this.findById(id);
  }

  // Cancel policy
  static async cancel(id) {
    return this.updateStatus(id, 'cancelled');
  }

  // Check for expiring policies
  static async findExpiring(daysAhead = 30) {
    const sql = `
      SELECT p.*, c.name as customer_name, c.email as customer_email, c.phone
      FROM policies p
      JOIN customers c ON p.customer_id = c.id
      WHERE p.status = 'active'
        AND p.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY p.end_date ASC
    `;
    
    const rows = await query(sql, [daysAhead]);
    
    return rows.map(row => ({
      ...this.mapRow(row),
      customer: {
        name: row.customer_name,
        email: row.customer_email,
        phone: row.phone
      }
    }));
  }

  // Get policy with full details
  static async findWithDetails(id) {
    const sql = `
      SELECT p.*, 
             c.name as customer_name, c.email as customer_email, 
             c.phone as customer_phone, c.qatar_id,
             v.plate_number, v.make, v.model, v.year, 
             v.chassis_number, v.engine_number
      FROM policies p
      JOIN customers c ON p.customer_id = c.id
      JOIN vehicles v ON p.vehicle_id = v.id
      WHERE p.id = ?
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
      },
      vehicle: {
        id: row.vehicle_id,
        plateNumber: row.plate_number,
        make: row.make,
        model: row.model,
        year: row.year,
        chassisNumber: row.chassis_number,
        engineNumber: row.engine_number
      }
    };
  }

  // Map database row to policy object
  static mapRow(row) {
    return {
      id: row.id,
      customerId: row.customer_id,
      vehicleId: row.vehicle_id,
      policyNumber: row.policy_number,
      type: row.type,
      premium: parseFloat(row.premium),
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      coinsEarned: row.coins_earned,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = Policy;
