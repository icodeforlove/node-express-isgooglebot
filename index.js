var dns = require('dns'),
	verifiedGoogleIPAddresses = [],
	invalidGoogleIPAddresses = [];

function verifyGoogleIPAddress (ip, callback) {
	if (verifiedGoogleIPAddresses.indexOf(ip) !== -1) {
		callback(true);
	} else if (invalidGoogleIPAddresses.indexOf(ip) !== -1) {
		callback(false);
	} else {
		dns.reverse(ip, function (error, hosts) {
			var host = hosts ? hosts.pop() : null;

			// is reverse lookup a google domain
			if (host && host.match(/(?:googlebot|google)\.com$/i)) {
				// verify reverse lookup
				dns.lookup(host, function (error, result) {
					if (result.trim() === ip) {
						// cache valid ip
						if (verifiedGoogleIPAddresses.indexOf(ip) === -1) {
							verifiedGoogleIPAddresses.push(ip);
						}
						callback(true);
					} else {
						// cache invalid ip
						if (invalidGoogleIPAddresses.indexOf(ip) === -1) {
							invalidGoogleIPAddresses.push(ip);

							// only store the most recent 1000 failed IP addresses (avoids overflow)
							if (invalidGoogleIPAddresses.length > 2000) {
								invalidGoogleIPAddresses = invalidGoogleIPAddresses.slice(1000);
							}
						}

						callback(false);
					}
				});
			} else {
				// cache invalid ip
				if (invalidGoogleIPAddresses.indexOf(ip) === -1) {
					invalidGoogleIPAddresses.push(ip);

					// only store the most recent 1000 failed IP addresses (avoids overflow)
					if (invalidGoogleIPAddresses.length > 2000) {
						invalidGoogleIPAddresses = invalidGoogleIPAddresses.slice(1000);
					}
				}

				callback(false);
			}
		});
	}
}

module.exports = function (request, response, next) {
	if (request.headers['user-agent'] && request.headers['user-agent'].match(/Googlebot/i)) {
		verifyGoogleIPAddress(request.ip, function (isGoogleBot) {
			request.isGoogleBot = isGoogleBot;
			next();
		});
	} else {
		request.isGoogleBot = false;
		next();
	}
};
