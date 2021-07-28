module.exports = {
  name: 'Failed',
  callback: async () => {
    throw new Error('Check failed!');
  }
}
