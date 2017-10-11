function Time(dateStr) {
  return new Date(parseInt(dateStr.replace("/Date(", "").replace(")/", ""), 10))
}

module.exports = {
  Time: Time
}