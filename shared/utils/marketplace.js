const { db } = require('../database/db');
const logger = require('./logger');

class MarketplaceManager {
  /**
   * Đăng ký shop mới
   */
  registerShop(userId, shopName, description) {
    // Check đã có shop chưa
    const existing = db.prepare('SELECT id FROM player_shops WHERE owner_id = ?').get(userId);
    
    if (existing) {
      return { success: false, error: 'Bạn đã có shop rồi!' };
    }

    // Check tên shop trùng
    const nameTaken = db.prepare('SELECT id FROM player_shops WHERE shop_name = ?').get(shopName);
    
    if (nameTaken) {
      return { success: false, error: 'Tên shop đã được sử dụng!' };
    }

    try {
      const result = db.prepare(`
        INSERT INTO player_shops (owner_id, shop_name, description)
        VALUES (?, ?, ?)
      `).run(userId, shopName, description);

      logger.system('Shop registered', { userId, shopName });

      return { 
        success: true, 
        shopId: result.lastInsertRowid,
        shopName 
      };

    } catch (error) {
      logger.error('Shop registration failed', { error: error.message });
      return { success: false, error: 'Có lỗi xảy ra' };
    }
  }

  /**
   * Đăng bán item
   */
  listItem(userId, itemData) {
    const { name, description, price, stock, category, rarity, imageUrl, metadata } = itemData;

    // Get shop
    const shop = db.prepare('SELECT id, is_active FROM player_shops WHERE owner_id = ?').get(userId);

    if (!shop) {
      return { success: false, error: 'Bạn chưa có shop! Dùng `/shop register`' };
    }

    if (shop.is_active === 0) {
      return { success: false, error: 'Shop của bạn đang bị khóa!' };
    }

    // Create listing
    try {
      const result = db.prepare(`
        INSERT INTO marketplace_listings 
        (shop_id, seller_id, item_name, item_description, price, stock, category, rarity, image_url, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        shop.id, userId, name, description, price, stock || 1, 
        category || 'custom', rarity || 'common', imageUrl, metadata
      );

      logger.info('Item listed', { userId, itemName: name, price });

      return { 
        success: true, 
        listingId: result.lastInsertRowid,
        itemName: name
      };

    } catch (error) {
      logger.error('List item failed', { error: error.message });
      return { success: false, error: 'Có lỗi xảy ra' };
    }
  }

  /**
   * Browse marketplace
   */
  browseMarketplace(filters = {}) {
    const { category, minPrice, maxPrice, search, sortBy } = filters;

    let query = `
      SELECT 
        ml.*,
        ps.shop_name,
        ps.rating as shop_rating
      FROM marketplace_listings ml
      JOIN player_shops ps ON ml.shop_id = ps.id
      WHERE ml.is_active = 1 AND ps.is_active = 1
    `;

    const params = [];

    if (category && category !== 'all') {
      query += ' AND ml.category = ?';
      params.push(category);
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
      query += ' AND (ml.item_name LIKE ? OR ml.item_description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Sort
    if (sortBy === 'price_low') {
      query += ' ORDER BY ml.price ASC';
    } else if (sortBy === 'price_high') {
      query += ' ORDER BY ml.price DESC';
    } else if (sortBy === 'popular') {
      query += ' ORDER BY ml.total_sold DESC';
    } else {
      query += ' ORDER BY ml.created_at DESC';
    }

    query += ' LIMIT 50';

    return db.prepare(query).all(...params);
  }

  /**
   * Mua item từ marketplace
   */
  purchaseItem(buyerId, listingId, quantity = 1) {
    const listing = db.prepare(`
      SELECT 
        ml.*,
        ps.owner_id as seller_id,
        ps.commission_rate
      FROM marketplace_listings ml
      JOIN player_shops ps ON ml.shop_id = ps.id
      WHERE ml.id = ? AND ml.is_active = 1
    `).get(listingId);

    if (!listing) {
      return { success: false, error: 'Item không tồn tại!' };
    }

    if (listing.seller_id === buyerId) {
      return { success: false, error: 'Không thể mua từ shop của chính mình!' };
    }

    if (listing.stock < quantity) {
      return { success: false, error: `Chỉ còn ${listing.stock} items!` };
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

    // Calculate commission
    const commission = Math.floor(totalCost * listing.commission_rate);
    const sellerReceived = totalCost - commission;

    // Transaction
    const purchaseTransaction = db.transaction(() => {
      // Trừ tiền buyer
      db.prepare('UPDATE users SET balance = balance - ? WHERE user_id = ?')
        .run(totalCost, buyerId);

      // Cộng tiền seller
      db.prepare('UPDATE users SET balance = balance + ? WHERE user_id = ?')
        .run(sellerReceived, listing.seller_id);

      // Commission vào treasury
      db.prepare('UPDATE treasury SET balance = balance + ? WHERE id = 1')
        .run(commission);

      // Update stock
      if (listing.stock - quantity <= 0) {
        db.prepare('UPDATE marketplace_listings SET stock = 0, is_active = 0 WHERE id = ?')
          .run(listingId);
      } else {
        db.prepare('UPDATE marketplace_listings SET stock = stock - ?, total_sold = total_sold + ? WHERE id = ?')
          .run(quantity, quantity, listingId);
      }

      // Update shop stats
      db.prepare(`
        UPDATE player_shops 
        SET total_sales = total_sales + 1, total_revenue = total_revenue + ?
        WHERE owner_id = ?
      `).run(sellerReceived, listing.seller_id);

      // Log transaction
      const txResult = db.prepare(`
        INSERT INTO marketplace_transactions 
        (listing_id, buyer_id, seller_id, item_name, price_paid, commission, seller_received, quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        listingId, buyerId, listing.seller_id, listing.item_name,
        totalCost, commission, sellerReceived, quantity
      );

      // Log to transactions table
      db.prepare(`
        INSERT INTO transactions (user_id, type, amount, description)
        VALUES (?, 'marketplace-purchase', ?, ?)
      `).run(buyerId, -totalCost, `Mua ${listing.item_name} từ ${listing.shop_name}`);

      db.prepare(`
        INSERT INTO transactions (user_id, type, amount, description)
        VALUES (?, 'marketplace-sale', ?, ?)
      `).run(listing.seller_id, sellerReceived, `Bán ${listing.item_name} (Commission: ${commission})`);

      return txResult.lastInsertRowid;
    });

    try {
      const transactionId = purchaseTransaction();

      logger.transaction('marketplace-purchase', buyerId, totalCost, 
        `Bought ${listing.item_name} from ${listing.seller_id}`
      );

      return { 
        success: true, 
        transactionId,
        itemName: listing.item_name,
        totalCost,
        commission,
        sellerReceived,
        sellerId: listing.seller_id
      };

    } catch (error) {
      logger.error('Purchase failed', { error: error.message, buyerId, listingId });
      return { success: false, error: 'Có lỗi xảy ra!' };
    }
  }

  /**
   * Lấy thông tin shop
   */
  getShop(userId) {
    return db.prepare(`
      SELECT * FROM player_shops WHERE owner_id = ?
    `).get(userId);
  }

  /**
   * Lấy listings của shop
   */
  getShopListings(userId) {
    return db.prepare(`
      SELECT * FROM marketplace_listings 
      WHERE seller_id = ? 
      ORDER BY created_at DESC
    `).all(userId);
  }

  /**
   * Review shop
   */
  reviewShop(reviewerId, transactionId, rating, comment) {
    // Get transaction
    const tx = db.prepare(`
      SELECT seller_id, buyer_id 
      FROM marketplace_transactions 
      WHERE id = ?
    `).get(transactionId);

    if (!tx) {
      return { success: false, error: 'Transaction không tồn tại!' };
    }

    if (tx.buyer_id !== reviewerId) {
      return { success: false, error: 'Chỉ buyer mới có thể review!' };
    }

    // Get shop
    const shop = db.prepare('SELECT id FROM player_shops WHERE owner_id = ?').get(tx.seller_id);

    if (!shop) {
      return { success: false, error: 'Shop không tồn tại!' };
    }

    try {
      // Insert review
      db.prepare(`
        INSERT INTO shop_reviews (shop_id, reviewer_id, transaction_id, rating, comment)
        VALUES (?, ?, ?, ?, ?)
      `).run(shop.id, reviewerId, transactionId, rating, comment);

      // Update shop rating
      const avgRating = db.prepare(`
        SELECT AVG(rating) as avg FROM shop_reviews WHERE shop_id = ?
      `).get(shop.id).avg;

      db.prepare('UPDATE player_shops SET rating = ? WHERE id = ?')
        .run(avgRating, shop.id);

      return { success: true };

    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        return { success: false, error: 'Bạn đã review transaction này rồi!' };
      }
      return { success: false, error: 'Có lỗi xảy ra!' };
    }
  }
}

module.exports = new MarketplaceManager();