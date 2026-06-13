const { db } = require('../database/db');
const logger = require('./logger');

class ControlledMarketplace {
  /**
   * Admin: Register item vào hệ thống
   */
  registerItem(adminId, itemData) {
    const { id, name, description, category, rarity, isTradeable, basePrice, metadata, imageUrl } = itemData;

    try {
      db.prepare(`
        INSERT INTO registered_items 
        (id, name, description, category, rarity, is_tradeable, base_price, metadata, image_url, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, name, description, category, rarity || 'common', 
        isTradeable ? 1 : 0, basePrice || 0, metadata, imageUrl, adminId
      );

      logger.system('Item registered', { adminId, itemId: id, name });

      return { success: true, itemId: id };

    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        return { success: false, error: 'Item ID đã tồn tại!' };
      }
      logger.error('Register item failed', { error: error.message });
      return { success: false, error: 'Có lỗi xảy ra' };
    }
  }

  /**
   * Lấy danh sách registered items
   */
  getRegisteredItems(filters = {}) {
    const { category, tradeable } = filters;

    let query = 'SELECT * FROM registered_items WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (tradeable !== undefined) {
      query += ' AND is_tradeable = ?';
      params.push(tradeable ? 1 : 0);
    }

    query += ' ORDER BY name ASC';

    return db.prepare(query).all(...params);
  }

  /**
   * Thêm item vào inventory của user
   */
  giveItem(userId, itemId, quantity = 1, obtainedFrom = 'admin') {
    // Check item tồn tại
    const item = db.prepare('SELECT * FROM registered_items WHERE id = ?').get(itemId);

    if (!item) {
      return { success: false, error: 'Item không tồn tại trong hệ thống!' };
    }

    try {
      // Check xem đã có item này chưa
      const existing = db.prepare(`
        SELECT id, quantity FROM user_inventory 
        WHERE user_id = ? AND item_id = ? AND is_locked = 0
      `).get(userId, itemId);

      if (existing) {
        // Stack thêm quantity
        db.prepare('UPDATE user_inventory SET quantity = quantity + ? WHERE id = ?')
          .run(quantity, existing.id);
      } else {
        // Tạo mới
        db.prepare(`
          INSERT INTO user_inventory (user_id, item_id, quantity, obtained_from)
          VALUES (?, ?, ?, ?)
        `).run(userId, itemId, quantity, obtainedFrom);
      }

      logger.info('Item given to user', { userId, itemId, quantity, obtainedFrom });

      return { success: true, item, quantity };

    } catch (error) {
      logger.error('Give item failed', { error: error.message });
      return { success: false, error: 'Có lỗi xảy ra' };
    }
  }

  /**
   * Lấy inventory của user
   */
  getUserInventory(userId, includeLockedItems = false) {
    let query = `
      SELECT 
        ui.*,
        ri.name as item_name,
        ri.description,
        ri.category,
        ri.rarity,
        ri.is_tradeable,
        ri.base_price,
        ri.image_url
      FROM user_inventory ui
      JOIN registered_items ri ON ui.item_id = ri.id
      WHERE ui.user_id = ?
    `;

    if (!includeLockedItems) {
      query += ' AND ui.is_locked = 0';
    }

    query += ' ORDER BY ui.obtained_at DESC';

    return db.prepare(query).all(userId);
  }

  /**
   * List item lên marketplace
   */
  listItemForSale(userId, inventoryId, price) {
    // Get inventory item
    const invItem = db.prepare(`
      SELECT ui.*, ri.name, ri.rarity, ri.is_tradeable
      FROM user_inventory ui
      JOIN registered_items ri ON ui.item_id = ri.id
      WHERE ui.id = ? AND ui.user_id = ?
    `).get(inventoryId, userId);

    if (!invItem) {
      return { success: false, error: 'Item không tồn tại trong inventory!' };
    }

    if (invItem.is_locked) {
      return { success: false, error: 'Item này đang được bán rồi!' };
    }

    if (!invItem.is_tradeable) {
      return { success: false, error: 'Item này không thể trade (Soulbound)!' };
    }

    if (invItem.quantity < 1) {
      return { success: false, error: 'Không đủ quantity!' };
    }

    // Transaction: Lock item + Create listing
    const listTransaction = db.transaction(() => {
      // Lock item
      db.prepare('UPDATE user_inventory SET is_locked = 1 WHERE id = ?')
        .run(inventoryId);

      // Create listing
      const result = db.prepare(`
        INSERT INTO marketplace_listings 
        (seller_id, inventory_id, item_id, item_name, item_rarity, price, quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId, inventoryId, invItem.item_id, invItem.name, 
        invItem.rarity, price, invItem.quantity
      );

      return result.lastInsertRowid;
    });

    try {
      const listingId = listTransaction();

      logger.info('Item listed for sale', { userId, inventoryId, price });

      return { 
        success: true, 
        listingId,
        itemName: invItem.name 
      };

    } catch (error) {
      logger.error('List item failed', { error: error.message });
      return { success: false, error: 'Có lỗi xảy ra' };
    }
  }

  /**
   * Thu hồi listing (unlist)
   */
  unlistItem(userId, listingId) {
    const listing = db.prepare(`
      SELECT * FROM marketplace_listings 
      WHERE id = ? AND seller_id = ? AND is_active = 1
    `).get(listingId, userId);

    if (!listing) {
      return { success: false, error: 'Listing không tồn tại!' };
    }

    // Transaction: Deactivate listing + Unlock item
    const unlistTransaction = db.transaction(() => {
      db.prepare('UPDATE marketplace_listings SET is_active = 0 WHERE id = ?')
        .run(listingId);

      db.prepare('UPDATE user_inventory SET is_locked = 0 WHERE id = ?')
        .run(listing.inventory_id);
    });

    try {
      unlistTransaction();

      logger.info('Item unlisted', { userId, listingId });

      return { success: true };

    } catch (error) {
      logger.error('Unlist failed', { error: error.message });
      return { success: false, error: 'Có lỗi xảy ra' };
    }
  }

  /**
   * Browse marketplace
   */
  browseMarketplace(filters = {}) {
    const { category, minPrice, maxPrice, rarity, search, sortBy } = filters;

    let query = `
      SELECT 
        ml.*,
        ri.description,
        ri.category,
        ri.image_url
      FROM marketplace_listings ml
      JOIN registered_items ri ON ml.item_id = ri.id
      WHERE ml.is_active = 1
    `;

    const params = [];

    if (category) {
      query += ' AND ri.category = ?';
      params.push(category);
    }

    if (rarity) {
      query += ' AND ml.item_rarity = ?';
      params.push(rarity);
    }

    if (minPrice) {
      query += ' AND ml.price >= ?';
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ' AND ml.price <= ?';
      params.push(maxPrice);
    }

    if (search) {
      query += ' AND (ml.item_name LIKE ? OR ri.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Sort
    if (sortBy === 'price_low') {
      query += ' ORDER BY ml.price ASC';
    } else if (sortBy === 'price_high') {
      query += ' ORDER BY ml.price DESC';
    } else {
      query += ' ORDER BY ml.listed_at DESC';
    }

    query += ' LIMIT 50';

    return db.prepare(query).all(...params);
  }

  /**
   * Mua item từ marketplace
   */
  purchaseItem(buyerId, listingId, quantity = 1) {
    const listing = db.prepare(`
      SELECT ml.*, ri.name, ri.is_tradeable
      FROM marketplace_listings ml
      JOIN registered_items ri ON ml.item_id = ri.id
      WHERE ml.id = ? AND ml.is_active = 1
    `).get(listingId);

    if (!listing) {
      return { success: false, error: 'Item không tồn tại!' };
    }

    if (listing.seller_id === buyerId) {
      return { success: false, error: 'Không thể mua item của chính mình!' };
    }

    if (listing.quantity < quantity) {
      return { success: false, error: 'Không đủ quantity!' };
    }

    // Get buyer balance
    const buyer = db.prepare('SELECT balance FROM users WHERE user_id = ?').get(buyerId);

    if (!buyer) {
      return { success: false, error: 'User không tồn tại!' };
    }

    const totalCost = listing.price * quantity;

    if (buyer.balance < totalCost) {
      return { success: false, error: `Không đủ tiền! (Cần: ${totalCost.toLocaleString()} Ely)` };
    }

    // Calculate commission (10%)
    const commission = Math.floor(totalCost * 0.10);
    const sellerReceived = totalCost - commission;

    // Big transaction
    const purchaseTransaction = db.transaction(() => {
      // 1. Trừ tiền buyer
      db.prepare('UPDATE users SET balance = balance - ? WHERE user_id = ?')
        .run(totalCost, buyerId);

      // 2. Cộng tiền seller
      db.prepare('UPDATE users SET balance = balance + ? WHERE user_id = ?')
        .run(sellerReceived, listing.seller_id);

      // 3. Commission vào treasury
      db.prepare('UPDATE treasury SET balance = balance + ? WHERE id = 1')
        .run(commission);

      // 4. Update/Remove listing
      if (listing.quantity - quantity <= 0) {
        // Sold out
        db.prepare('UPDATE marketplace_listings SET is_active = 0, quantity = 0 WHERE id = ?')
          .run(listingId);

        // Unlock & remove from seller inventory
        db.prepare('DELETE FROM user_inventory WHERE id = ?')
          .run(listing.inventory_id);
      } else {
        // Update quantity
        db.prepare('UPDATE marketplace_listings SET quantity = quantity - ? WHERE id = ?')
          .run(quantity, listingId);

        db.prepare('UPDATE user_inventory SET quantity = quantity - ? WHERE id = ?')
          .run(quantity, listing.inventory_id);
      }

      // 5. Give item to buyer
      const existingBuyer = db.prepare(`
        SELECT id, quantity FROM user_inventory 
        WHERE user_id = ? AND item_id = ? AND is_locked = 0
      `).get(buyerId, listing.item_id);

      if (existingBuyer) {
        db.prepare('UPDATE user_inventory SET quantity = quantity + ? WHERE id = ?')
          .run(quantity, existingBuyer.id);
      } else {
        db.prepare(`
          INSERT INTO user_inventory (user_id, item_id, quantity, obtained_from)
          VALUES (?, ?, ?, 'marketplace')
        `).run(buyerId, listing.item_id, quantity);
      }

      // 6. Log transaction
      const txResult = db.prepare(`
        INSERT INTO marketplace_transactions 
        (listing_id, buyer_id, seller_id, item_id, item_name, quantity, price_paid, commission, seller_received)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        listingId, buyerId, listing.seller_id, listing.item_id, listing.item_name,
        quantity, totalCost, commission, sellerReceived
      );

      // 7. Log to transactions table
      db.prepare(`
        INSERT INTO transactions (user_id, type, amount, description)
        VALUES (?, 'marketplace-buy', ?, ?)
      `).run(buyerId, -totalCost, `Mua ${listing.item_name} x${quantity}`);

      db.prepare(`
        INSERT INTO transactions (user_id, type, amount, description)
        VALUES (?, 'marketplace-sell', ?, ?)
      `).run(listing.seller_id, sellerReceived, `Bán ${listing.item_name} x${quantity}`);

      return txResult.lastInsertRowid;
    });

    try {
      const transactionId = purchaseTransaction();

      logger.transaction('marketplace-purchase', buyerId, totalCost, 
        `Bought ${listing.item_name} x${quantity}`
      );

      return { 
        success: true,
        transactionId,
        itemName: listing.item_name,
        quantity,
        totalCost,
        commission,
        sellerReceived,
        sellerId: listing.seller_id
      };

    } catch (error) {
      logger.error('Purchase failed', { error: error.message });
      return { success: false, error: 'Có lỗi xảy ra!' };
    }
  }
}

module.exports = new ControlledMarketplace();