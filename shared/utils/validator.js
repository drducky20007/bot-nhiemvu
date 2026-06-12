/**
 * Input Validation Utility
 */

class Validator {
  static validateAmount(amount, options = {}) {
    const { min = 1, max = 1000000000, allowZero = false } = options;

    if (typeof amount !== 'number' || isNaN(amount)) {
      return { valid: false, error: 'Số tiền phải là số hợp lệ!' };
    }

    if (!Number.isInteger(amount)) {
      return { valid: false, error: 'Số tiền phải là số nguyên!' };
    }

    if (!allowZero && amount < min) {
      return { valid: false, error: `Số tiền tối thiểu là ${min.toLocaleString()} Ely!` };
    }

    if (amount > max) {
      return { valid: false, error: `Số tiền tối đa là ${max.toLocaleString()} Ely!` };
    }

    if (amount < 0) {
      return { valid: false, error: 'Số tiền không thể âm!' };
    }

    return { valid: true, amount };
  }

  static validateUserId(userId) {
    if (!userId || typeof userId !== 'string') {
      return { valid: false, error: 'User ID không hợp lệ!' };
    }

    if (!/^\d{17,20}$/.test(userId)) {
      return { valid: false, error: 'User ID không đúng định dạng!' };
    }

    return { valid: true, userId };
  }

  static validateItemId(itemId) {
    if (!itemId || typeof itemId !== 'string') {
      return { valid: false, error: 'Item ID không hợp lệ!' };
    }

    if (!/^item_[a-z0-9_]+$/i.test(itemId)) {
      return { valid: false, error: 'Item ID phải có format: item_xxx' };
    }

    if (itemId.length > 50) {
      return { valid: false, error: 'Item ID quá dài (max 50 ký tự)!' };
    }

    return { valid: true, itemId };
  }

  static validateText(text, options = {}) {
    const { minLength = 1, maxLength = 200, allowEmpty = false, fieldName = 'Text' } = options;

    if (!text && !allowEmpty) {
      return { valid: false, error: `${fieldName} không được để trống!` };
    }

    if (typeof text !== 'string') {
      return { valid: false, error: `${fieldName} phải là chuỗi!` };
    }

    const trimmed = text.trim();

    if (!allowEmpty && trimmed.length < minLength) {
      return { valid: false, error: `${fieldName} phải có ít nhất ${minLength} ký tự!` };
    }

    if (trimmed.length > maxLength) {
      return { valid: false, error: `${fieldName} tối đa ${maxLength} ký tự!` };
    }

    if (/<script|javascript:|onerror=/i.test(text)) {
      return { valid: false, error: `${fieldName} chứa ký tự không hợp lệ!` };
    }

    return { valid: true, text: trimmed };
  }

  static validateQuantity(quantity, options = {}) {
    const { min = 1, max = 100 } = options;

    if (typeof quantity !== 'number' || isNaN(quantity)) {
      return { valid: false, error: 'Số lượng phải là số hợp lệ!' };
    }

    if (!Number.isInteger(quantity)) {
      return { valid: false, error: 'Số lượng phải là số nguyên!' };
    }

    if (quantity < min) {
      return { valid: false, error: `Số lượng tối thiểu là ${min}!` };
    }

    if (quantity > max) {
      return { valid: false, error: `Số lượng tối đa là ${max}!` };
    }

    return { valid: true, quantity };
  }

  static validateBalance(userBalance, requiredAmount) {
    if (userBalance < requiredAmount) {
      const shortage = requiredAmount - userBalance;
      return { valid: false, error: `Không đủ tiền! (Thiếu ${shortage.toLocaleString()} Ely)` };
    }

    return { valid: true };
  }

  static validatePercentage(percent) {
    if (typeof percent !== 'number' || isNaN(percent)) {
      return { valid: false, error: 'Phần trăm phải là số hợp lệ!' };
    }

    if (percent < 0 || percent > 100) {
      return { valid: false, error: 'Phần trăm phải từ 0-100!' };
    }

    return { valid: true, percent };
  }

  static validateRoleId(roleId) {
    if (!roleId || typeof roleId !== 'string') {
      return { valid: false, error: 'Role ID không hợp lệ!' };
    }

    if (!/^\d{17,20}$/.test(roleId)) {
      return { valid: false, error: 'Role ID không đúng định dạng!' };
    }

    return { valid: true, roleId };
  }

  static sanitize(text) {
    if (typeof text !== 'string') return '';
    
    return text
      .trim()
      .replace(/<script.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/onerror=/gi, '')
      .replace(/onclick=/gi, '')
      .substring(0, 2000);
  }

  static validateJSON(jsonString) {
    if (!jsonString) {
      return { valid: true, data: null };
    }

    try {
      const data = JSON.parse(jsonString);
      return { valid: true, data };
    } catch (error) {
      return { valid: false, error: 'JSON không hợp lệ!' };
    }
  }
}

module.exports = Validator;