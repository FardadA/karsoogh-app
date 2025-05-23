// models/User.js
const { customAlphabet } = require('nanoid');
const db                  = require('../config/db');
const nanoid             = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  12
);

/**
 * Helper برای خواندن و مقداردهی اولیه‌ی آرایه users
 */
async function getUsers() {
  await db.safeRead();
  db.data = db.data || { users: [], groups: [] };
  return db.data.users;
}

module.exports = {
  /**
   * شبیه Sequelize.findOne
   * @param {{ where: { phone?: string, email?: string } }} param0
   */
  findOne: async ({ where }) => {
    if (!where || ( !where.phone && !where.email )) {
      throw new Error('At least phone or email must be specified');
    }
    const users = await getUsers();
    // اگر همزمان phone و email داده شده، هر کدام که match شود برمی‌گردد
    if (where.phone && where.email) {
      return users.find(u => u.phone === where.phone || u.email === where.email) || null;
    }
    if (where.phone) {
      return users.find(u => u.phone === where.phone) || null;
    }
    if (where.email) {
      return users.find(u => u.email === where.email) || null;
    }
    return null;
  },

  /**
   * شبیه Sequelize.findByPk
   * @param {string} id
   */
  findByPk: async (id) => {
    if (!id) throw new Error('User ID is required');
    const users = await getUsers();
    return users.find(u => u.id === id) || null;
  },

  /**
   * شبیه Sequelize.create
   * @param {object} data
   */
  create: async (data) => {
    // اعتبارسنجی ورودی‌های پایه‌ای
    const { firstName, lastName, phone, email, passwordHash, isVerified, friendCode, active } = data;
    if (!firstName || !lastName || !phone || !email || !passwordHash) {
      throw new Error('firstName, lastName, phone, email and passwordHash are required');
    }

    const users = await getUsers();
    db.data.users = users;

    const newUser = {
      id: nanoid(),
      firstName: firstName.toString().trim(),
      lastName: lastName.toString().trim(),
      phone: phone.toString().trim(),
      email: email.toString().trim(),
      passwordHash: passwordHash,
      isVerified: Boolean(isVerified),
      friendCode: friendCode ? friendCode.toString() : '',
      active: active === true,
      createdAt: Date.now()
    };

    db.data.users.push(newUser);
    await db.safeWrite();

    return newUser;
  },

  /**
   * شبیه Sequelize.destroy
   * @param {{ where: object }} param0
   */
  destroy: async ({ where }) => {
    if (!where || Object.keys(where).length === 0) {
      throw new Error('Where clause is required for destroy');
    }
    let users = await getUsers();
    if (where.id !== undefined) {
      users = users.filter(u => u.id !== where.id);
    } else {
      Object.keys(where).forEach(key => {
        users = users.filter(u => u[key] !== where[key]);
      });
    }
    db.data.users = users;
    await db.safeWrite();
  },

  /**
   * شبیه Sequelize.update
   * @param {object} data
   * @param {{ where: object }} param1
   */
  update: async (data, { where }) => {
    if (!where || Object.keys(where).length === 0) {
      throw new Error('Where clause is required for update');
    }
    const users = await getUsers();
    let updated = null;

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      let matches = true;
      Object.keys(where).forEach(key => {
        if (u[key] !== where[key]) matches = false;
      });
      if (matches) {
        const newUser = { ...u, ...data, id: u.id, createdAt: u.createdAt };
        users[i] = newUser;
        updated = newUser;
        break;
      }
    }

    db.data.users = users;
    await db.safeWrite();
    return updated;
  }
};
