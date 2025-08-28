function sanitize(str) {
  return str.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
}

module.exports = { sanitize };


