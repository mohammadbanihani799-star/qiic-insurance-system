const { query } = require('../config/database');

class Claim {
  // Generate claim number
  static async generateClaimNumber() {
    const sql = 'CALL generate_claim_number(@claim_number)';
    await query(sql);
    
    const result = await query('SELECT @claim_number as claim_number');
    return result[0].claim_number;
  }

  // Create new claim
  static async create(claimData) {
    const { 
      policyId, 
      customerId, 
      type, 
      description, 
      amount, 
      incidentDate,
      status = 'pending' 
    } = claimData;
    
    // Generate claim number
    const claimNumber = await this.generateClaimNumber();
    
    const sql = `
      INSERT INTO claims 
      (policy_id, customer_id, claim_number, type, description, amount, status, incident_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
      policyId,
      customerId,
      claimNumber,
      type,
      description,
      amount,
      status,
      incidentDate
    ]);
    
    return {
      id: result.insertId,
      policyId,
      customerId,
      claimNumber,
      type,
      description,
      amount,
      status,
      incidentDate,
      submittedDate: new Date()
    };
  }

  // Find claim by ID
  static async findById(id) {
    const sql = 'SELECT * FROM claims WHERE id = ?';
    const rows = await query(sql, [id]);
    
    if (rows.length === 0) return null;
    
    return this.mapRow(rows[0]);
  }

  // Find claim by claim number
  static async findByClaimNumber(claimNumber) {
    const sql = 'SELECT * FROM claims WHERE claim_number = ?';
    const rows = await query(sql, [claimNumber]);
    
    if (rows.length === 0) return null;
    
    return this.mapRow(rows[0]);
  }

  // Get all claims for a customer
  static async findByCustomerId(customerId) {
    const sql = `
      SELECT c.*, p.policy_number, p.type as policy_type
      FROM claims c
      JOIN policies p ON c.policy_id = p.id
      WHERE c.customer_id = ?
      ORDER BY c.submitted_date DESC
    `;
    
    const rows = await query(sql, [customerId]);
    
    return rows.map(row => ({
      ...this.mapRow(row),
      policy: {
        policyNumber: row.policy_number,
        type: row.policy_type
      }
    }));
  }

  // Get all claims for a policy
  static async findByPolicyId(policyId) {
    const sql = `
      SELECT c.*, cu.name as customer_name
      FROM claims c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE c.policy_id = ?
      ORDER BY c.submitted_date DESC
    `;
    
    const rows = await query(sql, [policyId]);
    
    return rows.map(row => ({
      ...this.mapRow(row),
      customerName: row.customer_name
    }));
  }

  // Get all claims with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClauses = [];
    let params = [];
    
    if (filters.status) {
      whereClauses.push('c.status = ?');
      params.push(filters.status);
    }
    
    if (filters.type) {
      whereClauses.push('c.type = ?');
      params.push(filters.type);
    }
    
    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
    
    const sql = `
      SELECT c.*, 
             cu.name as customer_name, cu.email as customer_email,
             p.policy_number, p.type as policy_type
      FROM claims c
      JOIN customers cu ON c.customer_id = cu.id
      JOIN policies p ON c.policy_id = p.id
      ${whereClause}
      ORDER BY c.submitted_date DESC 
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);
    const rows = await query(sql, params);
    
    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM claims c ${whereClause}`;
    const countResult = await query(countSql, whereClauses.length > 0 ? params.slice(0, -2) : []);
    const total = countResult[0].total;
    
    return {
      claims: rows.map(row => ({
        ...this.mapRow(row),
        customer: {
          name: row.customer_name,
          email: row.customer_email
        },
        policy: {
          policyNumber: row.policy_number,
          type: row.policy_type
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

  // Update claim status
  static async updateStatus(id, status, notes = null) {
    const fields = ['status = ?'];
    const values = [status];
    
    if (status === 'approved' || status === 'rejected') {
      fields.push('resolved_date = NOW()');
    }
    
    if (notes) {
      fields.push('notes = ?');
      values.push(notes);
    }
    
    values.push(id);
    
    const sql = `UPDATE claims SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    
    return this.findById(id);
  }

  // Approve claim
  static async approve(id, notes = null) {
    return this.updateStatus(id, 'approved', notes);
  }

  // Reject claim
  static async reject(id, notes = null) {
    return this.updateStatus(id, 'rejected', notes);
  }

  // Update claim amount
  static async updateAmount(id, amount) {
    const sql = 'UPDATE claims SET amount = ? WHERE id = ?';
    await query(sql, [amount, id]);
    
    return this.findById(id);
  }

  // Get claim with full details
  static async findWithDetails(id) {
    const sql = `
      SELECT c.*, 
             cu.name as customer_name, cu.email as customer_email, 
             cu.phone as customer_phone,
             p.policy_number, p.type as policy_type,
             v.plate_number, v.make, v.model, v.year
      FROM claims c
      JOIN customers cu ON c.customer_id = cu.id
      JOIN policies p ON c.policy_id = p.id
      JOIN vehicles v ON p.vehicle_id = v.id
      WHERE c.id = ?
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
        phone: row.customer_phone
      },
      policy: {
        id: row.policy_id,
        policyNumber: row.policy_number,
        type: row.policy_type
      },
      vehicle: {
        plateNumber: row.plate_number,
        make: row.make,
        model: row.model,
        year: row.year
      }
    };
  }

  // Get claims summary view
  static async getSummary() {
    const sql = 'SELECT * FROM claims_summary_view ORDER BY submitted_date DESC LIMIT 100';
    const rows = await query(sql);
    
    return rows.map(row => ({
      id: row.id,
      claimNumber: row.claim_number,
      customerName: row.customer_name,
      policyNumber: row.policy_number,
      type: row.type,
      amount: parseFloat(row.amount),
      status: row.status,
      incidentDate: row.incident_date,
      submittedDate: row.submitted_date
    }));
  }

  // Get statistics
  static async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_claims,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_claims,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_claims,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_claims,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_claims,
        SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as total_approved_amount,
        AVG(CASE WHEN status = 'approved' THEN amount ELSE NULL END) as avg_approved_amount
      FROM claims
    `;
    
    const result = await query(sql);
    
    return {
      totalClaims: result[0].total_claims,
      pendingClaims: result[0].pending_claims,
      processingClaims: result[0].processing_claims,
      approvedClaims: result[0].approved_claims,
      rejectedClaims: result[0].rejected_claims,
      totalApprovedAmount: parseFloat(result[0].total_approved_amount) || 0,
      avgApprovedAmount: parseFloat(result[0].avg_approved_amount) || 0
    };
  }

  // Map database row to claim object
  static mapRow(row) {
    return {
      id: row.id,
      policyId: row.policy_id,
      customerId: row.customer_id,
      claimNumber: row.claim_number,
      type: row.type,
      description: row.description,
      amount: row.amount ? parseFloat(row.amount) : null,
      status: row.status,
      incidentDate: row.incident_date,
      submittedDate: row.submitted_date,
      resolvedDate: row.resolved_date,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = Claim;
