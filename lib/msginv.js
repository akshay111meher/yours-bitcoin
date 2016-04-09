/**
 * MsgInv
 * ======
 *
 * Sends an inventory, or list of "inv" structures, i.e. a list of objects that
 * we have.
 */
'use strict'
let dependencies = {
  Block: require('./block'),
  BR: require('./br'),
  BW: require('./bw'),
  Inv: require('./inv'),
  Msg: require('./msg'),
  asink: require('asink')
}

let inject = function (deps) {
  let Block = deps.Block
  let BR = deps.BR
  let BW = deps.BW
  let Inv = deps.Inv
  let Msg = deps.Msg
  let asink = deps.asink

  function MsgInv (magicnum, cmdbuf, datasize, checksumbuf, databuf) {
    if (!(this instanceof MsgInv)) {
      return new MsgInv(magicnum, cmdbuf, datasize, checksumbuf, databuf)
    }
    this.initialize()
    this.fromObject({magicnum, cmdbuf, datasize, checksumbuf, databuf})
  }

  MsgInv.prototype = Object.create(Msg.prototype)
  MsgInv.prototype.constructor = MsgInv

  MsgInv.databufFromInvs = function (invs) {
    let bw = BW()
    bw.writeVarintNum(invs.length)
    for (let i = 0; i < invs.length; i++) {
      bw.write(invs[i].toBuffer())
    }
    return bw.toBuffer()
  }

  MsgInv.prototype.fromInvs = function (invs) {
    this.setData(MsgInv.databufFromInvs(invs))
    this.setCmd('inv')
    return this
  }

  MsgInv.prototype.asyncFromInvs = function (invs) {
    return asink(function *() {
      this.asyncSetData(MsgInv.databufFromInvs(invs))
      this.setCmd('inv')
      return this
    }, this)
  }

  MsgInv.prototype.toInvs = function () {
    let br = BR(this.databuf)
    let len = br.readVarintNum()
    let invs = []
    for (let i = 0; i < len; i++) {
      let invbuf = br.read(4 + 32)
      let inv = Inv().fromBuffer(invbuf)
      invs.push(inv)
    }
    return invs
  }

  MsgInv.prototype.isValid = function () {
    return this.getCmd() === 'inv'
  }

  return MsgInv
}

inject = require('injecter')(inject, dependencies)
let MsgInv = inject()
MsgInv.Mainnet = inject({
  Msg: require('./msg').Mainnet
})
MsgInv.Testnet = inject({
  Msg: require('./msg').Testnet
})
module.exports = MsgInv