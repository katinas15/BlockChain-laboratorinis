const requestIp = require('request-ip')

exports.removeExtensionFromFile = file => {
    return file
      .split('.')
      .slice(0, -1)
      .join('.')
      .toString()
}

exports.getIP = req => requestIp.getClientIp(req)