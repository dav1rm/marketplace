const Ad = require('../models/Ad')
const User = require('../models/User')
const Purchase = require('../models/Purchase')
const PurchaseMail = require('../jobs/PurchaseMail')
const Queue = require('../services/Queue')

class PurchaseController {
  async store (req, res) {
    const { ad, content } = req.body

    const purchaseAd = await Ad.findById(ad).populate('author')

    if (purchaseAd.purchasedBy) {
      return res.status(400).json({ error: 'Ad already sold' })
    }

    const user = await User.findById(req.userId)

    await Purchase.create({
      content,
      ad,
      user: req.userId
    })

    Queue.create(PurchaseMail.key, {
      ad: purchaseAd,
      user,
      content
    }).save()

    return res.send()
  }

  async update (req, res) {
    const purchase = await Purchase.findById(req.params.id)

    const ad = await Ad.findByIdAndUpdate(
      purchase.ad,
      { purchasedBy: req.params.id },
      {
        new: true
      }
    )

    return res.json(ad)
  }
}

module.exports = new PurchaseController()
