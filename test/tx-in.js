/* global describe,it */
'use strict'
let should = require('chai').should()
let Script = require('../lib/script')
let TxIn = require('../lib/tx-in')
let TxOut = require('../lib/tx-out')
let VarInt = require('../lib/var-int')
let Br = require('../lib/br')
let Bn = require('../lib/bn')
let KeyPair = require('../lib/key-pair')
let Address = require('../lib/address')

describe('TxIn', function () {
  let txHashBuf = new Buffer(32)
  txHashBuf.fill(0)
  let txOutNum = 0
  let script = new Script().fromString('OP_CHECKMULTISIG')
  let scriptVi = new VarInt(script.toBuffer().length)
  let nSequence = 0
  let txin = new TxIn().fromObject({
    txHashBuf: txHashBuf,
    txOutNum: txOutNum,
    scriptVi: scriptVi,
    script: script,
    nSequence: nSequence
  })

  it('should make a new txin', function () {
    let txin = new TxIn()
    should.exist(txin)
    txin = new TxIn()
    should.exist(txin)
    let txHashBuf = new Buffer(32)
    txHashBuf.fill(0)
    new TxIn(txHashBuf, 0).txHashBuf.length.should.equal(32)
  })

  describe('#initialize', function () {
    it('should default to 0xffffffff nSequence', function () {
      new TxIn().nSequence.should.equal(0xffffffff)
    })
  })

  describe('#fromObject', function () {
    it('should set these vars', function () {
      let txin = new TxIn().fromObject({
        txHashBuf: txHashBuf,
        txOutNum: txOutNum,
        scriptVi: scriptVi,
        script: script,
        nSequence: nSequence
      })
      should.exist(txin.txHashBuf)
      should.exist(txin.txOutNum)
      should.exist(txin.scriptVi)
      should.exist(txin.script)
      should.exist(txin.nSequence)
    })
  })

  describe('#setScript', function () {
    it('should calculate the varInt size correctly', function () {
      let txin2 = new TxIn(txin)
      txin2.setScript(new Script().fromString('OP_RETURN OP_RETURN OP_RETURN')).scriptVi.toNumber().should.equal(3)
    })
  })

  describe('#fromJson', function () {
    it('should set these vars', function () {
      let txin2 = new TxIn().fromJson(txin.toJson())
      should.exist(txin2.txHashBuf)
      should.exist(txin2.txOutNum)
      should.exist(txin2.scriptVi)
      should.exist(txin2.script)
      should.exist(txin2.nSequence)
    })
  })

  describe('#toJson', function () {
    it('should set these vars', function () {
      let json = txin.toJson()
      should.exist(json.txHashBuf)
      should.exist(json.txOutNum)
      should.exist(json.scriptVi)
      should.exist(json.script)
      should.exist(json.nSequence)
    })
  })

  describe('#fromHex', function () {
    it('should convert this known buffer', function () {
      let hex = '00000000000000000000000000000000000000000000000000000000000000000000000001ae00000000'
      let txin = new TxIn().fromHex(hex)
      txin.scriptVi.toNumber().should.equal(1)
      txin.script.toString().should.equal('OP_CHECKMULTISIG')
    })
  })

  describe('#fromBuffer', function () {
    it('should convert this known buffer', function () {
      let hex = '00000000000000000000000000000000000000000000000000000000000000000000000001ae00000000'
      let buf = new Buffer(hex, 'hex')
      let txin = new TxIn().fromBuffer(buf)
      txin.scriptVi.toNumber().should.equal(1)
      txin.script.toString().should.equal('OP_CHECKMULTISIG')
    })
  })

  describe('#fromBr', function () {
    it('should convert this known buffer', function () {
      let hex = '00000000000000000000000000000000000000000000000000000000000000000000000001ae00000000'
      let buf = new Buffer(hex, 'hex')
      let br = new Br(buf)
      let txin = new TxIn().fromBr(br)
      txin.scriptVi.toNumber().should.equal(1)
      txin.script.toString().should.equal('OP_CHECKMULTISIG')
    })
  })

  describe('#toHex', function () {
    it('should convert this known hex', function () {
      txin.toHex().should.equal('00000000000000000000000000000000000000000000000000000000000000000000000001ae00000000')
    })
  })

  describe('#toBuffer', function () {
    it('should convert this known buffer', function () {
      txin.toBuffer().toString('hex').should.equal('00000000000000000000000000000000000000000000000000000000000000000000000001ae00000000')
    })
  })

  describe('#toBw', function () {
    it('should convert this known buffer', function () {
      txin.toBw().toBuffer().toString('hex').should.equal('00000000000000000000000000000000000000000000000000000000000000000000000001ae00000000')
    })
  })

  describe('#fromPubKeyHashTxOut', function () {
    it('should convert from pubKeyHash out', function () {
      let keyPair = new KeyPair().fromRandom()
      let address = new Address().fromPubKey(keyPair.pubKey)
      let txout = new TxOut(new Bn(1000), new Script().fromPubKeyHash(address.hashBuf))
      let txHashBuf = new Buffer(32)
      txHashBuf.fill(0)
      let txOutNum = 0
      let txin = new TxIn().fromPubKeyHashTxOut(txHashBuf, txOutNum, txout, keyPair.pubKey)
      should.exist(txin)
    })
  })

  describe('#fromScriptHashMultiSigTxOut', function () {
    it('should convert from scripthash out', function () {
      let keyPair1 = new KeyPair().fromRandom()
      let keyPair2 = new KeyPair().fromRandom()
      let script = new Script().fromPubKeys(2, [keyPair1.pubKey, keyPair2.pubKey])
      let address = new Address().fromRedeemScript(script)
      let txout = new TxOut(new Bn(1000), new Script().fromScriptHash(address.hashBuf))
      let txHashBuf = new Buffer(32)
      txHashBuf.fill(0)
      let txOutNum = 0
      let txin = new TxIn().fromScriptHashMultiSigTxOut(txHashBuf, txOutNum, txout, script)
      Buffer.compare(txin.script.chunks[3].buf, script.toBuffer()).should.equal(0)
    })
  })

  describe('@fromScriptHashMultiSigTxOut', function () {
    it('should convert from scripthash out', function () {
      let keyPair1 = KeyPair.fromRandom()
      let keyPair2 = KeyPair.fromRandom()
      let script = Script.fromPubKeys(2, [keyPair1.pubKey, keyPair2.pubKey])
      let address = Address.fromRedeemScript(script)
      let txout = new TxOut(new Bn(1000), new Script().fromScriptHash(address.hashBuf))
      let txHashBuf = new Buffer(32)
      txHashBuf.fill(0)
      let txOutNum = 0
      let txin = TxIn.fromScriptHashMultiSigTxOut(txHashBuf, txOutNum, txout, script)
      Buffer.compare(txin.script.chunks[3].buf, script.toBuffer()).should.equal(0)
    })
  })
})
