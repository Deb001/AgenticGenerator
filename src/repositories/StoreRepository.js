import Store from '../models/Store';

/**
 * Repository for accessing Store data.
 */
class StoreRepository {
  /**
   * Retrieves a store by its primary key.
   * @param {string} id - Store identifier.
   * @returns {Promise<import('../models/Store').default|null>} Store instance or null if not found.
   */
  static async findById(id) {
    return await Store.findByPk(id);
  }

  /**
   * Retrieves all stores.
   * @returns {Promise<import('../models/Store').default[]>} Array of Store instances.
   */
  static async findAll() {
    return await Store.findAll();
  }

  /**
   * Creates a new store record.
   * @param {object} data - Store attributes.
   * @returns {Promise<import('../models/Store').default>} The created Store instance.
   */
  static async create(data) {
    return await Store.create(data);
  }
}

export default StoreRepository;