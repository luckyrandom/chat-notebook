// Some hosted sandboxes cannot enumerate network interfaces. MyST's port
// discovery queries them even for local builds. If that specific OS call fails,
// report loopback only; this does not grant network access or change bind rules.
const os = require('node:os');
const original = os.networkInterfaces.bind(os);
os.networkInterfaces = () => {
  try { return original(); }
  catch (error) {
    if (!String(error.message).includes('uv_interface_addresses')) throw error;
    return { lo: [{ address: '127.0.0.1', netmask: '255.0.0.0', family: 'IPv4',
      mac: '00:00:00:00:00:00', internal: true, cidr: '127.0.0.1/8' }] };
  }
};
require('node:module').syncBuiltinESMExports();
require(require('node:path').join(__dirname, '../node_modules/mystmd/dist/myst.cjs'));
