const { createServer } = require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = 3000

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Generate self-signed certificate for development
const forge = require('node-forge')
const pki = forge.pki

// Create a new keypair
const keys = pki.rsa.generateKeyPair(2048)

// Create a certificate
const cert = pki.createCertificate()
cert.publicKey = keys.publicKey
cert.serialNumber = '01'
cert.validity.notBefore = new Date()
cert.validity.notAfter = new Date()
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)

const attrs = [{
  name: 'commonName',
  value: '10.20.18.252'
}, {
  name: 'countryName',
  value: 'US'
}, {
  shortName: 'ST',
  value: 'State'
}, {
  name: 'localityName',
  value: 'City'
}, {
  name: 'organizationName',
  value: 'Arogya-AI'
}, {
  shortName: 'OU',
  value: 'Development'
}]

cert.setSubject(attrs)
cert.setIssuer(attrs)
cert.setExtensions([{
  name: 'basicConstraints',
  cA: true
}, {
  name: 'keyUsage',
  keyCertSign: true,
  digitalSignature: true,
  nonRepudiation: true,
  keyEncipherment: true,
  dataEncipherment: true
}, {
  name: 'subjectAltName',
  altNames: [{
    type: 2, // DNS
    value: 'localhost'
  }, {
    type: 7, // IP
    ip: '127.0.0.1'
  }, {
    type: 7, // IP
    ip: '10.20.18.252'
  }]
}])

// Self-sign certificate
cert.sign(keys.privateKey)

// Convert to PEM format
const pemCert = pki.certificateToPem(cert)
const pemKey = pki.privateKeyToPem(keys.privateKey)

const httpsOptions = {
  key: pemKey,
  cert: pemCert
}

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on https://${hostname}:${port}`)
      console.log(`> Access from other devices: https://10.20.18.252:${port}`)
      console.log(`> Note: You'll need to accept the self-signed certificate warning`)
    })
})
