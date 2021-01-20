const { getEnrollees } = require('../../shared/samples/enrollee.samples');

const { principals, dependants } = getEnrollees();

module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Enrollees', principals);
    await queryInterface.bulkInsert('Enrollees', dependants);
  },

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.bulkDelete('Enrollees', null, {})]);
  },
};
