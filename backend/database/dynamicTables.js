// dynamicTables.js - Dynamic Table Management for Each Visitor
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'u262632985_qic',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Create a new table for a visitor
 * @param {string} ipAddress - Visitor's IP address
 * @returns {Promise<{success: boolean, tableName: string}>}
 */
async function createVisitorTable(ipAddress) {
  try {
    const [result] = await pool.query(
      'CALL CreateVisitorTable(?, @tableName, @success)',
      [ipAddress]
    );
    
    const [output] = await pool.query('SELECT @tableName AS tableName, @success AS success');
    
    console.log(`✅ Created/Updated table for IP: ${ipAddress} → ${output[0].tableName}`);
    
    return {
      success: output[0].success === 1,
      tableName: output[0].tableName
    };
  } catch (error) {
    console.error('❌ Error creating visitor table:', error);
    throw error;
  }
}

/**
 * Insert data into visitor's table
 * @param {string} ipAddress - Visitor's IP
 * @param {string} dataType - Type of data (car_details, payment, etc.)
 * @param {object} dataJson - The actual data object
 * @param {string} pageName - Page where data was submitted
 * @param {number} stepNumber - Step in journey
 * @returns {Promise<boolean>}
 */
async function insertVisitorData(ipAddress, dataType, dataJson, pageName, stepNumber = 0) {
  try {
    // Convert object to JSON string
    const jsonString = typeof dataJson === 'string' ? dataJson : JSON.stringify(dataJson);
    
    const [result] = await pool.query(
      'CALL InsertVisitorData(?, ?, ?, ?, ?, @success)',
      [ipAddress, dataType, jsonString, pageName, stepNumber]
    );
    
    const [output] = await pool.query('SELECT @success AS success');
    
    console.log(`✅ Inserted ${dataType} data for IP: ${ipAddress}`);
    
    return output[0].success === 1;
  } catch (error) {
    console.error('❌ Error inserting visitor data:', error);
    throw error;
  }
}

/**
 * Get all data for a specific visitor
 * @param {string} ipAddress - Visitor's IP
 * @returns {Promise<Array>}
 */
async function getVisitorData(ipAddress) {
  try {
    const [rows] = await pool.query('CALL GetVisitorData(?)', [ipAddress]);
    
    // Parse JSON data
    const data = rows[0].map(row => ({
      ...row,
      data_json: typeof row.data_json === 'string' ? JSON.parse(row.data_json) : row.data_json
    }));
    
    console.log(`📊 Retrieved ${data.length} records for IP: ${ipAddress}`);
    
    return data;
  } catch (error) {
    console.error('❌ Error getting visitor data:', error);
    throw error;
  }
}

/**
 * Get all visitors (for admin dashboard)
 * @returns {Promise<Array>}
 */
async function getAllVisitors() {
  try {
    const [rows] = await pool.query('CALL GetAllVisitors()');
    
    console.log(`📊 Retrieved ${rows[0].length} visitors`);
    
    return rows[0];
  } catch (error) {
    console.error('❌ Error getting all visitors:', error);
    throw error;
  }
}

/**
 * Get all data for all visitors (admin view)
 * @returns {Promise<Array>}
 */
async function getAllVisitorsData() {
  try {
    const visitors = await getAllVisitors();
    
    const allData = await Promise.all(
      visitors.map(async (visitor) => {
        try {
          const data = await getVisitorData(visitor.ip_address);
          return {
            ip: visitor.ip_address,
            tableName: visitor.table_name,
            isActive: visitor.is_active === 1,
            currentPage: visitor.current_page,
            socketId: visitor.socket_id,
            firstSeen: visitor.created_at,
            lastActivity: visitor.last_activity,
            secondsSinceLastActivity: visitor.seconds_since_last_activity,
            data: data
          };
        } catch (err) {
          console.error(`❌ Error getting data for ${visitor.ip_address}:`, err);
          return {
            ip: visitor.ip_address,
            error: 'Failed to load data'
          };
        }
      })
    );
    
    console.log(`📊 Retrieved complete data for ${allData.length} visitors`);
    
    return allData;
  } catch (error) {
    console.error('❌ Error getting all visitors data:', error);
    throw error;
  }
}

/**
 * Update visitor status (active, page, socket)
 * @param {string} ipAddress - Visitor's IP
 * @param {boolean} isActive - Active status
 * @param {string} currentPage - Current page
 * @param {string} socketId - Socket ID
 * @returns {Promise<boolean>}
 */
async function updateVisitorStatus(ipAddress, isActive, currentPage, socketId) {
  try {
    await pool.query(
      'CALL UpdateVisitorStatus(?, ?, ?, ?)',
      [ipAddress, isActive ? 1 : 0, currentPage, socketId]
    );
    
    console.log(`✅ Updated status for IP: ${ipAddress} → ${currentPage} (${isActive ? 'Active' : 'Inactive'})`);
    
    return true;
  } catch (error) {
    console.error('❌ Error updating visitor status:', error);
    throw error;
  }
}

/**
 * Delete visitor table and data
 * @param {string} ipAddress - Visitor's IP
 * @returns {Promise<boolean>}
 */
async function deleteVisitorTable(ipAddress) {
  try {
    const [result] = await pool.query(
      'CALL DeleteVisitorTable(?, @success)',
      [ipAddress]
    );
    
    const [output] = await pool.query('SELECT @success AS success');
    
    console.log(`✅ Deleted table for IP: ${ipAddress}`);
    
    return output[0].success === 1;
  } catch (error) {
    console.error('❌ Error deleting visitor table:', error);
    throw error;
  }
}

/**
 * Cleanup inactive visitors (older than specified days)
 * @param {number} daysInactive - Number of days of inactivity
 * @returns {Promise<void>}
 */
async function cleanupInactiveVisitors(daysInactive = 30) {
  try {
    const [result] = await pool.query(
      'CALL CleanupInactiveVisitors(?)',
      [daysInactive]
    );
    
    console.log(`🧹 Cleanup result:`, result[0][0]);
    
    return result[0][0];
  } catch (error) {
    console.error('❌ Error cleaning up inactive visitors:', error);
    throw error;
  }
}

module.exports = {
  createVisitorTable,
  insertVisitorData,
  getVisitorData,
  getAllVisitors,
  getAllVisitorsData,
  updateVisitorStatus,
  deleteVisitorTable,
  cleanupInactiveVisitors,
  pool
};
