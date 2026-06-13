<<<<<<< HEAD
<<<<<<< HEAD
const Validator = require('../utils/validator');
const logger = require('../utils/logger');

async function validateAmount(interaction, optionName = 'amount', options = {}) {
  const amount = interaction.options.getInteger(optionName);
  
  if (amount === null || amount === undefined) {
    return { valid: false, error: 'Thiếu số tiền!' };
  }

  const validation = Validator.validateAmount(amount, options);
  
  if (!validation.valid) {
    await interaction.reply({
      content: `❌ ${validation.error}`,
      ephemeral: true
    });
    
    logger.security('invalid-amount', interaction.user.id, 
      `Amount: ${amount}, Error: ${validation.error}`
    );
  }
  
  return validation;
}

async function validateUser(interaction, optionName = 'user') {
  const targetUser = interaction.options.getUser(optionName);
  
  if (!targetUser) {
    await interaction.reply({
      content: '❌ User không hợp lệ!',
      ephemeral: true
    });
    return { valid: false };
  }

  if (targetUser.bot) {
    await interaction.reply({
      content: '❌ Không thể thực hiện với bot!',
      ephemeral: true
    });
    return { valid: false };
  }

  if (targetUser.id === interaction.user.id) {
    await interaction.reply({
      content: '❌ Không thể thực hiện với chính mình!',
      ephemeral: true
    });
    return { valid: false };
  }

  return { valid: true, user: targetUser };
}

async function validateQuantity(interaction, optionName = 'quantity', options = {}) {
  const quantity = interaction.options.getInteger(optionName) || 1;
  
  const validation = Validator.validateQuantity(quantity, options);
  
  if (!validation.valid) {
    await interaction.reply({
      content: `❌ ${validation.error}`,
      ephemeral: true
    });
  }
  
  return validation;
}

async function validateText(interaction, optionName, options = {}) {
  const text = interaction.options.getString(optionName);
  
  const validation = Validator.validateText(text, options);
  
  if (!validation.valid) {
    await interaction.reply({
      content: `❌ ${validation.error}`,
      ephemeral: true
    });
  }
  
  return validation;
}

module.exports = {
  validateAmount,
  validateUser,
  validateQuantity,
  validateText
=======
const Validator = require('../utils/validator');
const logger = require('../utils/logger');

async function validateAmount(interaction, optionName = 'amount', options = {}) {
  const amount = interaction.options.getInteger(optionName);
  
  if (amount === null || amount === undefined) {
    return { valid: false, error: 'Thiếu số tiền!' };
  }

  const validation = Validator.validateAmount(amount, options);
  
  if (!validation.valid) {
    await interaction.reply({
      content: `❌ ${validation.error}`,
      ephemeral: true
    });
    
    logger.security('invalid-amount', interaction.user.id, 
      `Amount: ${amount}, Error: ${validation.error}`
    );
  }
  
  return validation;
}

async function validateUser(interaction, optionName = 'user') {
  const targetUser = interaction.options.getUser(optionName);
  
  if (!targetUser) {
    await interaction.reply({
      content: '❌ User không hợp lệ!',
      ephemeral: true
    });
    return { valid: false };
  }

  if (targetUser.bot) {
    await interaction.reply({
      content: '❌ Không thể thực hiện với bot!',
      ephemeral: true
    });
    return { valid: false };
  }

  if (targetUser.id === interaction.user.id) {
    await interaction.reply({
      content: '❌ Không thể thực hiện với chính mình!',
      ephemeral: true
    });
    return { valid: false };
  }

  return { valid: true, user: targetUser };
}

async function validateQuantity(interaction, optionName = 'quantity', options = {}) {
  const quantity = interaction.options.getInteger(optionName) || 1;
  
  const validation = Validator.validateQuantity(quantity, options);
  
  if (!validation.valid) {
    await interaction.reply({
      content: `❌ ${validation.error}`,
      ephemeral: true
    });
  }
  
  return validation;
}

async function validateText(interaction, optionName, options = {}) {
  const text = interaction.options.getString(optionName);
  
  const validation = Validator.validateText(text, options);
  
  if (!validation.valid) {
    await interaction.reply({
      content: `❌ ${validation.error}`,
      ephemeral: true
    });
  }
  
  return validation;
}

module.exports = {
  validateAmount,
  validateUser,
  validateQuantity,
  validateText
>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
=======
const Validator = require('../utils/validator');
const logger = require('../utils/logger');

async function validateAmount(interaction, optionName = 'amount', options = {}) {
  const amount = interaction.options.getInteger(optionName);
  
  if (amount === null || amount === undefined) {
    return { valid: false, error: 'Thiếu số tiền!' };
  }

  const validation = Validator.validateAmount(amount, options);
  
  if (!validation.valid) {
    await interaction.reply({
      content: `❌ ${validation.error}`,
      ephemeral: true
    });
    
    logger.security('invalid-amount', interaction.user.id, 
      `Amount: ${amount}, Error: ${validation.error}`
    );
  }
  
  return validation;
}

async function validateUser(interaction, optionName = 'user') {
  const targetUser = interaction.options.getUser(optionName);
  
  if (!targetUser) {
    await interaction.reply({
      content: '❌ User không hợp lệ!',
      ephemeral: true
    });
    return { valid: false };
  }

  if (targetUser.bot) {
    await interaction.reply({
      content: '❌ Không thể thực hiện với bot!',
      ephemeral: true
    });
    return { valid: false };
  }

  if (targetUser.id === interaction.user.id) {
    await interaction.reply({
      content: '❌ Không thể thực hiện với chính mình!',
      ephemeral: true
    });
    return { valid: false };
  }

  return { valid: true, user: targetUser };
}

async function validateQuantity(interaction, optionName = 'quantity', options = {}) {
  const quantity = interaction.options.getInteger(optionName) || 1;
  
  const validation = Validator.validateQuantity(quantity, options);
  
  if (!validation.valid) {
    await interaction.reply({
      content: `❌ ${validation.error}`,
      ephemeral: true
    });
  }
  
  return validation;
}

async function validateText(interaction, optionName, options = {}) {
  const text = interaction.options.getString(optionName);
  
  const validation = Validator.validateText(text, options);
  
  if (!validation.valid) {
    await interaction.reply({
      content: `❌ ${validation.error}`,
      ephemeral: true
    });
  }
  
  return validation;
}

module.exports = {
  validateAmount,
  validateUser,
  validateQuantity,
  validateText
>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
};